import { CircleAlert } from 'lucide-react';
import { Button } from '@/components/Button';
import { cn } from '@/utils/cn';
import './InlineError.css';

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const InlineError = ({ message, onRetry, className }: InlineErrorProps) => (
  <div
    role="alert"
    className={cn(
      'inline-error flex items-start gap-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger',
      className,
    )}
  >
    <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
    <p className="flex-1">{message}</p>
    {onRetry && (
      <Button
        variant="ghost"
        size="sm"
        onClick={onRetry}
        className="-my-1 text-danger hover:text-danger"
      >
        Retry
      </Button>
    )}
  </div>
);
