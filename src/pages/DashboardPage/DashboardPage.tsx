import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { InlineError } from '@/components/InlineError';
import { MonthPicker } from '@/components/MonthPicker';
import { PageHeader } from '@/components/PageHeader';
import { BudgetProgress } from '@/features/dashboard/BudgetProgress';
import { CategoryPieChart } from '@/features/dashboard/CategoryPieChart';
import { MoneyLeft } from '@/features/dashboard/MoneyLeft';
import { MonthlyBarChart } from '@/features/dashboard/MonthlyBarChart';
import { SummaryCards } from '@/features/dashboard/SummaryCards';
import { ExpenseForm } from '@/features/expenses/ExpenseForm';
import { useExpenseDialogs } from '@/hooks/useExpenseDialogs';
import { selectExpensesError, selectExpensesStatus } from '@/redux/expenses/expensesSelectors';
import { loadExpenses } from '@/redux/expenses/expensesThunks';
import { selectSettingsStatus } from '@/redux/settings/settingsSelectors';
import { currentMonthKey } from '@/utils/dates';
import './DashboardPage.css';

const isPending = (status: string) => status === 'idle' || status === 'loading';

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const [month, setMonth] = useState(currentMonthKey);
  const status = useAppSelector(selectExpensesStatus);
  const error = useAppSelector(selectExpensesError);
  const settingsStatus = useAppSelector(selectSettingsStatus);
  const { formOpen, editingExpense, openCreate, closeForm } = useExpenseDialogs();
  const loading = isPending(status);

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Overview"
        description="A quick read on where your money is going."
        actions={
          <>
            <MonthPicker value={month} onChange={setMonth} />
            <Button icon={<Plus />} onClick={openCreate}>
              Add expense
            </Button>
          </>
        }
      />
      <div className="flex flex-col gap-5">
        {error && <InlineError message={error} onRetry={() => void dispatch(loadExpenses())} />}
        <SummaryCards month={month} loading={loading} />
        {!isPending(settingsStatus) && <MoneyLeft month={month} />}
        {!isPending(settingsStatus) && <BudgetProgress month={month} />}
        <div className="grid gap-5 lg:grid-cols-2">
          <CategoryPieChart month={month} loading={loading} />
          <MonthlyBarChart month={month} loading={loading} />
        </div>
      </div>
      <ExpenseForm open={formOpen} expense={editingExpense} onClose={closeForm} />
    </div>
  );
};
