import type { Metadata } from 'next'
import Script from 'next/script'
import { ThemeProvider } from 'next-themes'
import { Geist, Geist_Mono, Amiri, Scheherazade_New, Noto_Naskh_Arabic } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WebsiteJsonLd } from '@/components/seo/json-ld'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getLocale, isRtl } from '@/lib/i18n'
import { headers } from 'next/headers'
// S05-06: @ummat/consent — anonymous-visitor default; explicit-opt-in per D-P3-21
import { ConsentProvider, CookieBanner } from '@ummat/consent'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const amiri = Amiri({
  variable: '--font-amiri',
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
  preload: false, // Arabic font — not needed on non-Arabic pages
})

// Scheherazade New: specifically designed for Quranic Uthmani script,
// covers Arabic Extended-A (U+08A0–U+08FF) for diacritics Amiri lacks.
const scheherazade = Scheherazade_New({
  variable: '--font-scheherazade',
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
  preload: false, // Arabic font — not needed on non-Arabic pages
})

// Noto Naskh Arabic: zero-tofu fallback — covers any glyphs Scheherazade
// subset may miss, including U+08F0–08F2 (Open tanwin marks).
const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: '--font-noto-arabic',
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
  preload: false, // Arabic font — not needed on non-Arabic pages
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://islam.wiki'),
  title: {
    default: 'Islam.wiki — The Islamic Reference',
    template: '%s · Islam.wiki',
  },
  description:
    'The most comprehensive Islamic knowledge base. Quran with tafsir, authentic Hadith with isnad analysis, scholar biographies, classical books, and encyclopedic articles. Multilingual. Scholar-verified. Free forever.',
  keywords: [
    'Islam',
    'Quran',
    'Hadith',
    'Islamic',
    'Wiki',
    'Tafsir',
    'Sunnah',
    'Bukhari',
    'Muslim',
    'Fiqh',
    'Seerah',
    'Islamic scholars',
    'Islamic books',
    'Islamic encyclopedia',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '64x64 48x48 32x32 16x16', type: 'image/x-icon' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'manifest', url: '/manifest.webmanifest' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_BASE_URL ?? 'https://islam.wiki',
    siteName: 'Islam.wiki',
    title: 'Islam.wiki — The Islamic Reference',
    description:
      'Quran, Hadith, Seerah, classical books, and encyclopedic articles. Free forever.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Islam.wiki — The Islamic Reference',
    description:
      'Quran, Hadith, Seerah, classical books, and encyclopedic articles. Free forever.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const dir = isRtl(locale) ? 'rtl' : 'ltr'
  // Read CSP nonce propagated by middleware via x-nonce request header.
  // The nonce is set on <body> so Next.js can attach it to any inline styles
  // it injects during hydration. See middleware.ts buildCsp() for style-src.
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html lang={locale} dir={dir}>
      <head>
        {/* CSP nonce propagated to any inline style/script tags injected by Next.js
            during server rendering. Nonce is generated per-request in middleware.ts */}
        {nonce && <meta name="csp-nonce" content={nonce} />}
        {/* D-P3-21: Umami analytics script */}
        <Script
          async
          src="https://cloud.umami.is/script.js"
          data-website-id="<UMAMI_WEBSITE_ID>"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} ${scheherazade.variable} ${notoNaskhArabic.variable} font-sans antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-iw-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-black"
        >
          Skip to content
        </a>
        {/* S05-06: ConsentProvider — anonymous visitors default; explicit-opt-in per D-P3-21.
            islamwiki: no user accounts = minimal data collection. */}
        <ConsentProvider>
          <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
            <WebsiteJsonLd />
            <Header />
            <main id="main-content" className="min-h-screen pt-20">{children}</main>
            <Footer />
          </ThemeProvider>
          {/* S30-T03: GDPR/CCPA cookie banner — Umami fires only after analytics consent. */}
          <CookieBanner
            privacyPolicyUrl="/legal/privacy"
            cookiePolicyUrl="/legal/cookies"
          />
        </ConsentProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
