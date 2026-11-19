"use server";

import { revalidatePath } from "next/cache";
import { undoAuditEntry } from "@/lib/audit/undo";
import { revalidateEntireSite } from "@/lib/cms/revalidate";
import type { CmsActionState } from "@/app/admin/(dashboard)/services/actions";

export async function undoAuditEntryAction(entryId: string): Promise<CmsActionState> {
  const result = await undoAuditEntry(entryId);
  if (!result.success) return { error: result.error };

  revalidatePath("/admin/audit");
  revalidatePath("/admin", "layout");
  // Undo is rare and can touch any content type (or a shared heading), so the
  // whole public site is refreshed; pages re-render lazily on their next visit.
  revalidateEntireSite();
  return { success: "Change undone. The live site shows the previous version now." };
}
