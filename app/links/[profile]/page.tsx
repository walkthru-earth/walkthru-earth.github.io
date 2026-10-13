import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { founders, findFounder } from '@/lib/founders';
import { cards, socialMetadata } from '@/lib/social-preview/cards';
import LinksPage from '../links-page';

export const dynamicParams = false;

export function generateStaticParams() {
  return founders.map(({ id }) => ({ profile: id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ profile: string }>;
}): Promise<Metadata> {
  const { profile } = await params;
  if (!findFounder(profile)) notFound();
  return {
    title: cards[profile].title,
    description: cards[profile].description,
    ...socialMetadata(profile),
  };
}

export default async function FounderLinksPage({
  params,
}: {
  params: Promise<{ profile: string }>;
}) {
  const { profile } = await params;
  const founder = findFounder(profile);
  if (!founder) notFound();
  return <LinksPage profile={founder} />;
}
