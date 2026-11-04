import type { CSSProperties } from 'react';
import { Check } from 'lucide-react';
import { CATEGORY_COLOR_OPTIONS } from '@/constants/categories';
import { cn } from '@/utils/cn';
import './ColorPicker.css';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => (
  <fieldset className="color-picker">
    <legend className="mb-2 text-sm font-medium text-ink">Color</legend>
    <div className="flex flex-wrap gap-2">
      {CATEGORY_COLOR_OPTIONS.map((color) => {
        const selected = color.toLowerCase() === value.toLowerCase();
        return (
          <label
            key={color}
            style={{ '--swatch': color } as CSSProperties}
            className={cn('color-picker__swatch', selected && 'is-selected')}
          >
            <input
              type="radio"
              name="category-color"
              value={color}
              checked={selected}
              onChange={() => onChange(color)}
              className="sr-only"
              aria-label={color}
            />
            {selected && <Check aria-hidden="true" className="h-4 w-4 text-white" />}
          </label>
        );
      })}
    </div>
  </fieldset>
);
