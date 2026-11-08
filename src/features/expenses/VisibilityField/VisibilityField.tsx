import { Lock, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Visibility } from '@/utils/validation';
import './VisibilityField.css';

interface VisibilityFieldProps {
  value: Visibility;
  onChange: (value: Visibility) => void;
  partnerName: string;
}

/** Chooses whether the partner can see an expense at all. */
export const VisibilityField = ({ value, onChange, partnerName }: VisibilityFieldProps) => {
  const options = [
    {
      value: 'shared' as const,
      label: `With ${partnerName}`,
      hint: `${partnerName} can see it`,
      icon: <Users aria-hidden="true" />,
    },
    {
      value: 'private' as const,
      label: 'Only me',
      hint: 'Private, never shown to them',
      icon: <Lock aria-hidden="true" />,
    },
  ];

  return (
    <fieldset className="visibility-field sm:col-span-2">
      <legend className="mb-1.5 text-sm font-medium text-ink">Who is this for?</legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'visibility-field__option flex min-w-0 items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 text-left',
              value === option.value && 'is-selected',
              option.value === 'private' && 'is-private',
            )}
          >
            <span className="visibility-field__icon shrink-0">{option.icon}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink">{option.label}</span>
              <span className="block truncate text-xs text-ink-subtle">{option.hint}</span>
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
};
