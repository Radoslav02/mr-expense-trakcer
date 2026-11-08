import { CATEGORY_ICONS, CATEGORY_ICON_NAMES } from '@/constants/categoryIcons';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/cn';
import './IconPicker.css';

interface IconPickerProps {
  value: string;
  color: string;
  onChange: (icon: string) => void;
}

export const IconPicker = ({ value, color, onChange }: IconPickerProps) => {
  const { t } = useI18n();
  const labelOf = (name: string): string => t.categories.icons[name] ?? name.replace(/-/g, ' ');
  return (
    <fieldset className="icon-picker">
      <legend className="mb-2 text-sm font-medium text-ink">{t.categories.form.icon}</legend>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
        {CATEGORY_ICON_NAMES.map((name) => {
          const Icon = CATEGORY_ICONS[name];
          const selected = name === value;
          return (
            <label
              key={name}
              title={labelOf(name)}
              style={selected ? { color, borderColor: color } : undefined}
              className={cn('icon-picker__option', selected && 'is-selected')}
            >
              <input
                type="radio"
                name="category-icon"
                value={name}
                checked={selected}
                onChange={() => onChange(name)}
                className="sr-only"
                aria-label={labelOf(name)}
              />
              <Icon aria-hidden="true" className="h-4 w-4" />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};
