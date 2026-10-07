'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/shared/container';
import {
  BrandPage,
  BrandHero,
  BrandSection,
  BrandPanel,
  BrandIcon,
  BrandEyebrow,
  BrandSectionHeading,
} from '@/components/shared/brand-ui';
import { Button } from '@/components/ui/button';
import {
  Download,
  FileImage,
  Map,
  History,
  Zap,
  Loader2,
  ArrowLeft,
  Video,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Github } from '@/components/shared/brand-icons';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { ProjectGallery } from '@/components/shared/project-gallery';
import { features } from './data/features';
import { Localized, useI18n } from '@/lib/i18n/i18n-provider';

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
  const { resolvedTheme } = useTheme();
  const { locale, t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      setUserOS(detectOS());
    });
  }, []);

  const galleryReady = mounted && resolvedTheme !== undefined;
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    const controller = new AbortController();
    fetch(
      'https://api.github.com/repos/walkthru-earth/imagery-desktop/releases/latest',
      { signal: controller.signal }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Release request failed (${res.status})`);
        return res.json();
      })
      .then(
        (data: {
          tag_name: string;
          published_at: string;
          assets: { name: string; browser_download_url: string }[];
        }) => {
          if (controller.signal.aborted) return;
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
        if (controller.signal.aborted) return;
        console.error('Failed to fetch release:', error);
        setLoading(false);
      });
    return () => controller.abort();
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
    <Localized>
      <>
        <Navbar />
        <BrandPage project="imagery">
          <BrandHero
            tone="imagery"
            decorative={false}
            className="pt-28 md:pt-36"
          >
            <Container>
              <Button
                variant="ghost"
                asChild
                className="mb-8 text-current hover:bg-black/5 hover:text-current"
              >
                <Link href="/software" className="gap-2">
                  <ArrowLeft
                    className="h-4 w-4 rtl:rotate-180"
                    aria-hidden="true"
                  />
                  Back to Software
                </Link>
              </Button>
              <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="mb-6 flex flex-wrap items-center gap-4">
                    <Image
                      src="/software/imagery-desktop/appicon.png"
                      alt="Imagery Desktop Icon"
                      width={64}
                      height={64}
                      className="rounded-2xl"
                    />
                    <BrandEyebrow className="mb-0">
                      <History className="h-4 w-4" aria-hidden="true" />
                      Historical Pattern Detection
                    </BrandEyebrow>
                  </div>
                  <h1>
                    <span translate="no">Imagery Desktop</span>
                  </h1>
                  <p className="mt-6 max-w-2xl text-xl leading-relaxed">
                    Download historical imagery. Compare places across time.
                  </p>
                  {/* Download Buttons - Right in the Hero */}
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {loading ? (
                      <Button size="lg" disabled>
                        <Loader2 className="me-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
                        Loading Downloads...
                      </Button>
                    ) : release ? (
                      <>
                        {getSortedAssets().map((asset) => {
                          const Icon = getPlatformIcon(asset.platform);
                          const isUserOS = asset.platform === userOS;
                          return (
                            <div
                              key={asset.name}
                              className="flex flex-col gap-1"
                            >
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
                          <Github className="me-2 h-4 w-4" />
                          View on GitHub
                        </Link>
                      </Button>
                    )}
                  </div>

                  {release && (
                    <p className="text-muted-foreground mt-4 text-sm">
                      {t('Version {version} • Released {date}', {
                        version: release.version,
                        date: new Intl.DateTimeFormat(locale).format(
                          new Date(release.publishedAt)
                        ),
                      })}
                    </p>
                  )}
                </div>
                <div className="min-w-0">
                  {galleryReady ? (
                    <ProjectGallery
                      items={features.map((feature) => ({
                        ...(isDark
                          ? feature.darkScreenshot
                          : feature.lightScreenshot),
                        alt: feature.title,
                        description: feature.description,
                      }))}
                      priority
                    />
                  ) : (
                    <div aria-busy="true" aria-label="Screenshots">
                      <figure>
                        <div className="border-foreground/20 bg-background overflow-hidden rounded-3xl border-2">
                          <div
                            className="bg-muted"
                            style={{
                              aspectRatio: `${features[0].lightScreenshot.width} / ${features[0].lightScreenshot.height}`,
                            }}
                            aria-hidden="true"
                          />
                        </div>
                        <figcaption className="mt-4">
                          <p className="text-base font-bold">
                            {features[0].title}
                          </p>
                          <p className="mt-2 text-sm leading-relaxed opacity-80">
                            {features[0].description}
                          </p>
                        </figcaption>
                      </figure>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {features.map((feature, index) => (
                          <Button
                            key={feature.title}
                            type="button"
                            variant={index === 0 ? 'default' : 'outline'}
                            size="sm"
                            className="h-auto min-h-10 max-w-full text-start whitespace-normal"
                            disabled
                          >
                            {feature.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    {[
                      ['40+', 'Years of Imagery'],
                      ['2', 'Data Sources'],
                      ['Free', 'Forever'],
                    ].map(([value, label]) => (
                      <div key={label} className="min-w-0">
                        <div className="text-3xl font-bold sm:text-4xl">
                          {/\d/.test(value) ? (
                            <bdi dir="ltr" translate="no">
                              {value}
                            </bdi>
                          ) : (
                            value
                          )}
                        </div>
                        <div className="mt-2 text-sm font-semibold">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Container>
          </BrandHero>

          <BrandSection tone="action">
            <Container>
              <BrandSectionHeading
                title={
                  <>
                    Urban <span>Timelapse</span>
                  </>
                }
              />
              <div className="border-foreground/20 relative mx-auto aspect-video max-w-4xl overflow-hidden rounded-[1.5rem] border-2">
                <video
                  controls
                  muted
                  preload="none"
                  aria-label="Silent satellite imagery timelapse showing urban change"
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
              <p className="mt-4 text-center text-sm">
                Esri Wayback timelapse: September 2025 to February 2021
              </p>
            </Container>
          </BrandSection>

          <BrandSection>
            <Container>
              <BrandPanel tone="imagery">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl outline-offset-4 [&::-webkit-details-marker]:hidden">
                    <h2>
                      Key <span>Features</span>
                    </h2>
                    <ChevronDown
                      className="h-6 w-6 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {quickFeatures.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div
                          key={feature.title}
                          className="flex items-start gap-4"
                        >
                          <BrandIcon tone="imagery">
                            <Icon aria-hidden="true" />
                          </BrandIcon>
                          <div>
                            <h3 className="text-lg">{feature.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </details>
              </BrandPanel>
              <details className="px-4 pt-8">
                <summary className="w-fit cursor-pointer text-sm font-bold">
                  CC BY 4.0
                </summary>
                <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed">
                  This software is open-source. The satellite imagery accessed
                  through this application remains property of the respective
                  providers (Google Earth, Esri) and their imagery partners.
                  Users are responsible for complying with imagery provider
                  terms of service.
                </p>
              </details>
            </Container>
          </BrandSection>
        </BrandPage>
        <Footer />
      </>
    </Localized>
  );
}
