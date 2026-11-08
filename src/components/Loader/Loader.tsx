import { cn } from '@/utils/cn';
import { useI18n } from '@/i18n';
import { Spinner } from '@/components/Spinner';
import './Loader.css';

interface LoaderProps {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loader = ({ label, fullScreen = false, className }: LoaderProps) => {
  const { t } = useI18n();

  return (
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
      <span className="text-sm">{label ?? t.common.loading}</span>
    </div>
  );
};
