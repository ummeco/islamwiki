/**
 * HadithActionsIsland.tsx — Astro island for hadith copy/share actions
 *
 * PURPOSE: Re-exports the framework-independent components/hadith/HadithActions.tsx
 *          ('use client', no next/* imports) so the Astro page imports it from the
 *          conventional src/components island location. Logic is reused verbatim.
 * REF: reuses components/hadith/HadithActions.tsx · D-P2-STACK-CANON
 */
'use client'

export { HadithActions } from '@/components/hadith/HadithActions'
