import posthog from 'posthog-js';

export interface CookieConsent {
  analytics: boolean;
  timestamp: number;
}

export const CONSENT_KEY = 'walkthru_cookie_consent';

export function getConsentPreferences(): CookieConsent | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    const consent: unknown = JSON.parse(stored);
    if (
      typeof consent !== 'object' ||
      consent === null ||
      !('analytics' in consent) ||
      typeof consent.analytics !== 'boolean' ||
      !('timestamp' in consent) ||
      typeof consent.timestamp !== 'number' ||
      !Number.isFinite(consent.timestamp)
    )
      return null;
    return { analytics: consent.analytics, timestamp: consent.timestamp };
  } catch {
    return null;
  }
}

export function saveConsentPreferences(consent: CookieConsent): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        analytics: consent.analytics,
        timestamp: Date.now(),
      })
    );
  } catch {
    // Browsers may block storage; the current session still applies the choice.
  }
}

export function hasConsented(): boolean {
  return getConsentPreferences() !== null;
}

export function hasAnalyticsConsent(): boolean {
  return getConsentPreferences()?.analytics ?? false;
}

export function updateGoogleConsent(analytics: boolean): void {
  if (typeof window === 'undefined') return;
  const gtag = (
    window as typeof window & {
      gtag?: (...args: unknown[]) => void;
    }
  ).gtag;
  gtag?.('consent', 'update', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
}

export function updatePostHogConsent(analytics: boolean): void {
  if (typeof window === 'undefined' || !posthog.config.token) return;
  if (analytics) {
    posthog.set_config({ persistence: 'localStorage' });
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
    posthog.set_config({ persistence: 'memory' });
  }
}
