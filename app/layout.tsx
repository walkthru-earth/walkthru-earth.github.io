import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { quicksand } from './fonts';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { SmoothScroll } from '@/components/shared/smooth-scroll';
import { PostHogProvider, PostHogPageView } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Walkthru - People-First Urban Intelligence',
  description:
    'Revealing hidden patterns in cities to build resilient, sustainable, and happier communities through data-driven insights.',
  keywords:
    'urban wellbeing, livability index, city data, sustainable communities, urban analytics',
  authors: [{ name: 'Walkthru' }],
  creator: 'Walkthru',
  metadataBase: new URL('https://walkthru.earth'),
  openGraph: {
    title: 'Walkthru - People-First Urban Intelligence',
    description: 'Transform cities through data-driven wellbeing solutions',
    url: 'https://walkthru.earth',
    siteName: 'Walkthru',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Walkthru - People-First Urban Intelligence',
    description: 'Transform cities through data-driven wellbeing solutions',
    creator: '@walkthru_earth',
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
    name: 'Walkthru',
    alternateName: 'Walkthru Earth',
    url: 'https://walkthru.earth',
    logo: 'https://walkthru.earth/icon.svg',
    description:
      'People-first urban intelligence platform revealing hidden patterns in cities to build resilient, sustainable, and happier communities through data-driven insights.',
    sameAs: [
      'https://github.com/walkthru-earth',
      'https://www.linkedin.com/company/walkthru-earth/',
      'https://source.coop/walkthru',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'General Inquiries',
      url: 'https://walkthru.earth/#contact',
    },
    founder: {
      '@type': 'Organization',
      name: 'Walkthru',
    },
    knowsAbout: [
      'Urban Planning',
      'Data Analytics',
      'Livability Index',
      'Wellbeing Metrics',
      'Sustainable Cities',
      'Urban Resilience',
      'Geospatial Data',
      'Open Data',
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
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
