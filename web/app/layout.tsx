import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WebsiteJsonLd } from '@/components/seo/json-ld'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <WebsiteJsonLd />
        <Header />
        <main className="min-h-screen pt-20">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
