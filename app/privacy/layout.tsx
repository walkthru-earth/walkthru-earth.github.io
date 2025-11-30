import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | walkthru.earth',
  description:
    'Our commitment to your privacy and data protection. Learn how walkthru.earth collects, uses, and protects your information across our urban intelligence platforms.',
  keywords:
    'privacy policy, data protection, GDPR, cookie policy, IoT privacy, urban data, walkthru.earth',
  alternates: {
    canonical: 'https://walkthru.earth/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | walkthru.earth',
    description:
      'Our commitment to your privacy and data protection. Learn how we handle your information.',
    url: 'https://walkthru.earth/privacy',
    siteName: 'walkthru.earth',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://walkthru.earth/og-image.png',
        width: 1200,
        height: 630,
        alt: 'walkthru.earth Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | walkthru.earth',
    description:
      'Our commitment to your privacy and data protection. Learn how we handle your information.',
    creator: '@walkthru_earth',
    images: ['https://walkthru.earth/og-image.png'],
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
