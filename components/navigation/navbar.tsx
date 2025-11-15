'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/shared/container';
import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Logo size="md" showText />

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="#patterns"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Patterns
              </Link>
              <Link
                href="#indices"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Indices
              </Link>
              <Link
                href="#vision"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Vision
              </Link>
            </div>

            <ThemeToggle />

            <Button asChild className="gap-2">
              <Link
                href="https://source.coop/walkthru"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Image
                  src="/source-coop-logo.png"
                  alt="Source Cooperative"
                  width={20}
                  height={20}
                  className="rounded-sm"
                />
                <span className="hidden sm:inline">Explore Your Data</span>
                <span className="sm:hidden">Your Data</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </nav>
  );
}
