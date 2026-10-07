'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SECTION_IDS } from '@/components/globe/data/section-ids';
import { parseViewportParams } from '@/components/globe/utils/viewport-params';
import { Localized } from '@/lib/i18n/i18n-provider';
import { BrandPanel } from '@/components/shared/brand-ui';

const GlobeExplorer = dynamic(
  () => import('@/components/globe/GlobeExplorer').then((m) => m.GlobeExplorer),
  {
    ssr: false,
    loading: () => (
      <Localized>
        <div className="bg-background flex h-dvh items-center justify-center">
          <BrandPanel
            tone="spatial"
            className="flex flex-col items-center gap-4"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <p className="font-mono text-sm font-bold">
              Loading Globe Explorer...
            </p>
          </BrandPanel>
        </div>
      </Localized>
    ),
  }
);

function IndicesContent() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');
  const initialSection = sectionParam
    ? Math.max(
        0,
        SECTION_IDS.findIndex((id) => id === sectionParam)
      )
    : 0;

  const viewport = parseViewportParams(searchParams);

  return <GlobeExplorer initialSection={initialSection} {...viewport} />;
}

export default function IndicesPage() {
  return (
    <Suspense
      fallback={
        <Localized>
          <div className="bg-background flex h-dvh items-center justify-center">
            <BrandPanel
              tone="spatial"
              className="flex flex-col items-center gap-4"
            >
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <p className="font-mono text-sm font-bold">
                Loading Globe Explorer...
              </p>
            </BrandPanel>
          </div>
        </Localized>
      }
    >
      <IndicesContent />
    </Suspense>
  );
}
