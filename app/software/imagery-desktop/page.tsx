'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { GradientText } from '@/components/shared/gradient-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileImage,
  Map,
  History,
  Zap,
  Loader2,
  ArrowLeft,
  Layers,
  Video,
  ListTodo,
  Github,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';

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

const featureShowcase = [
  {
    icon: Map,
    title: 'Interactive Map Preview',
    description:
      'Browse historical imagery with an intuitive timeline. Select any date from 1984 to 2025 and preview imagery before download.',
    lightImage: '/software/imagery-desktop/feature-1-light.png',
    darkImage: '/software/imagery-desktop/feature-1-dark.png',
  },
  {
    icon: Layers,
    title: 'Split View Comparison',
    description:
      'Compare imagery side-by-side across different dates. Analyze urban change, development patterns, and environmental shifts with precision.',
    lightImage: '/software/imagery-desktop/feature-2-light.png',
    darkImage: '/software/imagery-desktop/feature-2-dark.png',
  },
  {
    icon: Video,
    title: 'Video Timeline Export',
    description:
      'Create stunning timelapses showing urban transformation. Perfect for presentations, social media content, and storytelling on Instagram, TikTok, and YouTube.',
    lightImage: '/software/imagery-desktop/feature-3-light.png',
    darkImage: '/software/imagery-desktop/feature-3-dark.png',
  },
  {
    icon: FileImage,
    title: 'Flexible Export Options',
    description:
      'Export as GeoTIFF for GIS analysis, tiles for web maps, or videos for storytelling. Choose zoom levels and configure output precisely.',
    lightImage: '/software/imagery-desktop/feature-4-light.png',
    darkImage: '/software/imagery-desktop/feature-4-dark.png',
  },
  {
    icon: ListTodo,
    title: 'Background Task Queue',
    description:
      'Queue multiple exports and let them run in the background. Track progress, manage tasks, and download when ready.',
    lightImage: '/software/imagery-desktop/feature-5-light.png',
    darkImage: '/software/imagery-desktop/feature-5-dark.png',
  },
];

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
    icon: Video,
    title: 'Social Media Ready',
    description:
      'Create stunning timelapse videos perfect for Instagram, TikTok, YouTube, and other social platforms',
  },
  {
    icon: Zap,
    title: 'Fast & Concurrent',
    description:
      '10 parallel download workers with smart epoch fallback for reliable imagery',
  },
  {
    icon: Sparkles,
    title: 'AI Ready',
    description:
      'Export imagery for AI video tools like Sora, Runway, and Kling to generate neighborhood explainers and urban analysis content',
  },
];

type UserOS = 'windows' | 'macos' | 'linux' | null;

function detectOS(): UserOS {
  if (typeof window === 'undefined') return null;

  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() || '';

  if (userAgent.includes('win') || platform.includes('win')) {
    return 'windows';
  }
  if (
    userAgent.includes('mac') ||
    platform.includes('mac') ||
    userAgent.includes('iphone') ||
    userAgent.includes('ipad')
  ) {
    return 'macos';
  }
  if (
    userAgent.includes('linux') ||
    userAgent.includes('x11') ||
    platform.includes('linux')
  ) {
    return 'linux';
  }

  return null;
}

