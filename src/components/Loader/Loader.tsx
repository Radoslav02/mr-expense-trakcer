import { cn } from '@/utils/cn';
import { Spinner } from '@/components/Spinner';
import './Loader.css';

interface LoaderProps {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loader = ({ label = 'Loading', fullScreen = false, className }: LoaderProps) => (
  <div
    role="status"
    aria-live="polite"
    className={cn(
      'loader flex flex-col items-center justify-center gap-3 text-ink-subtle',
      fullScreen ? 'min-h-dvh' : 'py-16',
      className,
    )}
  >
    <Spinner size="lg" className="text-accent" />
    <span className="text-sm">{label}</span>
  </div>
);
