/**
 * ConsentBannerIsland.tsx — global GDPR consent banner island for islam.wiki.
 *
 * PURPOSE: Renders the @ummat/consent CookieBanner inside its ConsentProvider so
 *          the consent UI is available on every page. Hydrated client-only because
 *          @ummat/consent reads browser-only consent storage and must not SSR.
 * INPUTS:  none (region/strings use library defaults; privacy + cookie policy URLs
 *          point at the local /privacy and /cookies pages).
 * OUTPUTS: The cookie consent banner (renders null until consent is needed).
 * CONSTRAINTS:
 *   - Must be mounted with client:only="react" in Base.astro — no SSR.
 *   - Ported from the Next.js app/layout.tsx <ConsentProvider><CookieBanner/> shell
 *     (D-P2-STACK-CANON migration). Keeps the Consent Banner Gate satisfied.
 * REF: S05-12 consent gate · Next->Astro migration
 */

import { ConsentProvider, CookieBanner } from '@ummat/consent'

export default function ConsentBannerIsland() {
  return (
    <ConsentProvider>
      <CookieBanner privacyPolicyUrl="/privacy" cookiePolicyUrl="/cookies" />
    </ConsentProvider>
  )
}
