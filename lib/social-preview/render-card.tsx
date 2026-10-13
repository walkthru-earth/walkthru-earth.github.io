/* oxlint-disable next/no-img-element -- ImageResponse renders PNGs, not browser HTML; next/image is unsupported. */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import sharp from 'sharp';
import { brandPalettes, projectPalette } from '../brand';
import { findFounder } from '../founders';
import { cards, socialImageSize } from './cards';

/** All inputs are local. This runs at build time, without remote asset fetches. */
async function artworkData(path: string, size: number): Promise<string> {
  const image = await sharp(join(process.cwd(), 'public', path))
    .rotate()
    .resize(size, size, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer();
  return `data:image/png;base64,${image.toString('base64')}`;
}

export async function renderSocialCard(id: string): Promise<ImageResponse> {
  const card = cards[id];
  if (!card) throw new Error(`Unknown social card: ${id}`);
  const colors = card.project
    ? projectPalette(card.project, 'light')
    : brandPalettes[card.palette ?? 'spatial'].light;
  const [medium, bold, artwork, logo] = await Promise.all([
    readFile(join(process.cwd(), 'app/fonts/Quicksand-500.ttf')),
    readFile(join(process.cwd(), 'app/fonts/Quicksand-700.ttf')),
    card.artwork ? artworkData(card.artwork, 700) : undefined,
    artworkData('/icon.svg', 80),
  ]);
  const founder = findFounder(id);
  const softwareIcons =
    card.visual === 'software'
      ? await Promise.all([
          artworkData('/software/imagery-desktop/appicon.png', 160),
          artworkData('/software/objex/appicon.svg', 160),
        ])
      : [];

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: colors.paper,
        color: colors.text,
        fontFamily: 'Quicksand',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          right: -100,
          top: -90,
          width: 580,
          height: 810,
          borderRadius: 290,
          background: colors.surface,
          transform: 'rotate(18deg)',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 720,
          padding: '48px 0 46px 60px',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          <img src={logo} alt="" width={42} height={42} />
          walkthru.earth
        </div>
        <div style={{ display: 'flex', marginTop: 42 }}>
          <div
            style={{
              display: 'flex',
              background: colors.main,
              color: colors.ink,
              borderRadius: 30,
              padding: '10px 20px',
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {card.eyebrow}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 22,
            width: 650,
            fontSize: card.heading.length > 24 ? 57 : 68,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-2px',
          }}
        >
          {card.heading}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 20,
            width: 600,
            fontSize: 28,
            lineHeight: 1.35,
            color: colors.muted,
          }}
        >
          {founder ? `${founder.role} at walkthru.earth` : card.description}
        </div>
        {card.detail && (
          <div
            style={{
              display: 'flex',
              marginTop: 22,
              fontSize: 22,
              fontWeight: 700,
              color: colors.deep,
            }}
          >
            {card.detail}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            marginTop: 'auto',
            paddingTop: 24,
            fontSize: 20,
            fontWeight: 700,
            color: colors.muted,
          }}
        >{`walkthru.earth${card.path === '/' ? '' : card.path}`}</div>
      </div>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          right: 25,
          top: 100,
          width: 430,
          height: 440,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {artwork ? (
          <img
            src={artwork}
            alt=""
            width={
              card.visual === 'portrait'
                ? 340
                : card.visual === 'product'
                  ? 250
                  : 430
            }
            height={
              card.visual === 'portrait'
                ? 340
                : card.visual === 'product'
                  ? 250
                  : 430
            }
            style={{
              objectFit:
                card.visual === 'portrait' || card.visual === 'globe'
                  ? 'cover'
                  : 'contain',
              borderRadius:
                card.visual === 'portrait'
                  ? '50%'
                  : card.visual === 'globe'
                    ? 44
                    : 0,
              ...(card.visual === 'portrait'
                ? { border: `10px solid ${colors.main}` }
                : {}),
            }}
          />
        ) : card.visual === 'software' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {softwareIcons.map((src, index) => (
              <div
                key={src}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                <img src={src} alt="" width={110} height={110} />
                {index === 0 ? 'Imagery Desktop' : 'objex'}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 250,
                height: 250,
                borderRadius: 70,
                background: colors.main,
                transform: 'rotate(-8deg)',
              }}
            >
              <img src={logo} alt="" width={150} height={150} />
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                fontWeight: 700,
                color: colors.deep,
              }}
            >
              People · Places · Evidence
            </div>
          </div>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          bottom: 0,
          height: 12,
          width: '100%',
          background: colors.main,
        }}
      />
    </div>,
    {
      ...socialImageSize,
      fonts: [
        { name: 'Quicksand', data: medium, weight: 500, style: 'normal' },
        { name: 'Quicksand', data: bold, weight: 700, style: 'normal' },
      ],
    }
  );
}
