import { cards } from '@/lib/social-preview/cards';
import { renderSocialCard } from '@/lib/social-preview/render-card';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(cards).map((id) => ({ image: `${id}.png` }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ image: string }> }
) {
  const { image } = await params;
  const id = image.endsWith('.png') ? image.slice(0, -4) : '';
  if (!cards[id]) return new Response('Not found', { status: 404 });
  return renderSocialCard(id);
}
