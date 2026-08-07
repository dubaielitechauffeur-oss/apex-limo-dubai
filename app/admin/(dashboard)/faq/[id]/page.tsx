import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/permissions/guard";
import { hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getFaq, listFaqCategories, listFaqParentOptions } from "@/lib/cms/faq";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { FaqForm } from "@/components/admin/cms/FaqForm";
import { FaqDeleteButton } from "@/components/admin/cms/FaqDeleteButton";

export const metadata: Metadata = { title: "Edit FAQ — Admin" };

interface FaqDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function FaqDetailPage({ params }: FaqDetailPageProps) {
  const ctx = await requirePermission(PERMISSIONS.FAQ_READ);
  const { id } = await params;

  const [result, categoriesResult, parentOptionsResult] = await Promise.all([getFaq(id), listFaqCategories(), listFaqParentOptions()]);

  if (!result.success) {
    if (result.error === "FAQ not found.") notFound();
    return (
      <div>
        <PageHeader title="FAQ" breadcrumbs={[{ label: "FAQs", href: "/admin/faq" }, { label: "Details" }]} />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const faq = result.data;
  const canManage = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.FAQ_UPDATE);
  const canDelete = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.FAQ_DELETE);

  return (
    <div>
      <PageHeader title={faq.question.en || "FAQ"} breadcrumbs={[{ label: "FAQs", href: "/admin/faq" }, { label: faq.question.en || "Details" }]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {canManage ? (
            <FaqForm
              faq={faq}
              categories={categoriesResult.success ? categoriesResult.data : []}
              parentOptions={parentOptionsResult.success ? parentOptionsResult.data : { vehicles: [], services: [], locations: [] }}
            />
          ) : (
            <ErrorState title="Read-only" description="You do not have permission to edit FAQs." />
          )}
        </div>

        {canDelete ? (
          <div>
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Actions</h2>
              <div className="mt-4">
                <FaqDeleteButton id={id} />
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
