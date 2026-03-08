import type { Metadata } from 'next'
import { Geist, Geist_Mono, Amiri, Scheherazade_New, Noto_Naskh_Arabic } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WebsiteJsonLd } from '@/components/seo/json-ld'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getLocale, isRtl } from '@/lib/i18n'
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
})

// Scheherazade New: specifically designed for Quranic Uthmani script,
// covers Arabic Extended-A (U+08A0–U+08FF) for diacritics Amiri lacks.
const scheherazade = Scheherazade_New({
  variable: '--font-scheherazade',
  subsets: ['arabic'],
  weight: ['400', '700'],
})

// Noto Naskh Arabic: zero-tofu fallback — covers any glyphs Scheherazade
// subset may miss, including U+08F0–08F2 (Open tanwin marks).
const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: '--font-noto-arabic',
  subsets: ['arabic'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
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
    url: 'https://islam.wiki',
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

  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} ${scheherazade.variable} ${notoNaskhArabic.variable} font-sans antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-iw-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-black"
        >
          Skip to content
        </a>
        <WebsiteJsonLd />
        <Header />
        <main id="main-content" className="min-h-screen pt-20">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
