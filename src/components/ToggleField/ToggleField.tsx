import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import './ToggleField.css';

interface ToggleFieldProps {
  label: string;
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: ReactNode;
  className?: string;
}

/** A labelled on/off switch row. */
export const ToggleField = ({
  label,
  description,
  checked,
  onChange,
  icon,
  className,
}: ToggleFieldProps) => (
  <label
    className={cn(
      'toggle-field flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line p-3.5',
      checked && 'is-on',
      className,
    )}
  >
    <span className="flex min-w-0 items-center gap-3">
      {icon && <span className="toggle-field__icon shrink-0 text-ink-subtle">{icon}</span>}
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && (
          <span className="block text-[0.8125rem] text-ink-subtle">{description}</span>
        )}
      </span>
    </span>
    <input
      type="checkbox"
      role="switch"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="toggle-field__switch"
    />
  </label>
);
