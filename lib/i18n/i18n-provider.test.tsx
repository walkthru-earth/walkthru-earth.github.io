import {
  Children,
  cloneElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { I18nProvider, Localized, useI18n } from './i18n-provider';

function OnlyChild({ children }: { children: ReactNode }) {
  return cloneElement(
    Children.only(children) as ReactElement<Record<string, unknown>>,
    {
      'data-only-child': true,
    }
  );
}

function InterpolatedFallback() {
  const { t } = useI18n();
  return <span>{t('Uncatalogued {count}', { count: 3 })}</span>;
}

describe('Localized', () => {
  it('preserves a single child for components using asChild', () => {
    expect(() =>
      renderToStaticMarkup(
        <I18nProvider>
          <Localized>
            <OnlyChild>
              <span>Explore the globe</span>
            </OnlyChild>
          </Localized>
        </I18nProvider>
      )
    ).not.toThrow();
  });

  it('preserves keys while translating sibling arrays', () => {
    const originalError = console.error;
    const errors: unknown[][] = [];
    console.error = (...args: unknown[]) => errors.push(args);

    try {
      renderToStaticMarkup(
        <I18nProvider>
          <Localized>
            <nav>
              <span>About</span>
              <span>Globe Explorer</span>
            </nav>
          </Localized>
        </I18nProvider>
      );
    } finally {
      console.error = originalError;
    }

    expect(errors).toEqual([]);
  });

  it('translates Arabic text, interpolates fallbacks, and honors opt-outs', () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="ar-EG">
        <Localized>
          <span>About</span>
          <code>About</code>
          <span translate="no">About</span>
          <span lang="en">About</span>
          <InterpolatedFallback />
        </Localized>
      </I18nProvider>
    );

    expect(html).toContain('عنّا');
    expect(html.match(/About/g)).toHaveLength(3);
    expect(html).toContain('Uncatalogued 3');
  });
});
