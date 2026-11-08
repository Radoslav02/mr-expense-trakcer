import { Moon, Sun } from 'lucide-react';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import type { Theme } from '@/redux/settings/settingsTypes';
import { cn } from '@/utils/cn';
import './AppearanceSettings.css';

const THEME_OPTIONS: readonly { value: Theme; icon: typeof Sun }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
];

export const AppearanceSettings = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const copy = t.settings.appearance;

  return (
    <Card title={copy.title} description={copy.description}>
      <fieldset>
        <legend className="sr-only">{copy.theme}</legend>
        <div className="appearance-settings inline-flex rounded-lg bg-sunken p-1">
          {THEME_OPTIONS.map(({ value, icon: Icon }) => (
            <label
              key={value}
              className={cn('appearance-settings__option', theme === value && 'is-selected')}
            >
              <input
                type="radio"
                name="theme"
                value={value}
                checked={theme === value}
                onChange={() => theme !== value && toggleTheme()}
                className="sr-only"
              />
              <Icon aria-hidden="true" className="h-4 w-4" />
              {copy[value]}
            </label>
          ))}
        </div>
      </fieldset>
    </Card>
  );
};
