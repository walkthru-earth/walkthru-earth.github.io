'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { findFounder, founderPath, type Founder } from '@/lib/founders';
import { QRProfile } from './qr-profile';

export function LinksView({
  children,
  profile: routeProfile,
}: {
  children: ReactNode;
  profile?: Founder;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const legacyProfile = findFounder(searchParams.get('profile'));
  const profile = routeProfile ?? legacyProfile;

  useEffect(() => {
    if (routeProfile || !legacyProfile) return;
    const query = new URLSearchParams(searchParams.toString());
    query.delete('profile');
    const suffix = query.size ? `?${query}` : '';
    router.replace(`${founderPath(legacyProfile)}${suffix}`, { scroll: false });
  }, [routeProfile, legacyProfile, router, searchParams]);

  if (searchParams.get('qr') === '1') {
    return <QRProfile profile={profile} />;
  }

  return children;
}
