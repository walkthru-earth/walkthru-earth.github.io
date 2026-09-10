'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import {
  getConsentPreferences,
  updatePostHogConsent,
} from '@/lib/cookie-consent';

let initialized = false;

function initializePostHog(): boolean {
  if (initialized) return true;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  // Analytics is optional in local previews and static builds.
  if (!key?.startsWith('phc_')) return false;

  const consent = getConsentPreferences();
  posthog.init(key, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,
    capture_pageleave: true,
    // Preserve the site's existing policy: memory before a choice,
    // persistence after acceptance, no PostHog capture after rejection.
    persistence: consent?.analytics ? 'localStorage' : 'memory',
    opt_out_capturing_by_default: consent?.analytics === false,
  });
  initialized = true;
  if (consent) updatePostHogConsent(consent.analytics);
  return true;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializePostHog();
  }, []);
  return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function PostHogPageView(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Child effects may run before the provider's initialization effect.
    if (!pathname || !initializePostHog()) return;
    const query = searchParams.toString();
    posthog.capture('$pageview', {
      $current_url: `${window.location.origin}${pathname}${query ? `?${query}` : ''}`,
    });
  }, [pathname, searchParams]);

  return null;
}
