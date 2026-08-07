import { Construction } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";

/** Shared "Coming Soon" screen for modules whose CRUD isn't built yet (see
 *  Phase 5's explicit phase boundary in ADMIN_PANEL.md). The route itself
 *  still calls `requirePermission` before rendering this — a placeholder
 *  page is not an exemption from the five-level protection model. */
export function ModulePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <PageHeader title={title} subtitle={description} />
      <EmptyState
        icon={Construction}
        title="Coming soon"
        description={`${title} management will be available in a future phase of the admin panel.`}
      />
    </div>
  );
}
