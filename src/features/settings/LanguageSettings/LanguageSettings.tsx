import { Card } from '@/components/Card';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { useI18n } from '@/i18n';

/** Switches the app between English and Serbian. */
export const LanguageSettings = () => {
  const { t } = useI18n();

  return (
    <Card title={t.settings.languageTitle} description={t.settings.languageDescription}>
      <LanguageSwitch name="language-settings" />
    </Card>
  );
};
