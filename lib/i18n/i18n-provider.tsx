'use client';

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from 'react';
import { messages } from './messages';
import type { Locale } from './types';

const STORAGE_KEY = 'walkthru-locale';
const LOCALE_CHANGE_EVENT = 'walkthru-locale-change';
const RTL_LOCALES: Locale[] = ['ar-EG', 'ar'];
let memoryLocale: Locale | null = null;
const TRANSLATABLE_PROPS = [
  'alt',
  'aria-label',
  'aria-description',
  'placeholder',
  'title',
] as const;

type Values = Record<string, string | number>;

interface I18nContextValue {
  locale: Locale;
  direction: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
  t: (source: string, values?: Values) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value === 'en' || value === 'ar-EG' || value === 'ar';
}

function getClientLocale(): Locale {
  if (memoryLocale) return memoryLocale;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // Storage may be unavailable in hardened/private browsing contexts.
  }
  return 'en';
}

function subscribeToLocale(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(LOCALE_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(LOCALE_CHANGE_EVENT, onChange);
  };
}

function interpolate(message: string, values?: Values) {
  if (!values) return message;
  return message.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

export function I18nProvider({
  children,
  initialLocale = 'en',
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getClientLocale,
    () => initialLocale
  );

  const setLocale = useCallback((nextLocale: Locale) => {
    memoryLocale = nextLocale;
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // The in-memory choice still works for the current page.
    }
    window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
  }, []);

  const direction: I18nContextValue['direction'] = RTL_LOCALES.includes(locale)
    ? 'rtl'
    : 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [direction, locale]);

  const t = useCallback(
    (source: string, values?: Values) => {
      if (locale === 'en') return interpolate(source, values);
      const normalizedSource = source.replace(/\s+/g, ' ').trim();
      const translated = messages[source] ?? messages[normalizedSource];
      const message = locale === 'ar-EG' ? translated?.arEG : translated?.ar;
      return interpolate(message ?? source, values);
    },
    [locale]
  );

  const value = useMemo(
    () => ({ locale, direction, setLocale, t }),
    [direction, locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}

function localizeString(value: string, t: I18nContextValue['t']) {
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match || !match[2]) return value;
  return `${match[1]}${t(match[2])}${match[3]}`;
}

function localizeNode(node: ReactNode, t: I18nContextValue['t']): ReactNode {
  if (typeof node === 'string') return localizeString(node, t);
  if (!isValidElement(node)) return node;

  const element = node as ReactElement<Record<string, unknown>>;
  const elementName = typeof element.type === 'string' ? element.type : null;
  if (
    element.props.translate === 'no' ||
    typeof element.props.lang === 'string' ||
    elementName === 'code' ||
    elementName === 'pre' ||
    elementName === 'script' ||
    elementName === 'style'
  ) {
    return element;
  }
  const nextProps: Record<string, unknown> = {};

  for (const prop of TRANSLATABLE_PROPS) {
    const value = element.props[prop];
    if (typeof value === 'string') nextProps[prop] = t(value);
  }

  if ('children' in element.props) {
    const children = element.props.children as ReactNode;
    nextProps.children = Array.isArray(children)
      ? Children.map(children, (child) => localizeNode(child, t))
      : localizeNode(children, t);
  }

  return cloneElement(element, nextProps);
}

/**
 * Translates static React text and common accessible attributes before render.
 * Add this boundary to every component that owns user-facing copy. Dynamic
 * composed messages should call `t` directly for explicit interpolation.
 */
export function Localized({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return <>{Children.map(children, (child) => localizeNode(child, t))}</>;
}
