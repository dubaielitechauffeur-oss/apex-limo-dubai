import { headers } from "next/headers";
import { GoogleAnalytics } from "@next/third-parties/google";
import { requiresAnalyticsConsent } from "@/lib/consent";
import ConsentBanner from "./ConsentBanner";

/**
 * Measurement ID. Read from the environment so a staging or preview
 * deployment can point at a separate property (or none) instead of polluting
 * production analytics — it was previously hardcoded in the root layout, which
 * made that impossible. The literal below is this site's existing production
 * ID, kept as the default so behaviour is unchanged when the variable is unset.
 */
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-B37R3PW9NG";

/**
 * Consent Mode v2 defaults, applied BEFORE the gtag script loads.
 *
 * Everything starts denied for visitors who need to opt in, so no analytics
 * cookie is written until they accept. `wait_for_update` gives the banner's
 * decision a moment to arrive before gtag commits to the default, which is
 * what stops a returning visitor's stored "granted" being missed on a fast
 * page load.
 *
 * A static string with no interpolation of request or user data — the only
 * variable is the boolean below, and it is stringified from a value this
 * module computes, never from input.
 */
function consentDefaultScript(requiresConsent: boolean): string {
  const state = requiresConsent ? "denied" : "granted";
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'analytics_storage':'${state}','ad_storage':'${state}','ad_user_data':'${state}','ad_personalization':'${state}','wait_for_update':500});`;
}

/**
 * Analytics for the public site: Consent Mode defaults, the GA4 tag, and the
 * consent prompt where one is legally required.
 *
 * Region comes from the CDN geo header rather than the locale — a German
 * speaker browsing from Dubai is not covered by GDPR, and an English speaker
 * in Ireland is. `x-vercel-ip-country` is set by Vercel's edge; other hosts
 * commonly set `cf-ipcountry`. When neither is present, `requiresAnalyticsConsent`
 * fails closed and shows the banner.
 *
 * This is a Server Component, so the geo lookup costs no client JavaScript and
 * the consent default is in the initial HTML — ahead of the tag it governs.
 */
export default async function Analytics() {
  const requestHeaders = await headers();
  const country =
    requestHeaders.get("x-vercel-ip-country") ?? requestHeaders.get("cf-ipcountry");
  const requiresConsent = requiresAnalyticsConsent(country);

  return (
    <>
      <script
        id="consent-defaults"
        // Static, self-authored string — see consentDefaultScript above.
        dangerouslySetInnerHTML={{ __html: consentDefaultScript(requiresConsent) }}
      />
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      <ConsentBanner required={requiresConsent} />
    </>
  );
}
