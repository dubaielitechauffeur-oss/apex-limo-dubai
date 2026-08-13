"use server";

import { revalidatePath } from "next/cache";
import { setContactStatus, deleteContact } from "@/lib/admin/contacts";
import type { ContactSubmissionStatus } from "@/lib/generated/prisma/client";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

export type { CmsActionState };

export async function setContactStatusAction(id: string, status: ContactSubmissionStatus): Promise<CmsActionState> {
  const result = await setContactStatus(id, status);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${id}`);
  revalidatePath("/admin");
  return { success: `Status changed to ${status.replace(/_/g, " ")}.` };
}

export async function deleteContactAction(id: string): Promise<CmsActionState> {
  const result = await deleteContact(id);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
  return { success: "Contact submission deleted." };
}
