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

// PostHog consent management with persistence switching
export function updatePostHogConsent(analytics: boolean): void {
  if (typeof window === 'undefined') return;

  // Type assertion for posthog
  const posthog = (
    window as typeof window & {
      posthog?: {
        opt_in_capturing: () => void;
        opt_out_capturing: () => void;
        set_config: (config: { persistence?: string }) => void;
        persistence?: { save: () => void };
      };
    }
  ).posthog;

  if (posthog) {
    if (analytics) {
      // User accepted: switch to localStorage persistence and opt in
      posthog.set_config({ persistence: 'localStorage' });
      posthog.opt_in_capturing();
      // Save any data collected during anonymous session
      if (posthog.persistence) {
        posthog.persistence.save();
      }
    } else {
      // User rejected: opt out completely
      posthog.opt_out_capturing();
    }
  }
}

// Initialize default consent based on user's previous decision
// If no decision yet, we use Google's Advanced Consent Mode which allows
// cookieless pings while respecting privacy (no cookies stored)
export function initializeDefaultConsent(): void {
  if (typeof window === 'undefined') return;

  const gtag = (
    window as typeof window & { gtag?: (...args: unknown[]) => void }
  ).gtag;

  if (gtag) {
    const consent = getConsentPreferences();

    if (consent === null) {
      // No decision yet: use Advanced Consent Mode
      // Google will collect anonymized, cookieless data
      gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
      });
    } else if (consent.analytics) {
      // User accepted: full consent
      gtag('consent', 'default', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    } else {
      // User rejected: no tracking
      gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
  }
}
