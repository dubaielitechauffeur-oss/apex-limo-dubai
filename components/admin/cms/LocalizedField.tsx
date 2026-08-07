import { routing } from "@/i18n/routing";
import { LOCALE_LABELS, type LocalizedText } from "@/lib/cms/localized";
import { FormField, ADMIN_INPUT_CLASSES } from "@/components/admin/ui/FormField";

/** 6-locale field grid — same convention Phase 6's `MediaEditForm` used for
 *  alt/caption, generalized so every CMS form shares one implementation.
 *  `prefix` becomes each input's `name` (`<prefix>_<locale>`), read back by
 *  `readLocalizedField()`/`readSeoField()` server-side. */
export function LocalizedField({
  prefix,
  label,
  value,
  multiline,
  required,
  hint,
}: {
  prefix: string;
  label: string;
  value?: LocalizedText;
  multiline?: boolean;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </h3>
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {routing.locales.map((locale) => {
          const id = `${prefix}_${locale}`;
          const isDefault = locale === routing.defaultLocale;
          return (
            <FormField key={locale} id={id} label={LOCALE_LABELS[locale]} required={required && isDefault}>
              {multiline ? (
                <textarea
                  id={id}
                  name={id}
                  rows={3}
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  defaultValue={value?.[locale] ?? ""}
                  className={ADMIN_INPUT_CLASSES}
                />
              ) : (
                <input
                  id={id}
                  name={id}
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  defaultValue={value?.[locale] ?? ""}
                  className={ADMIN_INPUT_CLASSES}
                />
              )}
            </FormField>
          );
        })}
      </div>
    </div>
  );
}
