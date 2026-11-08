import { Fragment, type ReactNode } from 'react';
import { useI18n } from './index';

/**
 * Remounts the app when the language changes, so every component, formatted date and memoized
 * value picks up the new language without each one having to subscribe.
 */
export const I18nRoot = ({ children }: { children: ReactNode }) => {
  const { language } = useI18n();
  return <Fragment key={language}>{children}</Fragment>;
};
