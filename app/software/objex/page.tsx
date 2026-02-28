'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/shared/container';
import { Section } from '@/components/shared/section';
import { GradientText } from '@/components/shared/gradient-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Github,
  Copy,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';

function BrowserFrame({
  url,
  title,
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
    <div className="border-foreground/10 overflow-hidden rounded-xl border shadow-2xl">
      {/* Browser chrome */}
      <div className="bg-muted/80 flex items-center gap-2 border-b px-2.5 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
        {/* Traffic lights — hidden on small screens */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>

        {/* Address bar */}
        <div className="bg-background/80 flex min-w-0 flex-1 items-center gap-1.5 rounded-md border px-2 py-1.5 sm:gap-2 sm:px-3">
          <Globe className="text-muted-foreground h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-muted-foreground min-w-0 flex-1 truncate font-mono text-[11px] sm:text-xs">
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
      'Browse ZIP archives progressively without downloading or uncompressing. Inspect file trees, sizes, and contents in a clean column view — all streamed lazily from cloud storage.',
    iframeUrl:
      'https://walkthru.earth/objex/?url=https%3A%2F%2Fs3.us-west-2.amazonaws.com%2Fus-west-2.opendata.source.coop%2Fharvard-lil%2Ffederal-github%2Fdata%2FMNGRLPychron%2Fpychron%2Fv1.zip',
  },
  {
    icon: Database,
    title: 'STAC Catalog Browser',
    description:
      'Navigate SpatioTemporal Asset Catalogs directly from cloud storage. Browse collections, items, and assets with spatial previews — no STAC API server needed.',
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
      'Query Parquet, CSV, and JSONL with DuckDB-WASM — cancellable queries with full SQL support, all client-side',
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
      'Zero backend — everything runs in your browser. Credentials stay in memory and are never sent to any server',
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
                  src="/software/objex/appicon.svg"
                  alt="objex Icon"
                  width={64}
                  height={64}
                  className="rounded-xl shadow-lg"
                />
                <div className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-4 py-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Cloud Storage Explorer
                  </span>
                </div>
              </motion.div>

              <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.1] font-light tracking-tight">
                <GradientText className="font-semibold">objex</GradientText>
                <br />
                Explore Cloud Storage
              </h1>

              <p className="text-muted-foreground mt-6 max-w-2xl text-lg font-normal md:text-xl">
                Browse, query, and visualize files in S3, GCS, Azure, R2, and
                more. SQL queries with DuckDB, interactive geospatial maps, and
                18+ specialized viewers for 100+ file formats — all running
                client-side in your browser.
              </p>

              {/* Launch Button */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button size="lg" asChild>
                  <a
                    href="https://walkthru.earth/objex/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <Globe className="h-5 w-5" />
                    Launch objex
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a
                    href="https://github.com/walkthru-earth/objex"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <Github className="h-5 w-5" />
                    View on GitHub
                  </a>
                </Button>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="text-muted-foreground mt-12 flex flex-wrap items-center gap-5 text-sm sm:gap-8"
              >
                <div>
                  <div className="text-foreground text-2xl font-semibold">
                    100+
                  </div>
                  <div>File Formats</div>
                </div>
                <div className="bg-border h-8 w-px" />
                <div>
                  <div className="text-foreground text-2xl font-semibold">
                    9+
                  </div>
                  <div>Cloud Providers</div>
                </div>
                <div className="bg-border h-8 w-px" />
                <div>
                  <div className="text-foreground text-2xl font-semibold">
                    Zero
                  </div>
                  <div>Backend</div>
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
              <h2 className="text-4xl font-light tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Key <span className="text-primary font-medium">Features</span>
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-3xl text-lg leading-relaxed sm:mt-6 md:text-2xl">
                Everything you need to explore, query, and visualize cloud
                storage data
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

        {/* Live Demo Showcase Section */}
        <Section>
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="text-4xl font-light tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                See It{' '}
                <GradientText className="font-semibold">Live</GradientText>
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-3xl text-lg leading-relaxed sm:mt-6 md:text-2xl">
                Interactive demos with real data from public cloud storage
              </p>
            </motion.div>

            <div className="space-y-16 md:space-y-24">
              {featureShowcase.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Header */}
                    <div className="mb-4 flex items-start gap-3 sm:mb-6 sm:gap-4">
                      <div className="bg-primary/10 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12">
                        <Icon className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div>
                        <h3 className="mb-1 text-xl font-semibold sm:text-2xl md:text-3xl">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground max-w-3xl text-base leading-relaxed sm:text-lg">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    {/* Live iframe in browser frame */}
                    <BrowserFrame url={feature.iframeUrl} title={feature.title}>
                      <iframe
                        src={feature.iframeUrl}
                        title={feature.title}
                        loading="lazy"
                        className="h-[400px] w-full sm:h-[500px] md:h-[650px] lg:h-[750px]"
                        allow="clipboard-write"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      />
                    </BrowserFrame>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </Section>

        {/* Supported Formats Section */}
        <Section className="bg-muted/50">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-4xl font-light tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Supported{' '}
                <span className="text-primary font-medium">Formats</span>
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg md:text-xl">
                From tabular data and geospatial layers to 3D models and
                archives
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto max-w-3xl"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {supportedFormats.map((item) => (
                      <div key={item.category} className="space-y-1">
                        <div className="text-primary text-sm font-semibold">
                          {item.category}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {item.formats}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Container>
        </Section>

        {/* npm Packages Section */}
        <Section>
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-4xl font-light tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                npm{' '}
                <GradientText className="font-semibold">Packages</GradientText>
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg md:text-xl">
                Use objex components and utilities in your own projects
              </p>
            </motion.div>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <Badge variant="outline" className="mb-2 w-fit">
                      Svelte 5
                    </Badge>
                    <CardTitle className="text-xl">
                      @walkthru-earth/objex
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Full Svelte 5 component library with stores and utilities
                      for building geospatial storage explorers.
                    </p>
                    <code className="bg-muted inline-block rounded px-2 py-1 text-xs break-all sm:text-sm">
                      npm install @walkthru-earth/objex
                    </code>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <Badge variant="outline" className="mb-2 w-fit">
                      TypeScript
                    </Badge>
                    <CardTitle className="text-xl">
                      @walkthru-earth/objex-utils
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Pure TypeScript utilities — zero Svelte dependency. Works
                      with any JS framework or Node.js.
                    </p>
                    <code className="bg-muted inline-block rounded px-2 py-1 text-xs break-all sm:text-sm">
                      npm install @walkthru-earth/objex-utils
                    </code>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </Container>
        </Section>

        {/* License Section */}
        <Section className="bg-muted/50">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-2xl text-center"
            >
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <Badge variant="outline">CC BY 4.0</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    objex is open-source under CC BY 4.0. Everything runs
                    client-side — your credentials and data never leave your
                    browser.
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
