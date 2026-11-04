import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { OTHER_CATEGORY_ID } from '@/constants/categories';
import type { Category } from '@/types/category';
import { CategoryIcon } from '../CategoryIcon';
import './CategoryRow.css';

interface CategoryRowProps {
  category: Category;
  expenseCount: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const countLabel = (count: number): string =>
  count === 0 ? 'No expenses' : `${count} ${count === 1 ? 'expense' : 'expenses'}`;

export const CategoryRow = ({ category, expenseCount, onEdit, onDelete }: CategoryRowProps) => {
  const isProtected = category.id === OTHER_CATEGORY_ID;

  return (
    <li className="category-row flex items-center gap-3 px-4 py-3 sm:px-5">
      <CategoryIcon icon={category.icon} color={category.color} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9375rem] font-medium text-ink">{category.name}</p>
        <p className="text-[0.8125rem] text-ink-subtle">
          {countLabel(expenseCount)}
          {category.isDefault && <span> · Default</span>}
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
          {`Edit ${category.name}`}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          icon={<Trash2 />}
          onClick={() => onDelete(category)}
          disabled={isProtected}
          title={
            isProtected ? 'Other collects reassigned expenses and cannot be deleted' : undefined
          }
          className="hover:text-danger"
        >
          {`Delete ${category.name}`}
        </Button>
      </div>
    </li>
  );
};
