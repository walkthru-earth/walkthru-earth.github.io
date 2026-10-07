import { Container } from '@/components/shared/container';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import {
  Github,
  Linkedin,
  Youtube,
  Instagram,
  Facebook,
} from '@/components/shared/brand-icons';
import { Localized } from '@/lib/i18n/i18n-provider';
import { copyrightYear } from '@/lib/copyright';

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function BlueskyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const socials = [
  { href: 'https://github.com/walkthru-earth', icon: Github, label: 'GitHub' },
  {
    href: 'https://www.linkedin.com/company/walkthru-earth/',
    icon: Linkedin,
    label: 'LinkedIn',
  },
  { href: 'https://x.com/walkthru_earth', icon: XIcon, label: 'X' },
  {
    href: 'https://www.youtube.com/@walkthru-earth/',
    icon: Youtube,
    label: 'YouTube',
  },
  {
    href: 'https://www.instagram.com/walkthru.earth',
    icon: Instagram,
    label: 'Instagram',
  },
  {
    href: 'https://www.facebook.com/walkthru.earth',
    icon: Facebook,
    label: 'Facebook',
  },
  {
    href: 'https://bsky.app/profile/walkthru.earth',
    icon: BlueskyIcon,
    label: 'Bluesky',
  },
  {
    href: 'https://www.tiktok.com/@walkthru.earth',
    icon: TikTokIcon,
    label: 'TikTok',
  },
];

export function Footer() {
  return (
    <Localized>
      <footer className="bg-foreground text-background border-t-2">
        <Container>
          <div className="py-12 md:py-16">
            <div className="flex flex-col gap-10 md:flex-row md:justify-between">
              {/* Brand */}
              <div className="max-w-sm">
                <h3 className="mb-4 text-3xl font-bold">walkthru.earth</h3>
                <p className="text-background/75 text-lg leading-relaxed">
                  Open tools for the relationships between people and places.
                </p>
              </div>

              {/* Links */}
              <div className="flex gap-16">
                <div>
                  <h4 className="mb-3 text-base font-bold">Product</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/indices"
                        prefetch={false}
                        className="text-background/75 hover:text-background text-base transition-colors"
                      >
                        Globe Explorer
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/opensensor"
                        className="text-background/75 hover:text-background text-base transition-colors"
                      >
                        OpenSensor
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/software"
                        className="text-background/75 hover:text-background text-base transition-colors"
                      >
                        Software
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 text-base font-bold">Company</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/about"
                        className="text-background/75 hover:text-background text-base transition-colors"
                      >
                        About
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy"
                        className="text-background/75 hover:text-background text-base transition-colors"
                      >
                        Privacy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/links"
                        className="text-background/75 hover:text-background text-base transition-colors"
                      >
                        All links
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Connect */}
              <div>
                <h4 className="mb-3 text-base font-bold">Connect</h4>
                <a
                  href="mailto:hi@walkthru.earth"
                  className="text-background/75 hover:text-background mb-3 flex items-center gap-2 text-base transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  hi@walkthru.earth
                </a>
                <div className="flex flex-wrap gap-3">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-background/75 hover:text-background transition-colors"
                    >
                      <s.icon className="h-5 w-5" />
                      <span className="sr-only">{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-background/75 border-background/20 mt-10 border-t pt-6 text-center text-sm">
              © {copyrightYear} walkthru.earth · CC BY 4.0
            </div>
          </div>
        </Container>
      </footer>
    </Localized>
  );
}
