'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/shared/container';
import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExternalLink, ChevronDown, Cloud, Heart } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Logo size="md" showText />

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/#patterns"
                className="text-base font-medium transition-colors hover:text-primary"
              >
                Patterns
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-base font-medium transition-colors hover:text-primary">
                  Initiatives
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/opensensor" className="flex items-center gap-2 cursor-pointer">
                      <Cloud className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-medium">OpenSensor.Earth</div>
                        <div className="text-xs text-muted-foreground">
                          Weather Station Network
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/hormones-cities"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Heart className="h-4 w-4 text-secondary" />
                      <div>
                        <div className="font-medium">Hormones & Cities</div>
                        <div className="text-xs text-muted-foreground">Urban Wellbeing Survey</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link
                href="/#vision"
                className="text-base font-medium transition-colors hover:text-primary"
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
                  width={24}
                  height={24}
                  className="rounded-sm"
                />
                <span className="hidden sm:inline">Explore Data</span>
                <span className="sm:hidden">Data</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </nav>
  );
}
