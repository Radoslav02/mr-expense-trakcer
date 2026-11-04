import { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { MonthPicker } from '@/components/MonthPicker';
import { Select } from '@/components/Select';
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS } from '@/constants/expenses';
import { useExpenseFilters } from '@/hooks/useExpenseFilters';
import { selectSortedCategories } from '@/redux/categories/categoriesSelectors';
import { ALL, type PaymentMethod } from '@/types/expense';
import './ExpenseFilters.css';

const PAYMENT_FILTER_OPTIONS = [
  { value: ALL, label: 'Any payment' },
  ...PAYMENT_METHODS.map((method) => ({ value: method, label: PAYMENT_METHOD_LABELS[method] })),
];

export const ExpenseFilters = () => {
  const { filters, hasActiveFilters, setFilter, resetFilters } = useExpenseFilters();
  const categories = useAppSelector(selectSortedCategories);

  const categoryOptions = useMemo(
    () => [
      { value: ALL, label: 'All categories' },
      ...categories.map((category) => ({ value: category.id, label: category.name })),
    ],
    [categories],
  );

  return (
    <div className="expense-filters flex flex-col gap-3 lg:flex-row lg:items-center">
      <MonthPicker value={filters.month} onChange={(month) => setFilter('month', month)} />
      <Input
        label="Search expenses"
        hideLabel
        type="search"
        placeholder="Search title or note"
        value={filters.search}
        onChange={(event) => setFilter('search', event.target.value)}
        leadingIcon={<Search />}
        wrapperClassName="lg:flex-1"
      />
      <div className="grid grid-cols-2 gap-3 lg:flex">
        <Select
          label="Category"
          hideLabel
          value={filters.categoryId}
          options={categoryOptions}
          onChange={(event) => setFilter('categoryId', event.target.value)}
          wrapperClassName="lg:w-44"
        />
        <Select
          label="Payment method"
          hideLabel
          value={filters.paymentMethod}
          options={PAYMENT_FILTER_OPTIONS}
          onChange={(event) => setFilter('paymentMethod', event.target.value as PaymentMethod)}
          wrapperClassName="lg:w-40"
        />
      </div>
      {hasActiveFilters && (
        <Button
          variant="ghost"
          icon={<X />}
          onClick={resetFilters}
          className="expense-filters__reset self-start lg:self-auto"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
};
