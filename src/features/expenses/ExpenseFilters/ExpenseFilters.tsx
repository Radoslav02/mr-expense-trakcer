import { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { MonthPicker } from '@/components/MonthPicker';
import { Select } from '@/components/Select';
import { PAYMENT_METHODS } from '@/constants/expenses';
import { useExpenseFilters } from '@/hooks/useExpenseFilters';
import { useI18n } from '@/i18n';
import { selectSortedCategories } from '@/redux/categories/categoriesSelectors';
import { ALL, type PaymentMethod } from '@/types/expense';
import './ExpenseFilters.css';

export const ExpenseFilters = () => {
  const { filters, hasActiveFilters, setFilter, resetFilters } = useExpenseFilters();
  const categories = useAppSelector(selectSortedCategories);
  const { t } = useI18n();
  const f = t.expenses.filters;

  const categoryOptions = useMemo(
    () => [
      { value: ALL, label: t.expenses.filters.allCategories },
      ...categories.map((category) => ({ value: category.id, label: category.name })),
    ],
    [categories, t],
  );

  const paymentOptions = useMemo(
    () => [
      { value: ALL, label: t.expenses.filters.anyPayment },
      ...PAYMENT_METHODS.map((method) => ({
        value: method,
        label: t.expenses.paymentMethods[method],
      })),
    ],
    [t],
  );

  return (
    <div className="expense-filters flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
      <MonthPicker value={filters.month} onChange={(month) => setFilter('month', month)} />
      <Input
        label={f.search}
        hideLabel
        type="search"
        placeholder={f.searchPlaceholder}
        value={filters.search}
        onChange={(event) => setFilter('search', event.target.value)}
        leadingIcon={<Search />}
        wrapperClassName="min-w-0 lg:flex-1"
      />
      <div className="grid min-w-0 grid-cols-2 gap-3 lg:flex lg:shrink-0">
        <Select
          label={f.category}
          hideLabel
          value={filters.categoryId}
          options={categoryOptions}
          onChange={(event) => setFilter('categoryId', event.target.value)}
          wrapperClassName="min-w-0 lg:w-44"
        />
        <Select
          label={f.paymentMethod}
          hideLabel
          value={filters.paymentMethod}
          options={paymentOptions}
          onChange={(event) => setFilter('paymentMethod', event.target.value as PaymentMethod)}
          wrapperClassName="min-w-0 lg:w-40"
        />
      </div>
      {hasActiveFilters && (
        <Button
          variant="ghost"
          icon={<X />}
          onClick={resetFilters}
          className="expense-filters__reset self-start lg:self-auto"
        >
          {f.clear}
        </Button>
      )}
    </div>
  );
};
