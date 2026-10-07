'use client';

import { useState, useCallback } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Database,
  Globe,
  Search,
  Map,
  Languages,
  ShieldCheck,
  FileCode2,
  FileText,
  Layers,
  Box,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
} from 'lucide-react';
import { Github } from '@/components/shared/brand-icons';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Localized } from '@/lib/i18n/i18n-provider';

function BrowserFrame({
  url,
  title: _title,
  children,
}: {
  url: string;
  title: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [url]);

  return (
    <Localized>
      <div className="border-foreground/20 bg-card overflow-hidden rounded-[1.5rem] border-2">
        {/* Browser chrome */}
        <div className="brand-solid brand-tone-objex flex items-center gap-2 border-b-2 px-2.5 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
          {/* Traffic lights -hidden on small screens */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <div className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>

          {/* Address bar */}
          <div className="bg-background text-foreground flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border px-2 py-1.5 sm:gap-2 sm:px-3">
            <Globe className="text-muted-foreground h-3.5 w-3.5 flex-shrink-0" />
            <span
              dir="ltr"
              translate="no"
              className="text-muted-foreground text-2xs min-w-0 flex-1 truncate text-left font-mono sm:text-xs"
            >
              {url}
            </span>
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground flex-shrink-0 rounded-sm p-1 transition-colors"
              title="Copy URL"
            >
              {copied ? (
                <Check className="text-primary h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Open external */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground flex-shrink-0 rounded-sm p-1 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Content */}
        {children}
      </div>
    </Localized>
  );
}

const featureShowcase = [
  {
    icon: Database,
    title: 'Parquet Explorer',
    description:
      'Browse and visualize Parquet files with geospatial columns on interactive maps. Suitability analysis data rendered directly from S3-compatible storage.',
    iframeUrl:
      'https://walkthru.earth/objex/?url=https%3A%2F%2Fs3.us-west-2.amazonaws.com%2Fus-west-2.opendata.source.coop%2Fwalkthru-earth%2Fopensensor-space%2Fshare%2Fsuitability_analysis_of_aq.parquet',
  },
  {
    icon: Map,
    title: 'COG Raster Visualization',
    description:
      'Cloud Optimized GeoTIFFs rendered with deck.gl-raster and smart metadata detection via geotiff.js. National Land Cover Database (NLCD) 2024 visualized in the browser.',
    iframeUrl:
      'https://walkthru.earth/objex/?url=https://s3.us-east-1.amazonaws.com/ds-deck.gl-raster-public/cog/Annual_NLCD_LndCov_2024_CU_C1V1.tif',
  },
  {
    icon: FileCode2,
    title: 'Notebook Viewer',
    description:
      'Render Jupyter notebooks directly from cloud storage with full cell output display. Explore data science workflows without downloading anything.',
    iframeUrl:
      'https://walkthru.earth/objex/?url=https%3A%2F%2Fs3.us-west-2.amazonaws.com%2Fus-west-2.opendata.source.coop%2Frti%2Frwanda-crop-landcover-labels%2Fexamples%2FUsage_Example_Notebook.ipynb',
  },
  {
    icon: Map,
    title: 'PMTiles Vector Maps',
    description:
      'Render PMTiles vector tile archives directly from cloud storage. Full OpenStreetMap worldwide rendered client-side with no tile server required.',
    iframeUrl:
      'https://walkthru.earth/objex/?url=https%3A%2F%2Fs3.us-west-2.amazonaws.com%2Fus-west-2.opendata.source.coop%2Fprotomaps%2Fopenstreetmap%2Fv4.pmtiles',
  },
  {
    icon: Layers,
    title: 'Zarr Multidimensional Arrays',
    description:
      'Inspect and explore Zarr v2/v3 stores from cloud storage. Browse array metadata, dimensions, and chunks for scientific datasets like GLDAS climate models.',
    iframeUrl:
      'https://walkthru.earth/objex/?url=https%3A%2F%2Fs3.us-west-2.amazonaws.com%2Fus-west-2.opendata.source.coop%2Fzarr%2Fgeozarr-tests%2FGLDAS_NOAH025_3H.zarr%2F#inspect',
  },
  {
    icon: FileText,
    title: 'Markdown & Mermaid Rendering',
    description:
      'Render Markdown files with Mermaid diagram support and smart LTR/RTL detection for correct multilingual reading. Documentation rendered beautifully from any cloud storage.',
    iframeUrl:
      'https://walkthru.earth/objex/?url=https%3A%2F%2Fs3.us-west-2.amazonaws.com%2Fus-west-2.opendata.source.coop%2Ftabaqat%2Fgeocoding-cng%2Fv0.4.1%2FREADME.md',
  },
  {
    icon: Map,
    title: 'Kepler.gl Map Viewer',
    description:
      'Load and render Kepler.gl JSON map configurations directly from cloud storage. Copernicus EGMS ground motion data visualized with full Kepler.gl interactivity.',
    iframeUrl:
      'https://walkthru.earth/objex/?url=https%3A%2F%2Fs3.us-west-2.amazonaws.com%2Fus-west-2.opendata.source.coop%2Fyoussef-harby%2Fegms-copernicus%2FL2a%2Fkepler%2Fkepler.gl.json#kepler',
  },
  {
    icon: Box,
    title: 'Archive Browser',
    description:
      'Browse ZIP archives progressively without downloading or uncompressing. Inspect file trees, sizes, and contents in a clean column view -all streamed lazily from cloud storage.',
    iframeUrl:
      'https://walkthru.earth/objex/?url=https%3A%2F%2Fs3.us-west-2.amazonaws.com%2Fus-west-2.opendata.source.coop%2Fharvard-lil%2Ffederal-github%2Fdata%2FMNGRLPychron%2Fpychron%2Fv1.zip',
  },
  {
    icon: Database,
    title: 'STAC Catalog Browser',
    description:
      'Navigate SpatioTemporal Asset Catalogs directly from cloud storage. Browse collections, items, and assets with spatial previews -no STAC API server needed.',
    iframeUrl:
      'https://walkthru.earth/objex/?url=https%3A%2F%2Fs3.us-west-2.amazonaws.com%2Fus-west-2.opendata.source.coop%2Fplanet%2Feu-field-boundaries%2Fcollection.json#stac-browser',
  },
  {
    icon: Globe,
    title: 'FlatGeobuf Streaming',
    description:
      'Stream large FlatGeobuf files with spatial filtering. This 6 GB EUBUCCO building footprint dataset for Austria is rendered progressively as data arrives.',
    iframeUrl:
      'https://walkthru.earth/objex/?url=https%3A%2F%2Fs3.us-west-2.amazonaws.com%2Fus-west-2.opendata.source.coop%2Fabry-tudelft%2Feubucco%2Fflatgeobuf%2Fcountry%2FAUT.fgb',
  },
  {
    icon: Layers,
    title: 'COPC Point Cloud Viewer',
    description:
      'Explore Cloud-Optimized Point Cloud (COPC) files directly in the browser. This classified LiDAR dataset from Autzen is streamed and rendered as an interactive 3D point cloud.',
    iframeUrl:
      'https://walkthru.earth/objex/?url=https%3A%2F%2Fs3.amazonaws.com%2Fhobu-lidar%2Fautzen-classified.copc.laz',
  },
];

const quickFeatures = [
  {
    icon: Database,
    title: 'Multi-Cloud Storage',
    description:
      'Connect to AWS S3, Google Cloud Storage, Azure Blob, Cloudflare R2, MinIO, Wasabi, DigitalOcean Spaces, and Storj',
  },
  {
    icon: Search,
    title: 'In-Browser SQL',
    description:
      'Query Parquet, CSV, and JSONL with DuckDB-WASM -cancellable queries with full SQL support, all client-side',
  },
  {
    icon: Map,
    title: 'Interactive Maps',
    description:
      'Visualize GeoParquet, GeoJSON, COG, PMTiles, FlatGeobuf, and Zarr on MapLibre GL + deck.gl maps',
  },
  {
    icon: FileCode2,
    title: 'Code & Notebooks',
    description:
      'Syntax-highlighted code in 30+ languages, Jupyter and marimo notebook rendering, Markdown preview',
  },
  {
    icon: Layers,
    title: 'Point Clouds & Rasters',
    description:
      'Explore COPC, LAZ, and LAS point clouds. View Cloud Optimized GeoTIFFs, PMTiles, and Zarr v2/v3 rasters',
  },
  {
    icon: Box,
    title: '3D Models & Archives',
    description:
      'Preview GLB, glTF, OBJ, STL, and FBX 3D models. Browse ZIP, TAR, GZ, 7Z, and RAR archives',
  },
  {
    icon: Languages,
    title: 'Internationalization',
    description:
      'English and Arabic with automatic RTL layout. Designed for accessibility across languages',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy First',
    description:
      'Zero backend -everything runs in your browser. Credentials stay in memory and are never sent to any server',
  },
];

const supportedFormats = [
  { category: 'Tabular', formats: 'Parquet, CSV, TSV, JSONL, NDJSON' },
  {
    category: 'Geo Vector',
    formats: 'GeoParquet, GeoJSON, Shapefile, GeoPackage, FlatGeobuf',
  },
  { category: 'Geo Raster', formats: 'COG, PMTiles, Zarr v2/v3' },
  { category: 'Point Cloud', formats: 'COPC, LAZ, LAS' },
  { category: 'Notebooks', formats: 'Jupyter (.ipynb), marimo' },
  {
    category: 'Code',
    formats: '30+ languages (Python, TS, Rust, Go, SQL...)',
  },
  { category: 'Documents', formats: 'Markdown, PDF, text, logs' },
  { category: 'Media', formats: 'Images, video, audio' },
  { category: '3D', formats: 'GLB, glTF, OBJ, STL, FBX' },
  { category: 'Archives', formats: 'ZIP, TAR, GZ, 7Z, RAR' },
  { category: 'Database', formats: 'DuckDB, SQLite' },
];

export default function ObjexPage() {
  return (
    <Localized>
      <>
        <Navbar />
        <BrandPage project="objex">
          <BrandHero tone="objex" className="pt-28 md:pt-36">
            <Container>
              <Button
                variant="ghost"
                asChild
                className="mb-8 text-current hover:bg-white/10 hover:text-current"
              >
                <Link href="/software" className="gap-2">
                  <ArrowLeft
                    className="h-4 w-4 rtl:rotate-180"
                    aria-hidden="true"
                  />
                  Back to Software
                </Link>
              </Button>
              <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
                <div>
                  <div className="mb-6 flex flex-wrap items-center gap-4">
                    <Image
                      src="/software/objex/appicon.svg"
                      alt="objex Icon"
                      width={64}
                      height={64}
                      className="rounded-2xl"
                    />
                    <BrandEyebrow className="mb-0">
                      <Globe className="h-4 w-4" aria-hidden="true" />
                      Cloud Storage Explorer
                    </BrandEyebrow>
                  </div>
                  <h1>
                    <bdi dir="ltr" translate="no">
                      objex
                    </bdi>
                  </h1>
                  <p className="mt-6 max-w-2xl text-xl leading-relaxed">
                    Browse, query and map cloud data in your browser.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button size="lg" asChild>
                      <a
                        href="https://walkthru.earth/objex/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <Globe className="h-5 w-5" aria-hidden="true" />
                        Launch objex
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <a
                        href="https://github.com/walkthru-earth/objex"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <Github className="h-5 w-5" aria-hidden="true" />
                        View on GitHub
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {(
                    [
                      ['100+', 'File Formats'],
                      ['9+', 'Cloud Providers'],
                      ['Zero', 'Backend'],
                    ] as const
                  ).map(([value, label]) => (
                    <BrandPanel
                      key={label}
                      className="bg-background text-foreground flex items-center gap-4 py-5 sm:flex-col sm:items-start lg:flex-row lg:items-center"
                    >
                      <p className="text-4xl font-bold">
                        {/\d/.test(value) ? (
                          <bdi dir="ltr" translate="no">
                            {value}
                          </bdi>
                        ) : (
                          value
                        )}
                      </p>
                      <p className="text-lg font-bold">{label}</p>
                    </BrandPanel>
                  ))}
                </div>
              </div>
            </Container>
          </BrandHero>

          <BrandSection>
            <Container>
              <BrandSectionHeading title="Live demos" />
              <div className="space-y-4">
                {featureShowcase.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <BrandPanel key={feature.title} className="bg-card">
                      <details open={index === 0} className="group">
                        <summary className="flex cursor-pointer list-none items-center gap-4 rounded-xl outline-offset-4 [&::-webkit-details-marker]:hidden">
                          <BrandIcon tone="objex">
                            <Icon aria-hidden="true" />
                          </BrandIcon>
                          <h3 className="min-w-0 flex-1 text-lg sm:text-2xl">
                            {feature.title}
                          </h3>
                          <ChevronDown
                            className="h-6 w-6 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                            aria-hidden="true"
                          />
                        </summary>
                        <p className="text-muted-foreground mt-6 mb-5 max-w-3xl text-base leading-relaxed">
                          {feature.description}
                        </p>
                        <BrowserFrame
                          url={feature.iframeUrl}
                          title={feature.title}
                        >
                          <iframe
                            src={feature.iframeUrl}
                            title={feature.title}
                            loading="lazy"
                            className="h-[400px] w-full sm:h-[500px] md:h-[650px]"
                            allow="clipboard-write"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                          />
                        </BrowserFrame>
                      </details>
                    </BrandPanel>
                  );
                })}
              </div>
            </Container>
          </BrandSection>

          <BrandSection>
            <Container>
              <div className="space-y-4">
                <BrandPanel className="bg-background text-foreground">
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
                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                      {quickFeatures.map((feature) => {
                        const Icon = feature.icon;
                        return (
                          <div
                            key={feature.title}
                            className="flex items-start gap-4"
                          >
                            <BrandIcon tone="objex">
                              <Icon aria-hidden="true" />
                            </BrandIcon>
                            <div>
                              <h3 className="text-lg">{feature.title}</h3>
                              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                </BrandPanel>
                <BrandPanel className="bg-background text-foreground">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl outline-offset-4 [&::-webkit-details-marker]:hidden">
                      <h2>Supported formats</h2>
                      <ChevronDown
                        className="h-6 w-6 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {supportedFormats.map((item) => (
                        <div key={item.category} className="space-y-2">
                          <h3 className="text-base">{item.category}</h3>
                          <p
                            dir="ltr"
                            translate="no"
                            className="text-muted-foreground text-left text-sm leading-relaxed"
                          >
                            {item.formats}
                          </p>
                        </div>
                      ))}
                    </div>
                  </details>
                </BrandPanel>
                <BrandPanel className="bg-background text-foreground">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl outline-offset-4 [&::-webkit-details-marker]:hidden">
                      <h2>
                        <bdi dir="ltr" translate="no">
                          npm
                        </bdi>{' '}
                        <span>Packages</span>
                      </h2>
                      <ChevronDown
                        className="h-6 w-6 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                      <BrandPanel tone="objex">
                        <Badge
                          variant="outline"
                          className="mb-4 w-fit border-current/30 text-current"
                        >
                          Svelte 5
                        </Badge>
                        <h3
                          dir="ltr"
                          translate="no"
                          className="text-lg break-all"
                        >
                          @walkthru-earth/objex
                        </h3>
                        <p className="mt-3 mb-5 text-sm leading-relaxed">
                          Full Svelte 5 component library with stores and
                          utilities for building geospatial storage explorers.
                        </p>
                        <code
                          dir="ltr"
                          translate="no"
                          className="bg-background text-foreground inline-block rounded-lg px-3 py-2 text-left text-xs break-all"
                        >
                          npm install @walkthru-earth/objex
                        </code>
                      </BrandPanel>
                      <BrandPanel tone="objex">
                        <Badge
                          variant="outline"
                          className="mb-4 w-fit border-current/30 text-current"
                        >
                          TypeScript
                        </Badge>
                        <h3
                          dir="ltr"
                          translate="no"
                          className="text-lg break-all"
                        >
                          @walkthru-earth/objex-utils
                        </h3>
                        <p className="mt-3 mb-5 text-sm leading-relaxed">
                          Pure TypeScript utilities -zero Svelte dependency.
                          Works with any JS framework or Node.js.
                        </p>
                        <code
                          dir="ltr"
                          translate="no"
                          className="bg-background text-foreground inline-block rounded-lg px-3 py-2 text-left text-xs break-all"
                        >
                          npm install @walkthru-earth/objex-utils
                        </code>
                      </BrandPanel>
                    </div>
                  </details>
                </BrandPanel>
                <details className="px-4 pt-4">
                  <summary className="w-fit cursor-pointer text-sm font-bold">
                    CC BY 4.0
                  </summary>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed">
                    objex is open-source under CC BY 4.0. Everything runs
                    client-side -your credentials and data never leave your
                    browser.
                  </p>
                </details>
              </div>
            </Container>
          </BrandSection>
        </BrandPage>
        <Footer />
      </>
    </Localized>
  );
}
