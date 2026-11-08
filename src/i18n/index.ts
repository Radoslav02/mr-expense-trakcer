import { useSyncExternalStore } from 'react';
import { enUS, srLatn, type Locale } from 'date-fns/locale';
import { en, type Messages } from './en';
import { sr } from './sr';

export type { Messages } from './en';

export type Language = 'en' | 'sr';

export const LANGUAGES: readonly Language[] = ['en', 'sr'];

const DICTIONARIES: Record<Language, Messages> = { en, sr };
const INTL_LOCALES: Record<Language, string> = { en: 'en-US', sr: 'sr-Latn-RS' };
const DATE_LOCALES: Record<Language, Locale> = { en: enUS, sr: srLatn };
const STORAGE_KEY = 'tally.language';

const isLanguage = (value: unknown): value is Language => LANGUAGES.includes(value as Language);

const detectLanguage = (): Language => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) return stored;
  } catch {
    // Storage can be blocked; fall back to the browser language.
  }
  const browser =
    typeof navigator !== 'undefined' ? (navigator.languages ?? [navigator.language]) : [];
  return browser.some((tag) => /^(sr|hr|bs|sh|cnr)\b/i.test(tag)) ? 'sr' : 'en';
};

let current: Language = detectLanguage();
const listeners = new Set<() => void>();

const applyToDocument = (language: Language) => {
  if (typeof document !== 'undefined') document.documentElement.lang = INTL_LOCALES[language];
};
applyToDocument(current);

export const getLanguage = (): Language => current;

/** The current language's messages, for code outside React (validation, thunks, formatting). */
export const getMessages = (): Messages => DICTIONARIES[current];

/** Locale tag for `Intl` number and currency formatting. */
export const intlLocale = (): string => INTL_LOCALES[current];

/** Locale for date-fns `format`. */
export const dateLocale = (): Locale => DATE_LOCALES[current];

export const setLanguage = (language: Language): void => {
  if (language === current) return;
  current = language;
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Not saved, but still applied for this session.
  }
  applyToDocument(language);
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * Input selector for memoized Redux selectors that produce text, so they recompute when the
 * language changes: `createSelector([selectSomething, selectLanguage], …)`.
 */
export const selectLanguage = (): Language => current;

/** `t` holds every message for the current language: `t.expenses.title`, `t.common.count(n)`. */
export const useI18n = () => {
  const language = useSyncExternalStore(subscribe, getLanguage, getLanguage);
  return { t: DICTIONARIES[language], language, setLanguage };
};
