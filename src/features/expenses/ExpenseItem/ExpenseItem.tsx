import { Trash2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { PAYMENT_METHOD_LABELS } from '@/constants/expenses';
import { UNCATEGORIZED_COLOR } from '@/constants/categories';
import type { Category } from '@/types/category';
import type { Expense } from '@/types/expense';
import { CategoryBadge } from '@/features/categories/CategoryBadge';
import { CategoryIcon } from '@/features/categories/CategoryIcon';
import './ExpenseItem.css';

interface ExpenseItemProps {
  expense: Expense;
  category?: Category;
  formattedAmount: string;
  /** Set when the expense is split: the part the user carries. */
  formattedShare?: string;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export const ExpenseItem = ({
  expense,
  category,
  formattedAmount,
  formattedShare,
  onEdit,
  onDelete,
}: ExpenseItemProps) => (
  <li className="expense-item group relative flex items-center">
    <button
      type="button"
      onClick={() => onEdit(expense)}
      className="expense-item__main flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left sm:px-5"
      aria-label={`Edit ${expense.title}, ${formattedAmount}${formattedShare ? `, split, your share ${formattedShare}` : ''}`}
    >
      <CategoryIcon icon={category?.icon} color={category?.color ?? UNCATEGORIZED_COLOR} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9375rem] font-medium text-ink">
          {expense.title}
        </span>
        <span className="mt-0.5 flex min-w-0 items-center gap-2 text-[0.8125rem] text-ink-subtle">
          <CategoryBadge category={category} className="hidden sm:inline-flex" />
          <span className="sm:hidden">{category?.name ?? 'Uncategorized'}</span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{PAYMENT_METHOD_LABELS[expense.paymentMethod]}</span>
          {expense.note && (
            <>
              <span aria-hidden="true" className="hidden md:inline">
                ·
              </span>
              <span className="hidden truncate md:inline">{expense.note}</span>
            </>
          )}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="tabular block text-[0.9375rem] font-semibold text-ink">
          {formattedAmount}
        </span>
        {formattedShare && (
          <span className="mt-0.5 flex items-center justify-end gap-1.5 text-[0.75rem] text-ink-subtle">
            <span className="rounded bg-partner-soft px-1.5 py-px font-medium text-partner">
              Split
            </span>
            <span className="tabular">yours {formattedShare}</span>
          </span>
        )}
      </span>
    </button>
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      icon={<Trash2 />}
      onClick={() => onDelete(expense)}
      className="expense-item__delete mr-2 hover:text-danger sm:mr-3"
    >
      {`Delete ${expense.title}`}
    </Button>
  </li>
);
