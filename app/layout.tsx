import type { Metadata, Viewport } from 'next';
import { quicksand } from './fonts';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { SmoothScroll } from '@/components/shared/smooth-scroll';
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
  return (
    <html lang="en" suppressHydrationWarning className={quicksand.variable}>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SmoothScroll />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
