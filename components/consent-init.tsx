/* oxlint-disable next/no-before-interactive-script-outside-document -- Imported only by app/layout.tsx, the App Router location for beforeInteractive scripts. */
import Script from 'next/script';

/** Queue defaults before Next's afterInteractive Google Analytics scripts. */
export function ConsentInit() {
  return (
    <Script
      id="analytics-consent-defaults"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
          var analyticsConsent = false;
          try {
            var consent = JSON.parse(localStorage.getItem('walkthru_cookie_consent'));
            analyticsConsent = consent !== null && consent.analytics === true &&
              typeof consent.timestamp === 'number' && Number.isFinite(consent.timestamp);
          } catch (_) {}
          window.gtag('consent', 'default', {
            analytics_storage: analyticsConsent ? 'granted' : 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
          });
        `,
      }}
    />
  );
}
