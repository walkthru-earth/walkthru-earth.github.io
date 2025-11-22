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
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Logo size="md" showText />

          <div className="flex items-center gap-4 md:gap-8">
            {/* Desktop Navigation */}
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
                        <div className="font-medium">OpenSensor.Space</div>
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

            <Button asChild className="gap-2 hidden sm:flex">
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
                  <SheetDescription>Navigate to different sections</SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link
                    href="/#patterns"
                    className="flex items-center gap-3 text-lg font-medium py-3 px-4 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Patterns
                  </Link>

                  <div className="border-t pt-2">
                    <div className="text-sm font-semibold text-muted-foreground px-4 mb-2">
                      Initiatives
                    </div>
                    <Link
                      href="/opensensor"
                      className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Cloud className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">OpenSensor.Space</div>
                        <div className="text-sm text-muted-foreground">
                          Weather Station Network
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/hormones-cities"
                      className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart className="h-5 w-5 text-secondary" />
                      <div>
                        <div className="font-medium">Hormones & Cities</div>
                        <div className="text-sm text-muted-foreground">Urban Wellbeing Survey</div>
                      </div>
                    </Link>
                  </div>

                  <Link
                    href="/#vision"
                    className="flex items-center gap-3 text-lg font-medium py-3 px-4 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Vision
                  </Link>

                  <Button asChild className="gap-2 mt-4">
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
