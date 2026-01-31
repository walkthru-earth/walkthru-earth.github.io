'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Download,
  FileImage,
  Map,
  History,
  Zap,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';

// Feature showcase components
import { ScrollingDesktopMockup } from './components/ScrollingDesktopMockup';
import { useScrollFeatures } from './hooks/useScrollFeatures';
import { features } from './data/features';

// Platform icons
const AppleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const WindowsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
  </svg>
);

const LinuxIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.051 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489.117.68.361 1.32.964 1.796.694.543 1.635.858 2.716.858.451 0 .908-.09 1.35-.27.725-.295 1.314-.971 1.639-1.678.119-.256.181-.529.181-.801 0-.225-.045-.45-.135-.676-.271-.68-.957-1.125-1.669-1.125-.361 0-.722.09-1.05.27-.135.075-.27.166-.389.271-.166-.451-.256-.931-.256-1.426 0-.75.181-1.5.496-2.175.285-.615.691-1.186 1.184-1.679.496-.496 1.066-.887 1.678-1.125.615-.24 1.289-.376 1.981-.376.691 0 1.365.135 1.98.376.615.24 1.185.629 1.68 1.125.495.496.9 1.064 1.185 1.679.315.675.495 1.426.495 2.175 0 .495-.09.975-.256 1.426-.119-.105-.254-.196-.389-.271-.328-.18-.689-.27-1.05-.27-.712 0-1.398.445-1.669 1.125-.09.226-.135.451-.135.676 0 .272.062.545.181.801.325.707.914 1.383 1.639 1.678.442.18.899.27 1.35.27 1.081 0 2.022-.315 2.716-.858.603-.476.847-1.116.964-1.796.123-.805-.009-1.657-.287-2.489-.589-1.771-1.831-3.47-2.716-4.521-.751-1.067-.975-1.928-1.051-3.02-.065-1.491 1.056-5.965-3.17-6.298-.165-.013-.325-.021-.48-.021zm-.285 3.75c.301 0 .545.244.545.545 0 .3-.244.545-.545.545-.301 0-.545-.245-.545-.545 0-.301.244-.545.545-.545z" />
  </svg>
);

interface Release {
  version: string;
  tagName: string;
  publishedAt: string;
  assets: {
    name: string;
    downloadUrl: string;
    platform: 'windows' | 'macos' | 'linux';
  }[];
}

