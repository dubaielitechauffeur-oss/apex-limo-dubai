import { Resend } from "resend";
import { resetPasswordEmailHtml } from "@/lib/email-templates";
import { assertResendConfigured, formatSubmittedAt, FROM_ADDRESS } from "@/lib/notifications";

/** Sends a password reset link to the account holder via the same verified
 *  Resend sending domain the lead-notification emails use. */
export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  assertResendConfigured();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "Reset your Apex Limo admin password",
    html: resetPasswordEmailHtml(resetUrl, formatSubmittedAt()),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
