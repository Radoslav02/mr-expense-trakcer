import type { CSSProperties } from 'react';
import { UNCATEGORIZED_COLOR } from '@/constants/categories';
import { useI18n } from '@/i18n';
import type { Category } from '@/types/category';
import { cn } from '@/utils/cn';
import './CategoryBadge.css';

interface CategoryBadgeProps {
  category?: Category;
  className?: string;
}

export const CategoryBadge = ({ category, className }: CategoryBadgeProps) => {
  const { t } = useI18n();
  return (
    <span
      style={{ '--category-color': category?.color ?? UNCATEGORIZED_COLOR } as CSSProperties}
      className={cn(
        'category-badge inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      <span aria-hidden="true" className="category-badge__dot h-1.5 w-1.5 shrink-0 rounded-full" />
      <span className="truncate">{category?.name ?? t.common.uncategorized}</span>
    </span>
  );
};
