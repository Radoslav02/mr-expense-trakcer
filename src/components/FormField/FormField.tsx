import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import type { FieldMessageProps } from './describedBy';
import './FormField.css';

interface FormFieldProps extends FieldMessageProps {
  label: string;
  htmlFor: string;
  optional?: boolean;
  hideLabel?: boolean;
  className?: string;
  children: ReactNode;
}

export const FormField = ({
  id,
  label,
  htmlFor,
  error,
  hint,
  optional = false,
  hideLabel = false,
  className,
  children,
}: FormFieldProps) => (
  <div className={cn('form-field flex flex-col gap-1.5', className)}>
    <label htmlFor={htmlFor} className={cn('text-sm font-medium text-ink', hideLabel && 'sr-only')}>
      {label}
      {optional && <span className="ml-1 font-normal text-ink-subtle">(optional)</span>}
    </label>
    {children}
    {error ? (
      <p id={`${id}-error`} role="alert" className="form-field__error text-[0.8125rem] text-danger">
        {error}
      </p>
    ) : (
      hint && (
        <p id={`${id}-hint`} className="text-[0.8125rem] text-ink-subtle">
          {hint}
        </p>
      )
    )}
  </div>
);
