'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { getConsentPreferences } from '@/lib/cookie-consent';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const consent = getConsentPreferences();

    // Determine persistence based on consent status
    // - No decision yet: use 'memory' (cookieless, anonymous tracking)
    // - Accepted: use 'localStorage' (full tracking with persistence)
    // - Rejected: use 'memory' but opt out completely
    const hasDecided = consent !== null;
    const hasAccepted = consent?.analytics === true;

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // Disable automatic pageview capture
      capture_pageleave: true,
      // Cookieless-first: use memory until user accepts
      persistence: hasAccepted ? 'localStorage' : 'memory',
      // Don't opt out by default - we track anonymously until decision
      opt_out_capturing_by_default: false,
    });

    // Apply consent decision if user has already decided
    if (hasDecided) {
      if (hasAccepted) {
        posthog.opt_in_capturing();
      } else {
        // User explicitly rejected - stop all tracking
        posthog.opt_out_capturing();
      }
    }
    // If no decision yet, tracking continues anonymously (cookieless)
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function PostHogPageView(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}
