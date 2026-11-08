import { Card } from '@/components/Card';
import { LANGUAGES, useI18n } from '@/i18n';
import { cn } from '@/utils/cn';
import '../AppearanceSettings/AppearanceSettings.css';

/** Switches the app between English and Serbian. */
export const LanguageSettings = () => {
  const { t, language, setLanguage } = useI18n();

  return (
    <Card title={t.settings.languageTitle} description={t.settings.languageDescription}>
      <fieldset>
        <legend className="sr-only">{t.settings.languageTitle}</legend>
        <div className="appearance-settings inline-flex rounded-lg bg-sunken p-1">
          {LANGUAGES.map((value) => (
            <label
              key={value}
              lang={value}
              className={cn('appearance-settings__option', language === value && 'is-selected')}
            >
              <input
                type="radio"
                name="language"
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
    </Card>
  );
};
