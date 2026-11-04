import type { CSSProperties } from 'react';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/constants/categoryIcons';
import { cn } from '@/utils/cn';
import './CategoryIcon.css';

interface CategoryIconProps {
  icon?: string;
  color: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const CategoryIcon = ({ icon, color, size = 'md', className }: CategoryIconProps) => {
  const Icon =
    CATEGORY_ICONS[icon ?? DEFAULT_CATEGORY_ICON] ?? CATEGORY_ICONS[DEFAULT_CATEGORY_ICON];

  return (
    <span
      aria-hidden="true"
      style={{ '--category-color': color } as CSSProperties}
      className={cn(
        'category-icon flex shrink-0 items-center justify-center rounded-lg',
        size === 'sm' ? 'h-7 w-7' : 'h-9 w-9',
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
    </span>
  );
};
