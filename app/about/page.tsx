'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ExternalLink, Globe, Mail } from 'lucide-react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Container } from '@/components/shared/container';
import { GradientText } from '@/components/shared/gradient-text';
import {
  BrandPage,
  BrandHero,
  BrandSection,
  BrandEyebrow,
} from '@/components/shared/brand-ui';
import { Linkedin } from '@/components/shared/brand-icons';
import { vision, mission } from '@/lib/strategy';
import { StrategicGoals } from '@/components/strategy/strategic-goals';
import { ChangeFramework } from '@/components/strategy/change-framework';
import { PolicyAlignment } from '@/components/strategy/policy-alignment';
import { OpenEcosystem } from '@/components/strategy/open-ecosystem';
import { Button } from '@/components/ui/button';
import { Localized } from '@/lib/i18n/i18n-provider';

const pageSections = [
  { href: '#purpose', label: 'Our purpose' },
  { href: '#goals', label: 'Our goals' },
  { href: '#change', label: 'How change happens' },
  { href: '#alignment', label: 'Policy alignment' },
];

const founders = [
  {
    name: 'Youssef Harby',
    image: '/youssef-harby.jpg',
    alt: 'Youssef Harby',
    linkedin: 'https://www.linkedin.com/in/yharby/',
    linkedinLabel: 'Youssef Harby on LinkedIn',
    email: 'yharby@walkthru.earth',
    emailLabel: 'Email Youssef Harby',
  },
  {
    name: 'Mishka Mendbayar',
    image: '/mishka-mendbayar.jpg',
    alt: 'Myagmarjargal Mendbayar (Mishka)',
    linkedin: 'https://www.linkedin.com/in/myagmarjargal-mendbayar001/',
    linkedinLabel: 'Mishka Mendbayar on LinkedIn',
    email: 'mishka@walkthru.earth',
    emailLabel: 'Email Mishka Mendbayar',
  },
];

export default function AboutPage() {
  return (
    <Localized>
      <>
        <Navbar />
        <BrandPage>
          <BrandHero tone="amber" id="purpose" className="scroll-mt-24">
            <Container className="relative">
              <div className="max-w-4xl">
                <BrandEyebrow>Our vision</BrandEyebrow>
                <h1 className="max-w-5xl text-3xl leading-tight font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {vision}
                </h1>
                <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed md:text-xl">
                  {mission}
                </p>
                <nav
                  aria-label="About page sections"
                  className="border-border/70 mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t pt-5"
                >
                  {pageSections.map(({ href, label }) => (
                    <a
                      key={href}
                      href={href}
                      className="border-solid-foreground/30 bg-background text-foreground hover:bg-foreground hover:text-background focus-visible:ring-ring rounded-full border-2 px-4 py-2 text-base font-bold transition-colors focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
            </Container>
          </BrandHero>

          <BrandSection
            id="goals"
            className="bg-muted/25 scroll-mt-24 border-y py-14 md:py-20"
          >
            <Container>
              <StrategicGoals />
            </Container>
          </BrandSection>

          <BrandSection id="change" className="scroll-mt-24 py-14 md:py-20">
            <Container>
              <ChangeFramework />
            </Container>
          </BrandSection>

          <BrandSection
            id="alignment"
            className="bg-muted/25 scroll-mt-24 border-y py-14 md:py-20"
          >
            <Container>
              <PolicyAlignment />
            </Container>
          </BrandSection>

          <BrandSection className="border-t py-14 md:py-20">
            <Container>
              <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-14">
                <div>
                  <h2 className="max-w-sm text-2xl font-bold tracking-tight md:text-3xl">
                    Who&apos;s behind walkthru.earth
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-6 sm:gap-12">
                  {founders.map((founder) => (
                    <div
                      key={founder.name}
                      className="flex flex-col items-start"
                    >
                      <div className="border-secondary relative h-28 w-28 overflow-hidden rounded-full border-2 sm:h-36 sm:w-36">
                        <Image
                          src={founder.image}
                          alt={founder.alt}
                          fill
                          sizes="(min-width: 640px) 144px, 112px"
                          className="object-cover"
                        />
                      </div>
                      <h3 className="mt-5 text-lg font-bold sm:text-2xl">
                        {founder.name}
                      </h3>
                      <div className="mt-2 flex items-center gap-1">
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={founder.linkedinLabel}
                          className="text-muted-foreground hover:text-primary focus-visible:ring-ring inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        >
                          <Linkedin className="h-4 w-4" aria-hidden="true" />
                        </a>
                        <a
                          href={`mailto:${founder.email}`}
                          aria-label={founder.emailLabel}
                          className="text-muted-foreground hover:text-primary focus-visible:ring-ring inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        >
                          <Mail className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-12 border-t pt-10">
                <OpenEcosystem />
              </div>
            </Container>
          </BrandSection>

          <BrandSection tone="green" className="border-t">
            <Container>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
                  <GradientText>Our tools</GradientText>
                </h2>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    className="bg-foreground text-background hover:bg-foreground/90 gap-2"
                    asChild
                  >
                    <Link href="/indices">
                      <Globe className="h-5 w-5" aria-hidden="true" />
                      Explore the globe
                      <ArrowRight
                        className="h-4 w-4 rtl:rotate-180"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2" asChild>
                    <Link
                      href="https://source.coop/walkthru-earth"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        src="/source-coop-logo.png"
                        alt=""
                        width={20}
                        height={20}
                        className="rounded-sm"
                      />
                      Browse datasets
                      <ExternalLink
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                </div>
              </div>
            </Container>
          </BrandSection>
        </BrandPage>
        <Footer />
      </>
    </Localized>
  );
}
