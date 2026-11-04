import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  actions?: ReactNode;
  padded?: boolean;
  as?: 'section' | 'article' | 'div';
}

export const Card = ({
  title,
  description,
  actions,
  padded = true,
  as: Tag = 'section',
  className,
  children,
  ...rest
}: CardProps) => (
  <Tag
    className={cn('card rounded-xl border border-line bg-surface shadow-card', className)}
    {...rest}
  >
    {(title || actions) && (
      <header className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="min-w-0">
          {title && <h2 className="text-[0.9375rem] font-semibold text-ink">{title}</h2>}
          {description && <p className="mt-0.5 text-sm text-ink-subtle">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
    )}
    <div className={cn(padded && 'p-5', padded && (title || actions) && 'pt-4')}>{children}</div>
  </Tag>
);
