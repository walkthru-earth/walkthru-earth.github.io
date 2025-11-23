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
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed right-0 bottom-0 left-0 z-50 border-t p-4 shadow-lg backdrop-blur">
        <div className="container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <Cookie className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">We use cookies</p>
              <p className="text-muted-foreground mt-1 text-xs">
                We use analytics cookies to help us improve our website by
                collecting and reporting information on how you use it. These
                cookies help us understand visitor interactions.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="whitespace-nowrap"
            >
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRejectAll}
              className="whitespace-nowrap"
            >
              Reject All
            </Button>
            <Button
              size="sm"
              onClick={handleAcceptAll}
              className="whitespace-nowrap"
            >
              Accept All
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
                <p className="text-muted-foreground mt-1 text-xs">
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
                <p className="text-muted-foreground mt-1 text-xs">
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
