'use client';

import { useEffect } from 'react';
import { initializeDefaultConsent } from '@/lib/cookie-consent';

/**
 * Initializes Google Consent Mode v2 with default "denied" state
 * This must run before Google Analytics loads to be GDPR compliant
 */
export function ConsentInit() {
  useEffect(() => {
    initializeDefaultConsent();
  }, []);

  return null;
}
