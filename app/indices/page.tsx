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
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
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

  return <GlobeExplorer initialSection={initialSection} />;
}

export default function IndicesPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
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
