import type { ReactNode } from 'react';
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
  /** The user's part: the full amount, or their half when the expense is split. */
  formattedAmount: string;
  /** Set when the expense is split: the full price. */
  formattedTotal?: string;
  partnerName: string;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export const ExpenseItem = ({
  expense,
  category,
  formattedAmount,
  formattedTotal,
  partnerName,
  onEdit,
  onDelete,
}: ExpenseItemProps) => {
  const paidByPartner = expense.shared?.paidByOther ?? false;
  const splitLabel = formattedTotal
    ? paidByPartner
      ? `${partnerName} paid ${formattedTotal}`
      : `Split of ${formattedTotal}`
    : null;

  const content: ReactNode = (
    <>
      <CategoryIcon icon={category?.icon} color={category?.color ?? UNCATEGORIZED_COLOR} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9375rem] font-medium text-ink">
          {expense.title}
        </span>
        <span className="mt-0.5 flex min-w-0 items-center gap-2 text-[0.8125rem] text-ink-subtle">
          <CategoryBadge category={category} className="hidden min-w-0 sm:inline-flex" />
          <span className="min-w-0 truncate sm:hidden">{category?.name ?? 'Uncategorized'}</span>
          <span aria-hidden="true" className="shrink-0">
            ·
          </span>
          <span className="shrink-0 whitespace-nowrap">
            {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
          </span>
          {expense.note && (
            <>
              <span aria-hidden="true" className="hidden shrink-0 md:inline">
                ·
              </span>
              <span className="hidden min-w-0 truncate md:inline">{expense.note}</span>
            </>
          )}
        </span>
      </span>
      <span className="flex max-w-[50%] shrink-0 flex-col items-end text-right">
        <span className="tabular whitespace-nowrap text-[0.9375rem] font-semibold text-ink">
          {formattedAmount}
        </span>
        {splitLabel && (
          <span className="mt-0.5 flex max-w-full items-center justify-end gap-1.5 text-[0.75rem] text-ink-subtle">
            <span className="shrink-0 rounded bg-partner-soft px-1.5 py-px font-medium text-partner">
              Split
            </span>
            {/* Phones get the short form; the full sentence is in the row's accessible name. */}
            <span className="tabular truncate sm:hidden">
              {paidByPartner ? `${partnerName} paid` : `of ${formattedTotal}`}
            </span>
            <span className="tabular hidden truncate sm:inline">{splitLabel}</span>
          </span>
        )}
      </span>
    </>
  );

  const description = `${expense.title}, your part ${formattedAmount}${splitLabel ? `, ${splitLabel}` : ''}`;

  if (paidByPartner) {
    return (
      <li
        className="expense-item flex items-center gap-3 px-4 py-3 sm:px-5"
        aria-label={description}
      >
        {content}
      </li>
    );
  }

  return (
    <li className="expense-item group relative flex items-center">
      <button
        type="button"
        onClick={() => onEdit(expense)}
        className="expense-item__main flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left sm:px-5"
        aria-label={`Edit ${description}`}
      >
        {content}
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
};
