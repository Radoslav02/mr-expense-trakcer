import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { FormField, describedBy } from '@/components/FormField';
import { cn } from '@/utils/cn';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: readonly SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
  hideLabel?: boolean;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, placeholder, error, hint, hideLabel, wrapperClassName, className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FormField
      id={selectId}
      htmlFor={selectId}
      label={label}
      error={error}
      hint={hint}
      hideLabel={hideLabel}
      className={wrapperClassName}
    >
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy({ id: selectId, error, hint })}
          className={cn('control select pr-9', className)}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
        />
      </div>
    </FormField>
  );
});
