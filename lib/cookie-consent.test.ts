import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import posthog from 'posthog-js';
import {
  CONSENT_KEY,
  getConsentPreferences,
  saveConsentPreferences,
  updateGoogleConsent,
  updatePostHogConsent,
} from './cookie-consent';

vi.mock('posthog-js', () => ({
  default: {
    config: { token: 'phc_test' },
    set_config: vi.fn(),
    opt_in_capturing: vi.fn(),
    opt_out_capturing: vi.fn(),
  },
}));

const storage = new Map<string, string>();

beforeEach(() => {
  vi.clearAllMocks();
  storage.clear();
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('stored consent', () => {
  it.each([
    'null',
    'false',
    '{}',
    '{"analytics":"true","timestamp":1}',
    'invalid JSON',
  ])('ignores invalid persisted choices: %s', (value) => {
    storage.set(CONSENT_KEY, value);
    expect(getConsentPreferences()).toBeNull();
  });

  it('round-trips an explicit rejection with a new timestamp', () => {
    saveConsentPreferences({ analytics: false, timestamp: 0 });
    expect(getConsentPreferences()).toEqual({
      analytics: false,
      timestamp: expect.any(Number),
    });
    expect(getConsentPreferences()!.timestamp).toBeGreaterThan(0);
  });

  it('tolerates browsers that deny storage access', () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('Storage blocked');
      },
      setItem() {
        throw new Error('Storage blocked');
      },
    });
    expect(getConsentPreferences()).toBeNull();
    expect(() =>
      saveConsentPreferences({ analytics: false, timestamp: 0 })
    ).not.toThrow();
  });
});

describe('analytics consent updates', () => {
  it('updates the imported PostHog instance without requiring window.posthog', () => {
    updatePostHogConsent(true);
    expect(posthog.set_config).toHaveBeenCalledWith({
      persistence: 'localStorage',
    });
    expect(posthog.opt_in_capturing).toHaveBeenCalledOnce();
    updatePostHogConsent(false);
    expect(posthog.opt_out_capturing).toHaveBeenCalledOnce();
    expect(posthog.set_config).toHaveBeenLastCalledWith({
      persistence: 'memory',
    });
  });

  it('keeps advertising consent denied when analytics is accepted', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });
    updateGoogleConsent(true);
    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  });
});
