import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import { selectMonthSummary } from '@/redux/expenses/expensesSelectors';
import { selectRecurring } from '@/redux/recurring/recurringSlice';
import { selectMonthlyIncome } from '@/redux/settings/settingsSelectors';
import { roundMoney } from '@/utils/currency';
import { currentMonthKey } from '@/utils/dates';
import { budgetLevel } from '@/utils/expenses';
import { ownPartOf, upcomingThisMonth } from '@/utils/recurring';

const selectMonthArg = (_state: RootState, month: string) => month;

/** Income minus what I've spent this month, and what's left once the bills still due are paid. */
export const selectMoneyLeft = createSelector(
  [selectMonthSummary, selectMonthlyIncome, selectRecurring, selectMonthArg],
  (summary, income, templates, month) => {
    if (!income) return null;
    // Only the current month has bills still to come.
    const upcoming = month === currentMonthKey() ? upcomingThisMonth(templates) : [];
    const upcomingTotal = roundMoney(upcoming.reduce((sum, item) => sum + ownPartOf(item), 0));
    const left = roundMoney(income - summary.total);
    const ratio = (summary.total + upcomingTotal) / income;
    return {
      income,
      spent: summary.total,
      left,
      upcomingTotal,
      upcomingCount: upcoming.length,
      leftAfterBills: roundMoney(left - upcomingTotal),
      /** Share of income spent or already committed to upcoming bills. */
      ratio,
      spentRatio: summary.total / income,
      level: budgetLevel(ratio),
    };
  },
);
