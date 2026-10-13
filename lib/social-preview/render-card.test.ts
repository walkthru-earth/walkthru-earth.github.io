import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { cards } from './cards';
import { renderSocialCard } from './render-card';

describe('build-time sharing images', () => {
  it.each(Object.keys(cards))(
    'renders %s as an opaque landscape PNG',
    async (id) => {
      const response = await renderSocialCard(id);
      expect(response.headers.get('content-type')).toBe('image/png');
      const bytes = Buffer.from(await response.arrayBuffer());
      const image = sharp(bytes);
      const metadata = await image.metadata();
      expect(metadata.format).toBe('png');
      expect([metadata.width, metadata.height]).toEqual([1200, 630]);
      const stats = await image.stats();
      if (metadata.hasAlpha) expect(stats.channels[3].min).toBe(255);
      expect(bytes.length).toBeLessThan(1_000_000);
    }
  );
});
