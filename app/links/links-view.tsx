'use client';

import type { ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { founders } from '@/lib/founders';
import { QRProfile } from './qr-profile';

export function LinksView({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();

  if (searchParams.get('qr') === '1') {
    const profile = founders.find(
      (founder) => founder.id === searchParams.get('profile')
    );
    return <QRProfile profile={profile} />;
  }

  return children;
}
