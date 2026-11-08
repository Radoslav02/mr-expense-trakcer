import { Pencil, Trash2 } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { OTHER_CATEGORY_ID } from '@/constants/categories';
import { useI18n } from '@/i18n';
import { selectCategoryMap } from '@/redux/categories/categoriesSelectors';
import type { Category } from '@/types/category';
import { CategoryIcon } from '../CategoryIcon';
import './CategoryRow.css';

interface CategoryRowProps {
  category: Category;
  expenseCount: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export const CategoryRow = ({ category, expenseCount, onEdit, onDelete }: CategoryRowProps) => {
  const { t } = useI18n();
  const otherName =
    useAppSelector(selectCategoryMap)[OTHER_CATEGORY_ID]?.name ??
    t.categories.defaults[OTHER_CATEGORY_ID];
  const isProtected = category.id === OTHER_CATEGORY_ID;

  return (
    <li className="category-row flex items-center gap-3 px-4 py-3 sm:px-5">
      <CategoryIcon icon={category.icon} color={category.color} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9375rem] font-medium text-ink">{category.name}</p>
        <p className="text-[0.8125rem] text-ink-subtle">
          {expenseCount === 0 ? t.categories.noExpenses : t.common.expenseCount(expenseCount)}
          {category.isDefault && <span> · {t.categories.defaultBadge}</span>}
        </p>
      </div>
      <div className="category-row__actions flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          icon={<Pencil />}
          onClick={() => onEdit(category)}
        >
          {t.categories.row.edit(category.name)}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          icon={<Trash2 />}
          onClick={() => onDelete(category)}
          disabled={isProtected}
          title={isProtected ? t.categories.row.protected(otherName) : undefined}
          className="hover:text-danger"
        >
          {t.categories.row.delete(category.name)}
        </Button>
      </div>
    </li>
  );
};
