import { useState } from 'react';
import { FileDown, Plus, ReceiptText, SearchX } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { InlineError } from '@/components/InlineError';
import { PageHeader } from '@/components/PageHeader';
import { DeleteExpenseDialog } from '@/features/expenses/DeleteExpenseDialog';
import { ExpenseFilters } from '@/features/expenses/ExpenseFilters';
import { ExpenseForm } from '@/features/expenses/ExpenseForm';
import { ExpenseList } from '@/features/expenses/ExpenseList';
import { ExpenseListSkeleton } from '@/features/expenses/ExpenseListSkeleton';
import { ExportExpensesModal } from '@/features/expenses/ExportExpensesModal';
import { RecurringList } from '@/features/expenses/RecurringList';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useExpenseDialogs } from '@/hooks/useExpenseDialogs';
import { useExpenseFilters } from '@/hooks/useExpenseFilters';
import { useI18n } from '@/i18n';
import {
  selectExpensesError,
  selectExpensesStatus,
  selectFilteredDayGroups,
  selectFilteredExpenses,
  selectFilteredTotal,
} from '@/redux/expenses/expensesSelectors';
import { loadExpenses } from '@/redux/expenses/expensesThunks';
import { periodLabel } from '@/utils/expenses';
import './ExpensesPage.css';

export const ExpensesPage = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectExpensesStatus);
  const error = useAppSelector(selectExpensesError);
  const filtered = useAppSelector(selectFilteredExpenses);
  const groups = useAppSelector(selectFilteredDayGroups);
  const total = useAppSelector(selectFilteredTotal);
  const { filters, hasActiveFilters, resetFilters } = useExpenseFilters();
  const { format } = useCurrencyFormatter();
  const dialogs = useExpenseDialogs();
  const [exporting, setExporting] = useState(false);
  const { t } = useI18n();
  const page = t.expenses.page;
  const loading = status === 'idle' || status === 'loading';

  const renderContent = () => {
    if (loading) return <ExpenseListSkeleton />;
    if (groups.length > 0) {
      return (
        <ExpenseList groups={groups} onEdit={dialogs.openEdit} onDelete={dialogs.requestDelete} />
      );
    }
    if (hasActiveFilters) {
      return (
        <EmptyState
          icon={<SearchX />}
          title={page.noMatchTitle}
          description={page.noMatchDescription}
          action={
            <Button variant="secondary" onClick={resetFilters}>
              {t.expenses.filters.clear}
            </Button>
          }
        />
      );
    }
    return (
      <EmptyState
        icon={<ReceiptText />}
        title={page.emptyTitle(periodLabel(filters))}
        description={page.emptyDescription}
        action={
          <Button icon={<Plus />} onClick={dialogs.openCreate}>
            {t.expenses.add}
          </Button>
        }
      />
    );
  };

  return (
    <div className="expenses-page">
      <PageHeader
        title={t.expenses.title}
        description={t.expenses.description}
        actions={
          <>
            <Button variant="secondary" icon={<FileDown />} onClick={() => setExporting(true)}>
              {t.expenses.export.button}
            </Button>
            <Button icon={<Plus />} onClick={dialogs.openCreate}>
              {t.expenses.add}
            </Button>
          </>
        }
      />
      <div className="flex min-w-0 flex-col gap-5">
        <RecurringList />
        <ExpenseFilters />
        {error && <InlineError message={error} onRetry={() => void dispatch(loadExpenses())} />}
        {!loading && filtered.length > 0 && (
          <p
            aria-live="polite"
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-3 text-sm text-ink-muted"
          >
            <span>
              {hasActiveFilters
                ? page.matchCount(filtered.length)
                : t.common.expenseCount(filtered.length)}
            </span>
            <span className="whitespace-nowrap">
              {page.total}{' '}
              <span className="tabular ml-1 text-base font-semibold text-ink">{format(total)}</span>
            </span>
          </p>
        )}
        {renderContent()}
      </div>
      <ExpenseForm
        open={dialogs.formOpen}
        expense={dialogs.editingExpense}
        onClose={dialogs.closeForm}
      />
      <DeleteExpenseDialog expense={dialogs.pendingDelete} onClose={dialogs.closeDelete} />
      <ExportExpensesModal open={exporting} onClose={() => setExporting(false)} />
    </div>
  );
};
