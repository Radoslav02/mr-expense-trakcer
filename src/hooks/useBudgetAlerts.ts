import { useEffect } from 'react';
import { useAppSelector } from '@/app/hooks';
import { getMessages } from '@/i18n';
import { selectExpensesStatus, selectMonthSummary } from '@/redux/expenses/expensesSelectors';
import { selectMonthlyBudget, selectMonthlyIncome } from '@/redux/settings/settingsSelectors';
import { formatCurrency, formatPercent, roundMoney } from '@/utils/currency';
import { currentMonthKey } from '@/utils/dates';
import { budgetLevel } from '@/utils/expenses';
import { useToast } from './useToast';

const STORAGE_KEY = 'tally.moneyAlerts';

type Alerted = { month: string; budget: 0 | 1 | 2; deficit: boolean };

const SEVERITY = { healthy: 0, warning: 1, exceeded: 2 } as const;

const readAlerted = (month: string): Alerted => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Alerted | null;
    if (saved?.month === month) return saved;
  } catch {
    // Unreadable or blocked storage: start fresh.
  }
  return { month, budget: 0, deficit: false };
};

const saveAlerted = (alerted: Alerted) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerted));
  } catch {
    // Not saved; the worst case is one repeated warning.
  }
};

/**
 * Warns once a month, on this device, when spending gets close to the budget (75%), when it
 * reaches it, and when it goes past the income. Runs wherever expenses are added.
 */
export const useBudgetAlerts = (currency: string): void => {
  const toast = useToast();
  const month = currentMonthKey();
  const status = useAppSelector(selectExpensesStatus);
  const spent = useAppSelector((state) => selectMonthSummary(state, month).total);
  const budget = useAppSelector(selectMonthlyBudget);
  const income = useAppSelector(selectMonthlyIncome);

  useEffect(() => {
    // Wait for real data, so loading doesn't look like a sudden jump.
    if (status !== 'succeeded') return;
    const alerts = getMessages().expenses.alerts;
    const alerted = readAlerted(month);
    const format = (amount: number) => formatCurrency(amount, currency);
    let changed = false;

    if (budget) {
      const ratio = spent / budget;
      const severity = SEVERITY[budgetLevel(ratio)];
      if (severity > alerted.budget) {
        if (severity === 2) toast.error(alerts.budgetReached(format(budget)));
        else
          toast.warning(
            alerts.budgetClose(formatPercent(ratio), format(roundMoney(budget - spent))),
          );
        alerted.budget = severity as 1 | 2;
        changed = true;
      }
    }
    if (income && spent > income && !alerted.deficit) {
      toast.error(alerts.deficit(format(roundMoney(spent - income))));
      alerted.deficit = true;
      changed = true;
    }
    if (changed) saveAlerted(alerted);
  }, [status, spent, budget, income, month, currency, toast]);
};
