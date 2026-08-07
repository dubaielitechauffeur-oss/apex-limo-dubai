import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { listFaqCategories, listFaqParentOptions } from "@/lib/cms/faq";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { FaqForm } from "@/components/admin/cms/FaqForm";

export const metadata: Metadata = { title: "New FAQ — Admin" };

export default async function NewFaqPage() {
  await requirePermission(PERMISSIONS.FAQ_CREATE);
  const [categoriesResult, parentOptionsResult] = await Promise.all([listFaqCategories(), listFaqParentOptions()]);

  return (
    <div>
      <PageHeader title="New FAQ" breadcrumbs={[{ label: "FAQs", href: "/admin/faq" }, { label: "New" }]} />
      <FaqForm
        faq={null}
        categories={categoriesResult.success ? categoriesResult.data : []}
        parentOptions={parentOptionsResult.success ? parentOptionsResult.data : { vehicles: [], services: [], locations: [] }}
      />
    </div>
  );
}
