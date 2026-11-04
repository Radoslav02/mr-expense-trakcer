import { cn } from '@/utils/cn';
import './Spinner.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
} as const;

export const Spinner = ({ size = 'md', className }: SpinnerProps) => (
  <span
    aria-hidden="true"
    className={cn(
      'spinner inline-block rounded-full border-current',
      SIZE_CLASSES[size],
      className,
    )}
  />
);
