import { Container } from '@/components/shared/container';
import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <Container>
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="text-3xl md:text-4xl font-semibold mb-6">walkthru.earth</h3>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                Building people-first solutions from hidden patterns of daily
                life to improve wellbeing in cities worldwide.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/#patterns"
                    className="text-lg text-muted-foreground hover:text-primary transition-colors"
                  >
                    Patterns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/opensensor"
                    className="text-lg text-muted-foreground hover:text-primary transition-colors"
                  >
                    OpenSensor
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hormones-cities"
                    className="text-lg text-muted-foreground hover:text-primary transition-colors"
                  >
                    Hormones & Cities
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#vision"
                    className="text-lg text-muted-foreground hover:text-primary transition-colors"
                  >
                    Vision
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-xl font-semibold mb-6">Connect</h4>
              <div className="space-y-4">
                <a
                  href="mailto:hi@walkthru.earth"
                  className="flex items-center gap-3 text-lg text-muted-foreground hover:text-primary transition-colors"
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
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-base text-muted-foreground">
            <p>
              © {new Date().getFullYear()} walkthru.earth. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
