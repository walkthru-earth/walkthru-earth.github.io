'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SECTIONS } from '@/components/globe/data/sections';

const GlobeExplorer = dynamic(
  () => import('@/components/globe/GlobeExplorer').then((m) => m.GlobeExplorer),
  {
    ssr: false,
    loading: () => (
      <div className="bg-background flex h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-2" />
          <p className="text-muted-foreground font-mono text-sm">
            Loading Globe Explorer...
          </p>
        </div>
      </div>
    ),
  }
);

function IndicesContent() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  const initialSection = sectionParam
    ? Math.max(
        0,
        SECTIONS.findIndex((s) => s.id === sectionParam)
      )
    : 0;

  const z = searchParams.get('z');
  const lat = searchParams.get('y');
  const lng = searchParams.get('x');
  const h3 = searchParams.get('h3');

  return (
    <GlobeExplorer
      initialSection={initialSection}
      initialZoom={z ? parseFloat(z) : undefined}
      initialLat={lat ? parseFloat(lat) : undefined}
      initialLng={lng ? parseFloat(lng) : undefined}
      initialH3Res={h3 ? parseInt(h3, 10) : undefined}
    />
  );
}

export default function IndicesPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex h-dvh items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-2" />
            <p className="text-muted-foreground font-mono text-sm">
              Loading Globe Explorer...
            </p>
          </div>
        </div>
      }
    >
      <IndicesContent />
    </Suspense>
  );
}
