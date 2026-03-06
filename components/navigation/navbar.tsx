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
import {
  ExternalLink,
  ChevronDown,
  Globe,
  Cloud,
  Heart,
  Menu,
  Download,
} from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between md:h-20">
          <Logo size="md" showText />

          <div className="flex items-center gap-3 md:gap-6">
            {/* Desktop Navigation */}
            <div className="hidden items-center gap-6 md:flex">
              <Link
                href="/indices"
                className="hover:text-primary text-sm font-medium transition-colors"
              >
                Globe Explorer
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors">
                  More
                  <ChevronDown className="h-3.5 w-3.5" />
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
                          Weather stations
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
                          Urban wellbeing
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/software"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Download className="text-primary h-4 w-4" />
                      <div>
                        <div className="font-medium">Software</div>
                        <div className="text-muted-foreground text-xs">
                          Tools & apps
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link
                href="/about"
                className="hover:text-primary text-sm font-medium transition-colors"
              >
                About
              </Link>
            </div>

            <ThemeToggle />

            <Button asChild size="sm" className="hidden gap-2 sm:flex">
              <Link
                href="https://source.coop/walkthru-earth"
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
                <span className="hidden sm:inline">Data</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Site navigation
                  </SheetDescription>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  <Link
                    href="/indices"
                    className="hover:bg-accent flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Globe className="text-primary h-4 w-4" />
                    Globe Explorer
                  </Link>
                  <Link
                    href="/opensensor"
                    className="hover:bg-accent flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Cloud className="text-primary h-4 w-4" />
                    OpenSensor
                  </Link>
                  <Link
                    href="/hormones-cities"
                    className="hover:bg-accent flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="text-secondary h-4 w-4" />
                    Hormones & Cities
                  </Link>
                  <Link
                    href="/software"
                    className="hover:bg-accent flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Download className="text-primary h-4 w-4" />
                    Software
                  </Link>

                  <div className="my-2 border-t" />

                  <Link
                    href="/about"
                    className="hover:bg-accent flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>

                  <Button asChild size="sm" className="mt-4 gap-2">
                    <Link
                      href="https://source.coop/walkthru-earth"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        src="/source-coop-logo.png"
                        alt="Source Cooperative"
                        width={20}
                        height={20}
                        className="rounded-sm"
                      />
                      Browse datasets
                      <ExternalLink className="h-3.5 w-3.5" />
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
