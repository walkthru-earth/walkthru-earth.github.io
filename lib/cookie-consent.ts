// Cookie consent utilities for GDPR compliance

export interface CookieConsent {
  analytics: boolean;
  timestamp: number;
}

const CONSENT_KEY = 'walkthru_cookie_consent';

export function getConsentPreferences(): CookieConsent | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
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
        ...consent,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error('Failed to save consent preferences:', error);
  }
}

export function hasConsented(): boolean {
  const consent = getConsentPreferences();
  return consent !== null;
}

export function hasAnalyticsConsent(): boolean {
  const consent = getConsentPreferences();
  return consent?.analytics ?? false;
}

// Google Consent Mode v2
export function updateGoogleConsent(analytics: boolean): void {
  if (typeof window === 'undefined') return;

  // Type assertion for gtag
  const gtag = (
    window as typeof window & { gtag?: (...args: unknown[]) => void }
  ).gtag;

  if (gtag) {
    gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: 'denied', // We don't use ads
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
}

// PostHog consent management
export function updatePostHogConsent(analytics: boolean): void {
  if (typeof window === 'undefined') return;

  // Type assertion for posthog
  const posthog = (
    window as typeof window & {
      posthog?: { opt_in_capturing: () => void; opt_out_capturing: () => void };
    }
  ).posthog;

  if (posthog) {
    if (analytics) {
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }
  }
}

// Initialize default consent (denied for GDPR compliance)
export function initializeDefaultConsent(): void {
  if (typeof window === 'undefined') return;

  const gtag = (
    window as typeof window & { gtag?: (...args: unknown[]) => void }
  ).gtag;

  if (gtag) {
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500,
    });
  }
}
