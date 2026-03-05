'use client';

import dynamic from 'next/dynamic';

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

export default function IndicesPage() {
  return <GlobeExplorer />;
}
