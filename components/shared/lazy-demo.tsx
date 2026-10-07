'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Localized } from '@/lib/i18n/i18n-provider';
import { observeFirstView } from '@/lib/observe-first-view';

/** Mount expensive content on first view; retain its state until unmounted. */
export function LazyDemo({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    return observeFirstView(element, () => setLoaded(true));
  }, []);

  return (
    <div ref={container} className={className} data-demo-loaded={loaded}>
      {loaded ? (
        children
      ) : (
        <Localized>
          <div
            className="flex h-full min-h-[inherit] items-center justify-center p-6"
            role="status"
          >
            <p className="text-muted-foreground text-sm">
              Loading interactive demo…
            </p>
          </div>
        </Localized>
      )}
    </div>
  );
}
