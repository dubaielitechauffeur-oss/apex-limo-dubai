import type { Metadata } from "next";
import { requirePermission } from "@/lib/permissions/guard";
import { hasPermission, isSuperAdmin } from "@/lib/permissions/context";
import { PERMISSIONS } from "@/lib/permissions/catalog";
import { getGlobalSettings } from "@/lib/admin/settings";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { SettingsSection, SettingsField } from "@/components/admin/settings/SettingsSection";
import { GlobalSettingsForm } from "@/components/admin/settings/GlobalSettingsForm";

export const metadata: Metadata = { title: "Settings — Admin" };

function JsonPreview({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <span className="text-gray-400">—</span>;
  return (
    <pre className="max-h-40 overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-600">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default async function SettingsPage() {
  const ctx = await requirePermission(PERMISSIONS.SETTINGS_READ);
  const result = await getGlobalSettings();

  if (!result.success) {
    return (
      <div>
        <PageHeader title="Settings" />
        <ErrorState description={result.error} />
      </div>
    );
  }

  const settings = result.data;
  const canUpdate = isSuperAdmin(ctx) || hasPermission(ctx, PERMISSIONS.SETTINGS_UPDATE);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Company identity, contact details, and site-wide configuration." />

      <div className="space-y-4">
        {canUpdate ? (
          <GlobalSettingsForm settings={settings} />
        ) : (
          <>
            <SettingsSection title="General" description="Company identity and display basics.">
              {settings ? (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SettingsField label="Company name" value={settings.companyName} />
                  <SettingsField label="Short name" value={settings.shortName} />
                  <SettingsField label="Default currency" value={settings.defaultCurrency} />
                  <SettingsField label="Timezone" value={settings.timezone} />
                  <SettingsField label="Fleet size display" value={settings.fleetSizeDisplay} />
                  <SettingsField label="Rating display" value={settings.ratingDisplay} />
                </dl>
              ) : (
                <p className="text-sm text-gray-400">Not configured.</p>
              )}
            </SettingsSection>

            <SettingsSection title="Contact" description="Public-facing contact details.">
              {settings ? (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SettingsField label="Phone" value={settings.phone} />
                  <SettingsField label="Phone (display)" value={settings.phoneDisplay} />
                  <SettingsField label="WhatsApp" value={settings.whatsapp} />
                  <SettingsField label="Email" value={settings.email} />
                  <SettingsField label="Notification email" value={settings.notificationEmail} />
                </dl>
              ) : (
                <p className="text-sm text-gray-400">Not configured.</p>
              )}
            </SettingsSection>
          </>
        )}

        <SettingsSection title="Social" description="Linked social profiles.">
          {settings ? <JsonPreview value={settings.socialLinks} /> : <p className="text-sm text-gray-400">Not configured.</p>}
        </SettingsSection>

        <SettingsSection title="Business" description="Operating hours and footer content.">
          {settings ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SettingsField label="Business hours" value={<JsonPreview value={settings.businessHours} />} />
              <SettingsField label="Footer" value={<JsonPreview value={settings.footer} />} />
            </div>
          ) : (
            <p className="text-sm text-gray-400">Not configured.</p>
          )}
        </SettingsSection>

        <SettingsSection title="SEO" description="Site-wide default SEO metadata — edit this from the SEO Manager module.">
          {settings ? <JsonPreview value={settings.defaultSeo} /> : <p className="text-sm text-gray-400">Not configured.</p>}
        </SettingsSection>

        <SettingsSection title="Notifications" description="WhatsApp greeting and notification routing." comingSoon>
          {settings?.whatsappGreeting ? <JsonPreview value={settings.whatsappGreeting} /> : null}
        </SettingsSection>

        <SettingsSection
          title="Security"
          description="Password policy, session lifetime, and lockout thresholds are enforced in code today (see AUTHENTICATION.md, RBAC.md). No editable security settings exist in the database yet."
          comingSoon
        />
      </div>
    </div>
  );
}
