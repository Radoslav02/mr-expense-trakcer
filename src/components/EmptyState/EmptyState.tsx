import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import './EmptyState.css';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <div className={cn('empty-state flex flex-col items-center px-6 py-14 text-center', className)}>
    <span className="empty-state__icon mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-sunken text-ink-muted">
      {icon}
    </span>
    <h3 className="text-[0.9375rem] font-semibold text-ink">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-ink-subtle">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);
