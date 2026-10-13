'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, ExternalLink, MessageCircle, QrCode } from 'lucide-react';
import { Linkedin } from '@/components/shared/brand-icons';
import { BrandHero } from '@/components/shared/brand-ui';
import { businessWhatsApp, founders } from '@/lib/founders';
import { Localized, useI18n } from '@/lib/i18n/i18n-provider';

const contactClassName =
  'brand-panel brand-solid brand-tone-spatial focus-visible:ring-ring flex min-h-16 items-center justify-center gap-3 p-4 text-lg font-bold transition-transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-offset-4 motion-reduce:transform-none';

export function LinksProfileLoading() {
  return (
    <Localized>
      <BrandHero
        tone="spatial"
        decorative={false}
        className="mb-8 rounded-[2rem] px-6 py-8 text-center"
      >
        <p role="status">Loading profile…</p>
      </BrandHero>
    </Localized>
  );
}

export function LinksProfile() {
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const profile = founders.find(
    (founder) => founder.id === searchParams.get('profile')
  );
  const email = profile?.email ?? 'hi@walkthru.earth';
  const whatsappUrl = `${businessWhatsApp.url}?text=${encodeURIComponent(
    t(profile?.whatsappGreeting ?? 'Hello!')
  )}`;

  return (
    <Localized>
      <BrandHero
        tone="spatial"
        decorative={false}
        className="mb-5 rounded-[2rem] px-6 py-8 text-center"
      >
        <Link
          href="/"
          aria-label="walkthru.earth home"
          className="focus-visible:ring-ring inline-flex items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-offset-4"
        >
          <Image
            src="/icon.svg"
            alt=""
            width={48}
            height={48}
            className="bg-background h-12 w-12 rounded-2xl border-2 p-2"
          />
          {profile && (
            <span className="text-base font-bold" translate="no">
              walkthru.earth
            </span>
          )}
        </Link>
        {profile ? (
          <>
            <Image
              src={profile.image}
              alt={profile.alt}
              width={112}
              height={112}
              priority
              className="border-secondary mx-auto mt-6 h-28 w-28 rounded-full border-2 object-cover"
            />
            <h1 className="mt-4 text-[clamp(1.75rem,6vw,2.5rem)]!">
              {profile.name}
            </h1>
            <p className="mt-2 text-base font-bold">{profile.role}</p>
          </>
        ) : (
          <h1
            className="mt-4 text-[clamp(2rem,7vw,3rem)]! break-all"
            translate="no"
          >
            walkthru.earth
          </h1>
        )}
        <Link
          href={profile ? `/links?profile=${profile.id}&qr=1` : '/links?qr=1'}
          className="bg-background focus-visible:ring-ring mt-5 inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-bold focus-visible:ring-2 focus-visible:ring-offset-4"
        >
          <QrCode className="h-4 w-4" aria-hidden="true" />
          Show QR code
        </Link>
      </BrandHero>

      <div className="mb-8 space-y-3">
        <a
          href={`mailto:${email}`}
          aria-label={profile?.emailLabel}
          className={contactClassName}
        >
          <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
          <bdi className="min-w-0 [overflow-wrap:anywhere]" translate="no">
            {email}
          </bdi>
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={contactClassName}
        >
          <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 text-center">
            <span className="block">Chat on WhatsApp</span>
            <bdi className="block text-sm" translate="no">
              {businessWhatsApp.handle}
            </bdi>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
        </a>
        {profile && (
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={profile.linkedinLabel}
            className={contactClassName}
          >
            <Linkedin className="h-5 w-5 shrink-0" aria-hidden="true" />
            LinkedIn
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </Localized>
  );
}
