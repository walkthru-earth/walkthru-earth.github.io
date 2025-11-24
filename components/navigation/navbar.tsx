'use client';

import { useState } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ExternalLink, ChevronDown, Cloud, Heart, Menu } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Logo size="md" showText />

          <div className="flex items-center gap-4 md:gap-8">
            {/* Desktop Navigation */}
            <div className="hidden items-center gap-8 md:flex">
              <Link
                href="/#patterns"
                className="hover:text-primary text-base font-medium transition-colors"
              >
                Patterns
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="hover:text-primary flex items-center gap-1 text-base font-medium transition-colors">
                  Initiatives
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/opensensor"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Cloud className="text-primary h-4 w-4" />
                      <div>
                        <div className="font-medium">OpenSensor.Space</div>
                        <div className="text-muted-foreground text-xs">
                          Weather Station Network
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/hormones-cities"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Heart className="text-secondary h-4 w-4" />
                      <div>
                        <div className="font-medium">Hormones & Cities</div>
                        <div className="text-muted-foreground text-xs">
                          Urban Wellbeing Survey
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link
                href="/#vision"
                className="hover:text-primary text-base font-medium transition-colors"
              >
                Vision
              </Link>
            </div>

            <ThemeToggle />

            <Button asChild className="hidden gap-2 sm:flex">
              <Link
                href="https://source.coop/walkthru-earth"
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
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Navigate to different sections
                  </SheetDescription>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-4">
                  <Link
                    href="/#patterns"
                    className="hover:bg-accent flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Patterns
                  </Link>

                  <div className="border-t pt-2">
                    <div className="text-muted-foreground mb-2 px-4 text-sm font-semibold">
                      Initiatives
                    </div>
                    <Link
                      href="/opensensor"
                      className="hover:bg-accent flex items-center gap-3 rounded-lg px-4 py-3 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Cloud className="text-primary h-5 w-5" />
                      <div>
                        <div className="font-medium">OpenSensor.Space</div>
                        <div className="text-muted-foreground text-sm">
                          Weather Station Network
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/hormones-cities"
                      className="hover:bg-accent flex items-center gap-3 rounded-lg px-4 py-3 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart className="text-secondary h-5 w-5" />
                      <div>
                        <div className="font-medium">Hormones & Cities</div>
                        <div className="text-muted-foreground text-sm">
                          Urban Wellbeing Survey
                        </div>
                      </div>
                    </Link>
                  </div>

                  <Link
                    href="/#vision"
                    className="hover:bg-accent flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Vision
                  </Link>

                  <Button asChild className="mt-4 gap-2">
                    <Link
                      href="https://source.coop/walkthru-earth"
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
                      Explore Data
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </nav>
  );
}
