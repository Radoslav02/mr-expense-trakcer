import { Moon, Sun } from 'lucide-react';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/redux/settings/settingsTypes';
import { cn } from '@/utils/cn';
import './AppearanceSettings.css';

const THEME_OPTIONS: readonly { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

export const AppearanceSettings = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Card title="Appearance" description="Saved on this device.">
      <fieldset>
        <legend className="sr-only">Theme</legend>
        <div className="appearance-settings inline-flex rounded-lg bg-sunken p-1">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
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
              {label}
            </label>
          ))}
        </div>
      </fieldset>
    </Card>
  );
};