export default function ImageryDesktopPage() {
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [userOS, setUserOS] = useState<UserOS>(null);
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      setUserOS(detectOS());
    });
  }, []);

  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  const isDark = mounted && effectiveTheme === 'dark';

  useEffect(() => {
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

  const getPlatformName = (platform: string, short = false) => {
    switch (platform) {
      case 'windows':
        return 'Windows';
      case 'macos':
        return short ? 'macOS' : 'macOS (Apple Silicon)';
      case 'linux':
        return 'Linux';
      default:
        return platform;
    }
  };

  // Sort assets to put user's OS first
  const getSortedAssets = () => {
    if (!release) return [];
    const assets = [...release.assets];
    if (userOS) {
      assets.sort((a, b) => {
        if (a.platform === userOS) return -1;
        if (b.platform === userOS) return 1;
        return 0;
      });
    }
    return assets.slice(0, 3);
  };

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden pt-20 md:min-h-[80dvh] md:pt-24">
          {/* Background gradient */}
          <div className="from-primary/5 via-background to-secondary/5 dark:from-primary/10 dark:to-secondary/10 absolute inset-0 bg-gradient-to-br" />

          {/* Animated gradient orbs */}
          <motion.div
            className="bg-primary/20 absolute top-1/4 -right-1/4 h-96 w-96 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="bg-secondary/20 absolute -bottom-1/4 -left-1/4 h-96 w-96 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <Container className="relative z-10 py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl"
            >
              <Button variant="ghost" asChild className="mb-4">
                <Link href="/software" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Software
                </Link>
              </Button>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6 flex items-center gap-4"
              >
                <Image
                  src="/software/imagery-desktop/appicon.png"
                  alt="Imagery Desktop Icon"
                  width={64}
                  height={64}
                  className="rounded-xl shadow-lg"
                />
                <div className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-4 py-2">
                  <History className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Historical Pattern Detection
                  </span>
                </div>
              </motion.div>

              <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.1] font-light tracking-tight">
                <GradientText className="font-semibold">
                  Imagery Desktop
                </GradientText>
                <br />
                See How Cities Change
              </h1>

              <p className="text-muted-foreground mt-6 max-w-2xl text-lg font-normal md:text-xl">
                Download and analyze historical satellite imagery from 1984 to
                2025. Detect urban growth patterns, environmental changes, and
                community transformations over time.
              </p>

              {/* Download Buttons - Right in the Hero */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {loading ? (
                  <Button size="lg" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Downloads...
                  </Button>
                ) : release ? (
                  <>
                    {getSortedAssets().map((asset) => {
                      const Icon = getPlatformIcon(asset.platform);
                      const isUserOS = asset.platform === userOS;
                      return (
                        <div key={asset.name} className="flex flex-col gap-1">
                          <Button
                            size="lg"
                            variant={isUserOS ? 'default' : 'outline'}
                            asChild
                          >
                            <a
                              href={asset.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="gap-2"
                            >
                              <Icon className="h-5 w-5" />
                              {getPlatformName(asset.platform, true)}
                            </a>
                          </Button>
                          {asset.platform === 'macos' && (
                            <span className="text-muted-foreground text-center text-xs">
                              Apple Silicon only
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <Button size="lg" variant="outline" asChild>
                    <Link
                      href="https://github.com/walkthru-earth/imagery-desktop/releases"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      View on GitHub
                    </Link>
                  </Button>
                )}
              </div>

              {release && (
                <p className="text-muted-foreground mt-4 text-sm">
                  Version {release.version} • Released{' '}
                  {new Date(release.publishedAt).toLocaleDateString()}
                </p>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="text-muted-foreground mt-12 flex items-center gap-8 text-sm"
              >
                <div>
                  <div className="text-foreground text-2xl font-semibold">
                    40+
                  </div>
                  <div>Years of Imagery</div>
                </div>
                <div className="bg-border h-8 w-px" />
                <div>
                  <div className="text-foreground text-2xl font-semibold">
                    2
                  </div>
                  <div>Data Sources</div>
                </div>
                <div className="bg-border h-8 w-px" />
                <div>
                  <div className="text-foreground text-2xl font-semibold">
                    Free
                  </div>
                  <div>Forever</div>
                </div>
              </motion.div>
            </motion.div>
          </Container>
        </section>

        {/* Quick Features Section */}
        <Section className="bg-muted/50">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="text-5xl font-light tracking-tight md:text-6xl lg:text-7xl">
                Key <span className="text-primary font-medium">Features</span>
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-relaxed md:text-2xl">
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

        {/* Feature Showcase Section */}
        <Section>
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="text-5xl font-light tracking-tight md:text-6xl lg:text-7xl">
                See It{' '}
                <GradientText className="font-semibold">In Action</GradientText>
              </h2>
              <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-xl leading-relaxed md:text-2xl">
                Powerful tools for detecting patterns in urban change
              </p>
            </motion.div>

            <div className="space-y-16">
              {featureShowcase.map((feature, index) => {
                const Icon = feature.icon;
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className={`flex flex-col gap-8 lg:flex-row lg:items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}
                  >
                    {/* Text */}
                    <div className="lg:w-2/5">
                      <div className="bg-primary/10 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg">
                        <Icon className="text-primary h-6 w-6" />
                      </div>
                      <h3 className="mb-3 text-2xl font-semibold md:text-3xl">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Screenshot */}
                    <div className="lg:w-3/5">
                      <div className="border-foreground/10 overflow-hidden rounded-xl border shadow-xl">
                        <Image
                          src={isDark ? feature.darkImage : feature.lightImage}
                          alt={feature.title}
                          width={1400}
                          height={949}
                          className="h-auto w-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </Section>

        {/* Video Demo Section */}
        <Section className="bg-muted/50">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-5xl font-light tracking-tight md:text-6xl lg:text-7xl">
                Urban{' '}
                <span className="text-primary font-medium">Timelapse</span>
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

        {/* CTA Section */}
        <section className="from-primary/5 to-secondary/5 bg-gradient-to-br py-24">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl text-center"
            >
              <h2 className="mb-6 text-5xl font-light tracking-tight md:text-6xl lg:text-7xl">
                Start Detecting{' '}
                <GradientText className="font-semibold">
                  Urban Patterns
                </GradientText>
              </h2>
              <p className="text-muted-foreground mb-10 text-lg">
                Download Imagery Desktop and explore how your city has
                transformed over four decades. Free, open-source, and built for
                researchers, planners, and communities.
              </p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row sm:flex-wrap">
                {loading ? (
                  <Button size="lg" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </Button>
                ) : release ? (
                  getSortedAssets().map((asset) => {
                    const Icon = getPlatformIcon(asset.platform);
                    const isUserOS = asset.platform === userOS;
                    return (
                      <div key={asset.name} className="flex flex-col gap-1">
                        <Button
                          size="lg"
                          variant={isUserOS ? 'default' : 'outline'}
                          asChild
                        >
                          <a
                            href={asset.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gap-2"
                          >
                            <Icon className="h-5 w-5" />
                            Download for {getPlatformName(asset.platform, true)}
                          </a>
                        </Button>
                        {asset.platform === 'macos' && (
                          <span className="text-muted-foreground text-center text-xs">
                            Apple Silicon only
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <Button size="lg" asChild>
                    <Link
                      href="https://github.com/walkthru-earth/imagery-desktop/releases"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      View Releases on GitHub
                    </Link>
                  </Button>
                )}
              </div>

              <div className="mt-6 flex justify-center gap-4">
                <Button size="lg" variant="outline" asChild>
                  <Link
                    href="https://github.com/walkthru-earth/imagery-desktop"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    Source Code
                  </Link>
                </Button>
              </div>

              {/* License Info */}
              <Card className="bg-muted/50 mx-auto mt-12 max-w-2xl">
                <CardContent className="pt-6">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <Badge variant="outline">CC BY 4.0</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    This software is open-source. The satellite imagery accessed
                    through this application remains property of the respective
                    providers (Google Earth, Esri) and their imagery partners.
                    Users are responsible for complying with imagery provider
                    terms of service.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
