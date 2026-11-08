import { LANGUAGES, useI18n } from '@/i18n';
import { cn } from '@/utils/cn';
import './LanguageSwitch.css';

interface LanguageSwitchProps {
  /** Distinguishes the radio groups when the switch is on screen twice. */
  name?: string;
  className?: string;
}

/** English / Srpski segmented control. */
export const LanguageSwitch = ({ name = 'language', className }: LanguageSwitchProps) => {
  const { t, language, setLanguage } = useI18n();

  return (
    <fieldset className={className}>
      <legend className="sr-only">{t.settings.languageTitle}</legend>
      <div className="language-switch inline-flex rounded-lg bg-sunken p-1">
        {LANGUAGES.map((value) => (
          <label
            key={value}
            lang={value}
            className={cn('language-switch__option', language === value && 'is-selected')}
          >
            <input
              type="radio"
              name={name}
              value={value}
              checked={language === value}
              onChange={() => setLanguage(value)}
              className="sr-only"
            />
            {t.common.language[value]}
          </label>
        ))}
      </div>
    </fieldset>
  );
};