export default function ImageryDesktopPage() {
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);

  // Scrolling feature showcase
  const {
    heroRef,
    screenshotOpacities,
    dotOpacities,
    mobileTextOpacity,
    mobileScreenshotOpacity,
  } = useScrollFeatures(features.length);

  useEffect(() => {
    // Fetch latest release from GitHub API
    fetch(
      'https://api.github.com/repos/walkthru-earth/imagery-desktop/releases/latest'
    )
      .then((res) => res.json())
      .then(
        (data: {
          tag_name: string;
          published_at: string;
          assets: { name: string; browser_download_url: string }[];
        }) => {
          const assets = data.assets.map((asset) => {
            let platform: 'windows' | 'macos' | 'linux' = 'linux';
            if (asset.name.includes('windows')) platform = 'windows';
            else if (asset.name.includes('macos')) platform = 'macos';

            return {
              name: asset.name,
              downloadUrl: asset.browser_download_url,
              platform,
            };
          });

          setRelease({
            version: data.tag_name,
            tagName: data.tag_name,
            publishedAt: data.published_at,
            assets,
          });
          setLoading(false);
        }
      )
      .catch((error) => {
        console.error('Failed to fetch release:', error);
        setLoading(false);
      });
  }, []);

  const quickFeatures = [
    {
      icon: History,
      title: 'Historical Imagery',
      description:
        'Access satellite imagery from 1984 to 2025 from Google Earth and Esri Wayback archives',
    },
    {
      icon: Map,
      title: 'Interactive Map Preview',
      description:
        'Preview imagery before download with MapLibre GL-powered visualization',
    },
    {
      icon: FileImage,
      title: 'GeoTIFF Export',
      description:
        'Export georeferenced GeoTIFF files ready for GIS analysis in QGIS or ArcGIS',
    },
    {
      icon: Zap,
      title: 'Fast & Concurrent',
      description:
        '10 parallel download workers with smart epoch fallback for reliable imagery',
    },
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'windows':
        return WindowsIcon;
      case 'macos':
        return AppleIcon;
      case 'linux':
        return LinuxIcon;
      default:
        return Download;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'windows':
        return 'Windows';
      case 'macos':
        return 'macOS';
      case 'linux':
        return 'Linux';
      default:
        return platform;
    }
  };

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section with Scrolling Features */}
        <section ref={heroRef} className="relative h-[300vh]">
          <div className="sticky top-0 flex h-screen items-center overflow-hidden pt-16">
            <div className="from-primary/5 via-background to-primary/10 absolute inset-0 bg-gradient-to-br" />

            <div className="relative z-10 flex h-full w-full flex-col lg:block">
              {/* Desktop: side-by-side grid, Mobile: stacked with screenshots above text */}
              <div className="h-full lg:grid lg:grid-cols-2 lg:items-center lg:gap-8 lg:px-8 xl:px-12">
                {/* Desktop Mockup with Scrolling Screenshots - Comes FIRST on mobile */}
                <motion.div
                  style={{
                    opacity: mobileScreenshotOpacity,
                  }}
                  className="flex flex-1 items-center justify-center px-4 lg:order-2 lg:px-0 lg:opacity-100!"
                >
                  <ScrollingDesktopMockup
                    features={features}
                    screenshotOpacities={screenshotOpacities}
                    dotOpacities={dotOpacities}
                  />
                </motion.div>

                {/* Text Content - Below screenshots on mobile, left side on desktop */}
                <div className="px-6 pb-8 lg:order-1 lg:px-0 lg:pb-0">
                  {/* Static elements that fade out on mobile */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{
                      opacity: mobileTextOpacity,
                    }}
                    className="lg:opacity-100!"
                  >
                    <Button variant="ghost" asChild className="mb-3 lg:mb-4">
                      <Link href="/software" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Software
                      </Link>
                    </Button>

                    {/* App Icon */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6 }}
                      className="mb-3 lg:mb-4"
                    >
                      <Image
                        src="/software/imagery-desktop/appicon.png"
                        alt="Imagery Desktop Icon"
                        width={80}
                        height={80}
                        className="rounded-2xl shadow-lg"
                      />
                    </motion.div>
                  </motion.div>

                  {/* Dynamic Feature Titles - Always visible, rotate based on scroll */}
                  <div className="relative mb-4 min-h-[180px] lg:mb-6 lg:min-h-[280px]">
                    {features.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        className="absolute top-0 right-0 left-0"
                        style={{
                          opacity: screenshotOpacities[index],
                        }}
                      >
                        <h1 className="text-[clamp(1.5rem,4.5vw,3.5rem)] leading-[1.1] font-light tracking-tight">
                          <span className="text-primary font-semibold">
                            {feature.title}
                          </span>
                        </h1>

                        <p className="text-muted-foreground mt-2 text-xs font-normal lg:mt-3 lg:text-base">
                          {feature.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Static elements that fade out on mobile */}
                  <motion.div
                    style={{
                      opacity: mobileTextOpacity,
                    }}
                    className="lg:opacity-100!"
                  >
                    <div className="mb-4 lg:mb-6">
                      <Button size="lg" asChild className="gap-2">
                        <a href="#download">
                          <Download className="h-5 w-5" />
                          Download Latest
                        </a>
                      </Button>
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 1 }}
                      className="text-muted-foreground flex items-center gap-3 text-xs lg:gap-4 lg:text-sm"
                    >
                      <div>
                        <div className="text-foreground text-xl font-semibold lg:text-2xl">
                          40+
                        </div>
                        <div>Years</div>
                      </div>
                      <div className="bg-border h-6 w-px lg:h-8" />
                      <div>
                        <div className="text-foreground text-xl font-semibold lg:text-2xl">
                          2
                        </div>
                        <div>Sources</div>
                      </div>
                      <div className="bg-border h-6 w-px lg:h-8" />
                      <div>
                        <div className="text-foreground text-xl font-semibold lg:text-2xl">
                          ∞
                        </div>
                        <div>Possible</div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Features Section */}
        <Section className="bg-muted/30">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="text-4xl font-light tracking-tight md:text-5xl">
                Key <span className="text-primary font-medium">Features</span>
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg md:text-xl">
                Everything you need to analyze urban change through satellite
                imagery
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {quickFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full transition-shadow hover:shadow-lg">
                      <CardHeader>
                        <div className="bg-primary/10 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg">
                          <Icon className="text-primary h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </Section>

        {/* Video Demo Section */}
        <Section>
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-4xl font-light tracking-tight md:text-5xl">
                See It{' '}
                <span className="text-primary font-medium">In Action</span>
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
                Watch how Imagery Desktop creates stunning timelapses showing
                urban transformation over time
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto max-w-4xl"
            >
              <div className="border-foreground/10 relative aspect-video overflow-hidden rounded-xl border shadow-2xl">
                <video
                  controls
                  className="h-full w-full"
                  poster="/software/imagery-desktop/feature-3-light.png"
                >
                  <source
                    src="/software/imagery-desktop/timelapse-demo.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="text-muted-foreground mt-4 text-center text-sm">
                Esri Wayback timelapse: September 2025 to February 2021
              </p>
            </motion.div>
          </Container>
        </Section>

        {/* Download Section */}
        <Section id="download" className="bg-muted/30">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="text-4xl font-light tracking-tight md:text-5xl">
                Download <span className="text-primary font-medium">Now</span>
              </h2>
              <p className="text-muted-foreground mt-4 text-lg md:text-xl">
                {loading ? (
                  'Loading latest version...'
                ) : release ? (
                  <>
                    Latest version: <strong>{release.version}</strong> •
                    Released{' '}
                    {new Date(release.publishedAt).toLocaleDateString()}
                  </>
                ) : (
                  'Check back soon for download options'
                )}
              </p>
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="text-primary h-12 w-12 animate-spin" />
              </div>
            ) : release ? (
              <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
                {release.assets.map((asset, index) => {
                  const Icon = getPlatformIcon(asset.platform);
                  return (
                    <motion.div
                      key={asset.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="hover:border-primary/50 h-full transition-all hover:shadow-lg">
                        <CardHeader className="text-center">
                          <div className="bg-muted mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
                            <Icon className="h-8 w-8" />
                          </div>
                          <CardTitle className="text-2xl">
                            {getPlatformName(asset.platform)}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {asset.name
                              .split('-')
                              .pop()
                              ?.replace('.zip', '')
                              .replace('.tar.gz', '')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button asChild className="w-full gap-2">
                            <a
                              href={asset.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground">
                  Download links will appear here once available.
                </p>
              </div>
            )}

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto mt-16 max-w-3xl text-center"
            >
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <h3 className="mb-3 text-xl font-semibold">
                    Educational Purpose & License
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    This software is licensed under <strong>CC BY 4.0</strong>.
                    The satellite imagery accessed through this application
                    remains property of the respective providers (Google Earth,
                    Esri). Users are responsible for complying with imagery
                    provider terms of service.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
