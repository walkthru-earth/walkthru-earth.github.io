'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Mail, Globe, Heart, ExternalLink } from 'lucide-react';
import {
  Github,
  Linkedin,
  Youtube,
  Instagram,
  Facebook,
} from '@/components/shared/brand-icons';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { LanguageSelector } from '@/components/navigation/language-selector';
import { Localized } from '@/lib/i18n/i18n-provider';
import { BrandHero, BrandPage, BrandPanel } from '@/components/shared/brand-ui';

const mainLinks = [
  {
    title: 'Website',
    description: 'Our main website',
    url: '/',
    icon: Globe,
    color: 'brand-tone-green',
    internal: true,
  },
  {
    title: 'OpenSensor.Space',
    description: 'Open environmental monitoring',
    url: 'https://opensensor.space',
    image: '/opensensor-icon-512.png',
    color: 'brand-tone-opensensor',
  },
  {
    title: 'Hormones & Cities',
    description: 'Urban environments and wellbeing research',
    url: '/hormones-cities',
    icon: Heart,
    color: 'brand-tone-wellbeing',
    internal: true,
  },
  {
    title: 'Open Data',
    description: 'Datasets on Source Cooperative',
    url: 'https://source.coop/walkthru-earth',
    image: '/source-coop-logo.png',
    color: 'brand-tone-ink',
  },
  {
    title: 'Presentations',
    description: 'Our talks and slides',
    url: 'https://walkthru.earth/talks',
    icon: ExternalLink,
    color: 'brand-tone-amber',
  },
];

const socialLinks = [
  {
    title: 'GitHub',
    url: 'https://github.com/walkthru-earth',
    icon: Github,
    hoverColor: 'hover:bg-foreground hover:text-background',
  },
  {
    title: 'LinkedIn',
    url: 'https://www.linkedin.com/company/walkthru-earth/',
    icon: Linkedin,
    hoverColor: 'hover:bg-blue-600 hover:text-primary-foreground',
  },
  {
    title: 'YouTube',
    url: 'https://www.youtube.com/@walkthru-earth/',
    icon: Youtube,
    hoverColor: 'hover:bg-red-600 hover:text-primary-foreground',
  },
  {
    title: 'Instagram',
    url: 'https://www.instagram.com/walkthru.earth',
    icon: Instagram,
    hoverColor: 'hover:bg-pink-600 hover:text-primary-foreground',
  },
  {
    title: 'Facebook',
    url: 'https://www.facebook.com/walkthru.earth',
    icon: Facebook,
    hoverColor: 'hover:bg-blue-500 hover:text-primary-foreground',
  },
  {
    title: 'X (Twitter)',
    url: 'https://x.com/walkthru_earth',
    iconPath: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    hoverColor: 'hover:bg-foreground hover:text-background',
  },
  {
    title: 'Bluesky',
    url: 'https://bsky.app/profile/walkthru.earth',
    iconPath: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
      </svg>
    ),
    hoverColor: 'hover:bg-blue-400 hover:text-primary-foreground',
  },
  {
    title: 'TikTok',
    url: 'https://www.tiktok.com/@walkthru.earth',
    iconPath: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
    hoverColor: 'hover:bg-foreground hover:text-background',
  },
];

export default function LinksPage() {
  return (
    <Localized>
      <BrandPage className="bg-background min-h-dvh">
        <div className="bg-background fixed end-4 top-4 z-50 flex items-center gap-1 rounded-full border-2 p-1">
          <LanguageSelector compact />
          <ThemeToggle />
        </div>

        <div className="mx-auto max-w-xl px-4 pt-24 pb-12">
          {/* Profile Header */}
          <BrandHero
            tone="green"
            className="mb-8 rounded-[2rem] px-6 py-12 text-center"
          >
            <Link href="/" className="inline-block">
              <Image
                src="/icon.svg"
                alt="walkthru.earth"
                width={80}
                height={80}
                className="bg-background mx-auto mb-5 rounded-3xl border-2 p-3"
              />
            </Link>
            <h1 className="text-[clamp(2rem,7vw,3rem)]! break-all">
              walkthru.earth
            </h1>
            <p className="mt-3 text-lg font-bold">
              Open tools for the relationships between people and places.
            </p>
          </BrandHero>

          {/* Main Links */}
          <div className="mb-8 space-y-3">
            {mainLinks.map((link) => {
              const content = (
                <>
                  {link.image ? (
                    <Image
                      src={link.image}
                      alt={link.title}
                      width={24}
                      height={24}
                      className="h-6 w-6"
                    />
                  ) : link.icon ? (
                    <link.icon className="h-6 w-6" />
                  ) : null}
                  <div className="flex-1">
                    <div className="text-xl font-bold">{link.title}</div>
                    <div className="text-base opacity-80">
                      {link.description}
                    </div>
                  </div>
                  {!link.internal && (
                    <ExternalLink className="h-5 w-5 shrink-0" />
                  )}
                </>
              );
              const cls = `brand-panel brand-solid flex items-center gap-4 p-5 transition-transform hover:-translate-y-1 motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 ${link.color}`;

              return link.internal ? (
                <Link key={link.title} href={link.url} className={cls}>
                  {content}
                </Link>
              ) : (
                <a
                  key={link.title}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cls}
                >
                  {content}
                </a>
              );
            })}
          </div>

          {/* Contact */}
          <div className="mb-8">
            <a
              href="mailto:hi@walkthru.earth"
              className="brand-panel brand-solid brand-tone-green focus-visible:ring-ring flex items-center justify-center gap-2 p-5 text-lg font-bold transition-transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-offset-4 motion-reduce:transform-none"
            >
              <Mail className="h-5 w-5" />
              hi@walkthru.earth
            </a>
          </div>

          {/* Social Links */}
          <BrandPanel className="mb-8">
            <p className="mb-5 text-center text-lg font-bold">Follow us</p>
            <div className="flex flex-wrap justify-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.title}
                  className={`bg-background text-foreground border-border focus-visible:ring-ring flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 ${link.hoverColor}`}
                >
                  {link.icon ? (
                    <link.icon className="h-5 w-5" />
                  ) : (
                    link.iconPath
                  )}
                </a>
              ))}
            </div>
          </BrandPanel>

          {/* Footer */}
          <div className="text-muted-foreground text-center text-base">
            <p className="mt-1 opacity-60">
              © {new Date().getFullYear()} walkthru.earth
            </p>
          </div>
        </div>
      </BrandPage>
    </Localized>
  );
}
