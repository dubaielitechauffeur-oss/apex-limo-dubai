import { GoogleAnalytics } from "@next/third-parties/google";
import { CONSENT_REQUIRED_COUNTRIES } from "@/lib/consent";
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
 * Whether consent is required is decided IN THE BROWSER from the `apex-geo`
 * cookie that middleware sets (see lib/consent.ts for why this is not a
 * server-side header read). No cookie / unknown country fails closed: denied.
 *
 * The script is a static string. The only interpolated value is the
 * country list, produced by JSON.stringify from this repo's own constant —
 * never from request or user data.
 */
const CONSENT_DEFAULT_SCRIPT = (() => {
  const countries = JSON.stringify([...CONSENT_REQUIRED_COUNTRIES]);
  return (
    "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}" +
    "(function(){var c='';try{var m=document.cookie.match(/(?:^|;\\s*)apex-geo=([A-Za-z]{2})(?:;|$)/);if(m)c=m[1].toUpperCase();}catch(e){}" +
    `var s=(!c||${countries}.indexOf(c)!==-1)?'denied':'granted';` +
    "gtag('consent','default',{'analytics_storage':s,'ad_storage':s,'ad_user_data':s,'ad_personalization':s,'wait_for_update':500});})();"
  );
})();

/**
 * Analytics for the public site: Consent Mode defaults, the GA4 tag, and the
 * consent prompt where one is legally required.
 *
 * Region comes from the CDN geo header (stamped into a cookie by middleware)
 * rather than the locale — a German speaker browsing from Dubai is not covered
 * by GDPR, and an English speaker in Ireland is. `x-vercel-ip-country` is set
 * by Vercel's edge; other hosts commonly set `cf-ipcountry`.
 *
 * This is deliberately NOT async and reads no request data: it must not make
 * the pages that render it dynamic, so they can be served from the ISR cache.
 */
export default function Analytics() {
  return (
    <>
      <script
        id="consent-defaults"
        // Static, self-authored string — see CONSENT_DEFAULT_SCRIPT above.
        dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }}
      />
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      <ConsentBanner />
    </>
  );
}
