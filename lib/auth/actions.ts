"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AuthError, CredentialsSignin } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword, passwordPolicySchema } from "@/lib/auth/password";
import { generateResetToken, hashResetToken, RESET_TOKEN_TTL_MS } from "@/lib/auth/tokens";
import { isForgotPasswordRateLimited } from "@/lib/auth/rate-limit";
import { sendPasswordResetEmail } from "@/lib/auth/email";

/**
 * Server Actions behind `/admin`'s auth forms. Next.js already validates the
 * `Origin` header against the deployment's own host for every Server Action
 * POST (rejecting cross-site form submissions before this code runs), so no
 * separate CSRF token is threaded through these forms — that protection is
 * the framework's, not hand-rolled here.
 */

// ── Login ──────────────────────────────────────────────────────────────────

export interface LoginState {
  error?: string;
}

/** Keyed by the `code` set on each `CredentialsSignin` subclass in
 *  lib/auth/index.ts — deliberately generic about *why* credentials were
 *  rejected (never "no such user" vs "wrong password") to avoid handing an
 *  attacker an account-enumeration oracle. */
const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Incorrect email or password.",
  account_locked: "This account is temporarily locked after repeated failed attempts. Try again in 15 minutes.",
  account_inactive: "This account is inactive. Contact an administrator.",
  rate_limited: "Too many attempts. Please wait a few minutes and try again.",
};

/** Only ever redirect somewhere inside `/admin` after login — `callbackUrl`
 *  is attacker-influenced (it round-trips through the login page's URL), so
 *  treating it as a full open redirect target would let a phishing link
 *  bounce a successful login to an external site. */
function safeAdminPath(value: FormDataEntryValue | null): string {
  const path = typeof value === "string" ? value : "";
  if (path.startsWith("/admin") && !path.startsWith("//")) return path;
  return "/admin";
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rememberMe = formData.get("rememberMe") === "on";
  const callbackUrl = safeAdminPath(formData.get("callbackUrl"));

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      rememberMe: rememberMe ? "true" : "false",
      redirect: false,
    });
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return { error: LOGIN_ERROR_MESSAGES[error.code] ?? "Something went wrong. Please try again." };
    }
    if (error instanceof AuthError) {
      return { error: "Something went wrong. Please try again." };
    }
    throw error;
  }

  redirect(callbackUrl);
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirect: false });
  redirect("/admin/login");
}

// ── Forgot password ──────────────────────────────────────────────────────

export interface ForgotPasswordState {
  submitted?: boolean;
  error?: string;
}

async function resolveOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const proto = requestHeaders.get("x-forwarded-proto") ?? "https";
  const host = requestHeaders.get("host") ?? requestHeaders.get("x-forwarded-host");
  return host ? `${proto}://${host}` : "";
}

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const requestHeaders = await headers();

  if (isForgotPasswordRateLimited(requestHeaders)) {
    return { error: "Too many requests. Please wait a while and try again." };
  }
  if (!email) {
    return { error: "Enter your email address." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.isActive && !user.deletedAt) {
    const { token, tokenHash } = generateResetToken();

    // Any previous unused token for this user is invalidated by the new
    // request — only the most recently requested link should ever work.
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
      prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
      }),
    ]);

    const origin = await resolveOrigin();
    const resetUrl = `${origin}/admin/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (error) {
      // Delivery failure must not leak through the generic response, or it
      // becomes a side channel confirming the email exists. Logged for ops
      // to notice in server logs instead.
      console.error("[auth] Failed to send password reset email:", error);
      // Same graceful-degradation pattern as assertResendConfigured in
      // lib/notifications.ts — without a working Resend key there's no
      // other way to retrieve the link, so print it for local development.
      if (process.env.NODE_ENV !== "production") {
        console.log(`[auth] (dev only) Password reset link: ${resetUrl}`);
      }
    }
  }

  return { submitted: true, error: undefined };
}

// ── Reset password ───────────────────────────────────────────────────────

export interface ResetPasswordState {
  error?: string;
  success?: boolean;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const INVALID_LINK_MESSAGE = "This reset link is invalid or has expired.";

  if (!token) {
    return { error: INVALID_LINK_MESSAGE };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }
  const parsed = passwordPolicySchema.safeParse(password);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Password does not meet requirements." };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
    include: { user: true },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt.getTime() < Date.now() ||
    !resetToken.user.isActive ||
    resetToken.user.deletedAt
  ) {
    return { error: INVALID_LINK_MESSAGE };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      // A reset also clears any active lockout — proving control of the
      // mailbox is at least as strong a signal as the lockout it replaces.
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId, usedAt: null },
    }),
  ]);

  return { success: true };
}

// ── Change password (authenticated) ──────────────────────────────────────

export interface ChangePasswordState {
  error?: string;
  success?: boolean;
}

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const sessionUser = await requireUser();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }
  const parsed = passwordPolicySchema.safeParse(newPassword);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Password does not meet requirements." };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!dbUser?.passwordHash || !(await verifyPassword(dbUser.passwordHash, currentPassword))) {
    return { error: "Current password is incorrect." };
  }
  if (await verifyPassword(dbUser.passwordHash, newPassword)) {
    return { error: "New password must be different from your current password." };
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: sessionUser.id }, data: { passwordHash } });

  return { success: true };
}
