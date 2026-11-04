import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { FormField, describedBy } from '@/components/FormField';
import { cn } from '@/utils/cn';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  hideLabel?: boolean;
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    optional,
    hideLabel,
    leadingIcon,
    trailing,
    wrapperClassName,
    className,
    id,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FormField
      id={inputId}
      htmlFor={inputId}
      label={label}
      error={error}
      hint={hint}
      optional={optional}
      hideLabel={hideLabel}
      className={wrapperClassName}
    >
      <div className="input relative">
        {leadingIcon && <span className="input__icon text-ink-subtle">{leadingIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy({ id: inputId, error, hint })}
          className={cn('control', leadingIcon && 'pl-9', trailing && 'pr-14', className)}
          {...rest}
        />
        {trailing && <span className="input__trailing text-sm text-ink-subtle">{trailing}</span>}
      </div>
    </FormField>
  );
});
