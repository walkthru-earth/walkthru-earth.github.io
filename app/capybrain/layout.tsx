import { socialMetadata } from '@/lib/social-preview/cards';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CapyBrain - Urban Wellbeing Research | walkthru.earth',
  description:
    'An emerging research initiative exploring urban environments and everyday wellbeing, with planned resident surveys and an experimental street imagery model.',
  keywords:
    'urban wellbeing, environmental data, resident surveys, street imagery, urban research, neighborhood experience',
  ...socialMetadata('capybrain'),
};

export default function CapyBrainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
