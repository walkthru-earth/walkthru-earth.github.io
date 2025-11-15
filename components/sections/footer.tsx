import { Container } from '@/components/shared/container';
import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-semibold mb-4">Walkthru</h3>
              <p className="text-muted-foreground max-w-sm">
                Building people-first solutions from hidden patterns of daily
                life to improve wellbeing in cities worldwide.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#patterns"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Patterns
                  </Link>
                </li>
                <li>
                  <Link
                    href="#indices"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Indices
                  </Link>
                </li>
                <li>
                  <Link
                    href="#vision"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Vision
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="space-y-3">
                <a
                  href="mailto:hi@walkthru.earth"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span className="text-sm">hi@walkthru.earth</span>
                </a>
                <div className="flex gap-4">
                  <a
                    href="https://github.com/walkthru-earth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github className="h-5 w-5" />
                    <span className="sr-only">GitHub</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/walkthru-earth/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Walkthru. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
