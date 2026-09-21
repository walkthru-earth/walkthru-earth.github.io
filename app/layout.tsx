import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { cairo, quicksand } from './fonts';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { SmoothScroll } from '@/components/shared/smooth-scroll';
import { PostHogProvider, PostHogPageView } from './providers';
import { ConsentInit } from '@/components/consent-init';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import { I18nProvider } from '@/lib/i18n/i18n-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'walkthru.earth - Health, Wellbeing & the Places We Live',
  description:
    'Open environmental data, monitoring, and tools to understand how the places we live shape human health and everyday wellbeing.',
  keywords:
    'urban wellbeing, livability index, city data, sustainable communities, urban analytics, IoT sensors, environmental monitoring',
  authors: [{ name: 'walkthru.earth' }],
  creator: 'walkthru.earth',
  metadataBase: new URL('https://walkthru.earth'),
  alternates: {
    canonical: 'https://walkthru.earth',
  },
  openGraph: {
    title: 'walkthru.earth - Health, Wellbeing & the Places We Live',
    description:
      'Open environmental data and tools to understand the places we live, with human health and wellbeing at the center.',
    url: 'https://walkthru.earth',
    siteName: 'walkthru.earth',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://walkthru.earth/globe-preview-dark.png',
        width: 1755,
        height: 1369,
        alt: 'walkthru.earth environmental data globe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'walkthru.earth - Health, Wellbeing & the Places We Live',
    description:
      'Open environmental data and tools to understand the places we live, with human health and wellbeing at the center.',
    creator: '@walkthru_earth',
    images: ['https://walkthru.earth/globe-preview-dark.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF9' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'walkthru.earth',
    url: 'https://walkthru.earth',
    logo: 'https://walkthru.earth/icon.svg',
    description:
      'Open environmental data, monitoring, and tools to understand how the places we live shape human health and everyday wellbeing.',
    sameAs: [
      'https://github.com/walkthru-earth',
      'https://www.linkedin.com/company/walkthru-earth/',
      'https://source.coop/walkthru-earth',
      'https://bsky.app/profile/walkthru-earth.bsky.social',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'General Inquiries',
      url: 'https://walkthru.earth/#contact',
    },
    foundingDate: '2025-03',
    knowsAbout: [
      'Urban Wellbeing',
      'IoT Sensors',
      'Environmental Monitoring',
      'Data Analytics',
      'Livability Index',
      'Sustainable Cities',
      'Urban Resilience',
      'Open Data',
      'Cloud-Native Architecture',
    ],
  };

  return (
    <html
      data-scroll-behavior="smooth"
      lang="en"
      suppressHydrationWarning
      className={`${quicksand.variable} ${cairo.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased">
        <ConsentInit />
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <I18nProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SmoothScroll />
              {children}
              <CookieConsentBanner />
            </ThemeProvider>
          </I18nProvider>
        </PostHogProvider>
        <GoogleAnalytics gaId="G-CZBNSV0DW4" />
      </body>
    </html>
  );
}
