import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { quicksand } from './fonts';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { SmoothScroll } from '@/components/shared/smooth-scroll';
import { PostHogProvider, PostHogPageView } from './providers';
import { ConsentInit } from '@/components/consent-init';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import './globals.css';

export const metadata: Metadata = {
  title: 'walkthru.earth - People-First Urban Intelligence',
  description:
    'Detecting hidden patterns of daily life and turning them into people-first solutions that support wellbeing in cities globally. Building infrastructure and tools to understand and improve urban life.',
  keywords:
    'urban wellbeing, livability index, city data, sustainable communities, urban analytics, IoT sensors, environmental monitoring',
  authors: [{ name: 'walkthru.earth' }],
  creator: 'walkthru.earth',
  metadataBase: new URL('https://walkthru.earth'),
  alternates: {
    canonical: 'https://walkthru.earth',
  },
  openGraph: {
    title: 'walkthru.earth - People-First Urban Intelligence',
    description:
      'Detecting hidden patterns of daily life and turning them into people-first solutions for urban wellbeing',
    url: 'https://walkthru.earth',
    siteName: 'walkthru.earth',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://walkthru.earth/og-image.png',
        width: 1200,
        height: 630,
        alt: 'walkthru.earth - People-First Urban Intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'walkthru.earth - People-First Urban Intelligence',
    description:
      'Detecting hidden patterns of daily life and turning them into people-first solutions for urban wellbeing',
    creator: '@walkthru_earth',
    images: ['https://walkthru.earth/og-image.png'],
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
      'Detecting hidden patterns of daily life and turning them into people-first solutions that support wellbeing in cities globally. Building infrastructure and tools to understand and improve urban life since March 2025.',
    sameAs: [
      'https://github.com/walkthru-earth',
      'https://www.linkedin.com/company/walkthru-earth/',
      'https://source.coop/walkthru',
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
    <html lang="en" suppressHydrationWarning className={quicksand.variable}>
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
        </PostHogProvider>
        <GoogleAnalytics gaId="G-CZBNSV0DW4" />
      </body>
    </html>
  );
}
