import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { FormField, describedBy } from '@/components/FormField';
import { cn } from '@/utils/cn';
import './TextArea.css';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, hint, optional, className, id, rows = 3, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FormField
      id={fieldId}
      htmlFor={fieldId}
      label={label}
      error={error}
      hint={hint}
      optional={optional}
    >
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy({ id: fieldId, error, hint })}
        className={cn('control textarea', className)}
        {...rest}
      />
    </FormField>
  );
});
