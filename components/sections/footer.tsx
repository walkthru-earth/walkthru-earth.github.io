import { Container } from '@/components/shared/container';
import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';

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
                <div className="flex gap-6">
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
                    href="https://bsky.app/profile/walkthru-earth.bsky.social"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <BlueskyIcon className="h-7 w-7" />
                    <span className="sr-only">Bluesky</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="text-muted-foreground mt-12 border-t pt-8 text-center text-base">
            <p>
              © {new Date().getFullYear()} walkthru.earth. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
