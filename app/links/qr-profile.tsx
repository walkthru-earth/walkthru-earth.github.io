'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BrandHero } from '@/components/shared/brand-ui';
import { Localized, useI18n } from '@/lib/i18n/i18n-provider';
import { founderPath, type Founder } from '@/lib/founders';

export function QRProfile({ profile }: { profile?: Founder }) {
  const { t } = useI18n();
  const name = profile?.name ?? 'walkthru.earth';
  const email = profile?.email ?? 'hi@walkthru.earth';
  const profilePath = founderPath(profile);
  // Always share the public contact page, excluding QR mode and tracking params.
  const profileUrl = `https://walkthru.earth${profilePath}`;

  return (
    <Localized>
      <Link
        href={profilePath}
        aria-label="Back to links"
        className="bg-background focus-visible:ring-ring fixed start-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full border-2 focus-visible:ring-2 focus-visible:ring-offset-4"
      >
        <ArrowLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
      </Link>
      <div className="mx-auto flex min-h-dvh max-w-md items-center px-4 py-24">
        <BrandHero
          tone="spatial"
          decorative={false}
          aria-labelledby="qr-profile-name"
          className="w-full rounded-[2rem] px-6 py-8 text-center"
        >
          <Link
            href={profilePath}
            aria-label="Open full profile"
            className="focus-visible:ring-ring mx-auto block max-w-[17.5rem] overflow-hidden rounded-2xl focus-visible:ring-2 focus-visible:ring-offset-4"
          >
            <QRCodeSVG
              value={profileUrl}
              size={280}
              level="M"
              marginSize={4}
              title={t('QR code for {name}', { name: t(name) })}
              role="img"
              className="h-auto w-full"
            />
          </Link>
          <div className="mt-6 flex items-center justify-center gap-3">
            {profile && (
              <Image
                src={profile.image}
                alt=""
                width={48}
                height={48}
                className="border-secondary h-12 w-12 shrink-0 rounded-full border-2 object-cover"
              />
            )}
            <h1
              id="qr-profile-name"
              className="text-start text-[clamp(1.5rem,6vw,2rem)]!"
            >
              {name}
            </h1>
          </div>
          <a
            href={`mailto:${email}`}
            aria-label={profile?.emailLabel}
            className="focus-visible:ring-ring mt-3 inline-block max-w-full rounded-sm text-base font-semibold underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-4"
          >
            <bdi className="[overflow-wrap:anywhere]" translate="no">
              {email}
            </bdi>
          </a>
        </BrandHero>
      </div>
    </Localized>
  );
}
