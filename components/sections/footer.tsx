import { Container } from '@/components/shared/container';
import Link from 'next/link';
import {
  Github,
  Linkedin,
  Mail,
  Youtube,
  Instagram,
  Facebook,
} from 'lucide-react';

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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

function BlueskyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 530"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <Container>
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="mb-6 text-3xl font-semibold md:text-4xl">
                walkthru.earth
              </h3>
              <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
                Building people-first solutions from hidden patterns of daily
                life to improve wellbeing in cities worldwide.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-6 text-xl font-semibold">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/#patterns"
                    className="text-muted-foreground hover:text-primary text-lg transition-colors"
                  >
                    Patterns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/opensensor"
                    className="text-muted-foreground hover:text-primary text-lg transition-colors"
                  >
                    OpenSensor
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hormones-cities"
                    className="text-muted-foreground hover:text-primary text-lg transition-colors"
                  >
                    Hormones & Cities
                  </Link>
                </li>
                <li>
                  <Link
                    href="/software"
                    className="text-muted-foreground hover:text-primary text-lg transition-colors"
                  >
                    Software
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#vision"
                    className="text-muted-foreground hover:text-primary text-lg transition-colors"
                  >
                    Vision
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="mb-6 text-xl font-semibold">Connect</h4>
              <div className="space-y-4">
                <a
                  href="mailto:hi@walkthru.earth"
                  className="text-muted-foreground hover:text-primary flex items-center gap-3 text-lg transition-colors"
                >
                  <Mail className="h-6 w-6" />
                  <span>hi@walkthru.earth</span>
                </a>
                <div className="flex flex-wrap gap-6">
                  <a
                    href="https://github.com/walkthru-earth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github className="h-7 w-7" />
                    <span className="sr-only">GitHub</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/walkthru-earth/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-7 w-7" />
                    <span className="sr-only">LinkedIn</span>
                  </a>
                  <a
                    href="https://www.youtube.com/@walkthru-earth/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Youtube className="h-7 w-7" />
                    <span className="sr-only">YouTube</span>
                  </a>
                  <a
                    href="https://www.instagram.com/walkthru.earth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Instagram className="h-7 w-7" />
                    <span className="sr-only">Instagram</span>
                  </a>
                  <a
                    href="https://www.facebook.com/walkthru.earth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Facebook className="h-7 w-7" />
                    <span className="sr-only">Facebook</span>
                  </a>
                  <a
                    href="https://x.com/walkthru_earth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <XIcon className="h-7 w-7" />
                    <span className="sr-only">X (Twitter)</span>
                  </a>
                  <a
                    href="https://bsky.app/profile/walkthru.earth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <BlueskyIcon className="h-7 w-7" />
                    <span className="sr-only">Bluesky</span>
                  </a>
                  <a
                    href="https://www.tiktok.com/@walkthru.earth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <TikTokIcon className="h-7 w-7" />
                    <span className="sr-only">TikTok</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="text-muted-foreground mt-12 border-t pt-8 text-center text-base">
            <p>
              © {new Date().getFullYear()} walkthru.earth. Licensed under CC BY
              4.0.
            </p>
            <p className="mt-2">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
