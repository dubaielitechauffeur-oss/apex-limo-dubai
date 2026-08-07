import { StatusBadge, type StatusTone } from "@/components/admin/ui/StatusBadge";
import { SelectField, FormField } from "@/components/admin/ui/FormField";

export const PUBLISH_STATUS_TONE: Record<string, StatusTone> = {
  draft: "neutral",
  published: "success",
  archived: "warning",
};

export function PublishStatusBadge({ status }: { status: string }) {
  return <StatusBadge label={status} tone={PUBLISH_STATUS_TONE[status] ?? "neutral"} />;
}

/** Draft/Published/Archived selector every CMS form uses — the one
 *  `PublishStatus` enum already defined in the schema (Phase 2B), not a
 *  new draft/live concept invented for this phase. */
export function PublishStatusSelect({ id = "status", defaultValue = "draft" }: { id?: string; defaultValue?: string }) {
  return (
    <FormField id={id} label="Status" hint="Only Published content appears on the public site.">
      <SelectField id={id} defaultValue={defaultValue}>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </SelectField>
    </FormField>
  );
}
