import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CapyBrain - Urban Wellbeing Research | walkthru.earth',
  description:
    'An emerging research initiative exploring urban environments and everyday wellbeing, with planned resident surveys and an experimental street imagery model.',
  keywords:
    'urban wellbeing, environmental data, resident surveys, street imagery, urban research, neighborhood experience',
  alternates: {
    canonical: 'https://walkthru.earth/capybrain',
  },
  openGraph: {
    title: 'CapyBrain - Urban Wellbeing Research',
    description:
      'Explore an early street imagery experiment and our plans to study environmental conditions alongside residents’ experiences.',
    url: 'https://walkthru.earth/capybrain',
    siteName: 'walkthru.earth',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://walkthru.earth/mascots/capybara.webp',
        width: 768,
        height: 768,
        alt: 'CapyBrain capybara mascot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CapyBrain - Urban Wellbeing Research',
    description:
      'An emerging research initiative exploring urban environments, residents’ experiences, and everyday wellbeing.',
    creator: '@walkthru_earth',
    images: ['https://walkthru.earth/mascots/capybara.webp'],
  },
};

export default function CapyBrainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
