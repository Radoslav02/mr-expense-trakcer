import { useAppSelector } from '@/app/hooks';
import { Card } from '@/components/Card';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { selectCategoryMap } from '@/redux/categories/categoriesSelectors';
import type { Expense, ExpenseDayGroup } from '@/types/expense';
import { formatDayHeading } from '@/utils/dates';
import { isSplit, ownShare } from '@/utils/split';
import { ExpenseItem } from '../ExpenseItem';
import './ExpenseList.css';

interface ExpenseListProps {
  groups: readonly ExpenseDayGroup[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export const ExpenseList = ({ groups, onEdit, onDelete }: ExpenseListProps) => {
  const categories = useAppSelector(selectCategoryMap);
  const { format } = useCurrencyFormatter();

  return (
    <div className="expense-list flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.date} aria-labelledby={`day-${group.date}`}>
          <header className="mb-2 flex items-baseline justify-between px-1">
            <h3 id={`day-${group.date}`} className="text-sm font-medium text-ink-muted">
              {formatDayHeading(group.date)}
            </h3>
            <span className="tabular text-sm text-ink-subtle">{format(group.total)}</span>
          </header>
          <Card padded={false} as="div">
            <ul>
              {group.expenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  category={categories[expense.categoryId]}
                  formattedAmount={format(expense.amount)}
                  formattedShare={isSplit(expense) ? format(ownShare(expense)) : undefined}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          </Card>
        </section>
      ))}
    </div>
  );
};
