export interface FieldMessageProps {
  id: string;
  error?: string;
  hint?: string;
}

export const describedBy = ({ id, error, hint }: FieldMessageProps): string | undefined =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;
