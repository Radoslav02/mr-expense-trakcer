import { CATEGORY_ICONS, CATEGORY_ICON_NAMES } from '@/constants/categoryIcons';
import { cn } from '@/utils/cn';
import './IconPicker.css';

interface IconPickerProps {
  value: string;
  color: string;
  onChange: (icon: string) => void;
}

const labelOf = (name: string): string => name.replace(/-/g, ' ');

export const IconPicker = ({ value, color, onChange }: IconPickerProps) => (
  <fieldset className="icon-picker">
    <legend className="mb-2 text-sm font-medium text-ink">Icon</legend>
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
