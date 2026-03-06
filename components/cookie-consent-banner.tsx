'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  getConsentPreferences,
  saveConsentPreferences,
  updateGoogleConsent,
  updatePostHogConsent,
  hasConsented,
} from '@/lib/cookie-consent';
import { Cookie } from 'lucide-react';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Hydration-safe client-side initialization
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Mark as client-side to prevent hydration mismatch
    setIsClient(true);

    // Check if user has already made a choice
    const alreadyConsented = hasConsented();
    setShowBanner(!alreadyConsented);

    // Apply existing consent if available
    const consent = getConsentPreferences();
    if (consent) {
      updateGoogleConsent(consent.analytics);
      updatePostHogConsent(consent.analytics);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Don't render anything on server (prevents hydration mismatch)
  if (!isClient) return null;

  const handleAcceptAll = () => {
    const consent = { analytics: true, timestamp: Date.now() };
    saveConsentPreferences(consent);
    updateGoogleConsent(true);
    updatePostHogConsent(true);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const consent = { analytics: false, timestamp: Date.now() };
    saveConsentPreferences(consent);
    updateGoogleConsent(false);
    updatePostHogConsent(false);
    setShowBanner(false);
  };

  const handleSaveSettings = () => {
    const consent = { analytics: analyticsEnabled, timestamp: Date.now() };
    saveConsentPreferences(consent);
    updateGoogleConsent(analyticsEnabled);
    updatePostHogConsent(analyticsEnabled);
    setShowSettings(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed right-0 bottom-0 left-0 z-50 border-t shadow-lg backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3 md:px-12 lg:px-24">
          <Cookie className="text-primary hidden h-5 w-5 flex-shrink-0 sm:block" />
          <p className="text-muted-foreground min-w-0 flex-1 text-sm leading-snug">
            We use analytics cookies to understand how you use our site.{' '}
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="text-foreground underline underline-offset-2"
            >
              Settings
            </button>
          </p>
          <div className="flex flex-shrink-0 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRejectAll}
              className="text-muted-foreground h-8 px-3 text-sm"
            >
              Reject
            </Button>
            <Button
              size="sm"
              onClick={handleAcceptAll}
              className="h-8 px-4 text-sm"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. You can enable or disable
              different types of cookies below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Essential Cookies (Always On) */}
            <div className="flex items-center justify-between space-x-2">
              <div className="flex-1">
                <Label htmlFor="essential" className="text-sm font-medium">
                  Essential Cookies
                </Label>
                <p className="text-muted-foreground mt-1 text-sm">
                  Required for the website to function properly. These cannot be
                  disabled.
                </p>
              </div>
              <Switch
                id="essential"
                checked={true}
                disabled
                aria-label="Essential cookies (always enabled)"
              />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center justify-between space-x-2">
              <div className="flex-1">
                <Label htmlFor="analytics" className="text-sm font-medium">
                  Analytics Cookies
                </Label>
                <p className="text-muted-foreground mt-1 text-sm">
                  Help us understand how visitors interact with our website by
                  collecting anonymous information.
                </p>
              </div>
              <Switch
                id="analytics"
                checked={analyticsEnabled}
                onCheckedChange={setAnalyticsEnabled}
                aria-label="Toggle analytics cookies"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleRejectAll}>
              Reject All
            </Button>
            <Button onClick={handleSaveSettings}>Save Preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
