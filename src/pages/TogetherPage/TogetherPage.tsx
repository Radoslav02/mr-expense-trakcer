import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { InlineError } from '@/components/InlineError';
import { Loader } from '@/components/Loader';
import { MonthPicker } from '@/components/MonthPicker';
import { PageHeader } from '@/components/PageHeader';
import { CategoryManager } from '@/features/categories/CategoryManager';
import { CategoryComparison } from '@/features/partner/CategoryComparison';
import { PartnerConnectCard } from '@/features/partner/PartnerConnectCard';
import { SharedActivity } from '@/features/partner/SharedActivity';
import { SplitBalance } from '@/features/partner/SplitBalance';
import { SpendingSplit } from '@/features/partner/SpendingSplit';
import { TrendComparisonChart } from '@/features/partner/TrendComparisonChart';
import { selectExpensesStatus } from '@/redux/expenses/expensesSelectors';
import {
  selectCurrencyMismatch,
  selectLinkStatus,
  selectPartnerDataStatus,
  selectPartnerError,
  selectPartnerStatus,
  selectPersonNames,
} from '@/redux/partner/partnerSelectors';
import { loadPartner } from '@/redux/partner/partnerThunks';
import { selectCurrency } from '@/redux/settings/settingsSelectors';
import { currentMonthKey } from '@/utils/dates';
import './TogetherPage.css';

const isPending = (status: string) => status === 'idle' || status === 'loading';

export const TogetherPage = () => {
  const dispatch = useAppDispatch();
  const [month, setMonth] = useState(currentMonthKey);
  const linkStatus = useAppSelector(selectLinkStatus);
  const partnerStatus = useAppSelector(selectPartnerStatus);
  const dataStatus = useAppSelector(selectPartnerDataStatus);
  const expensesStatus = useAppSelector(selectExpensesStatus);
  const error = useAppSelector(selectPartnerError);
  const names = useAppSelector(selectPersonNames);
  const currency = useAppSelector(selectCurrency);
  const partnerCurrency = useAppSelector(selectCurrencyMismatch);
  const refresh = () => void dispatch(loadPartner());

  const connected = linkStatus === 'connected';
  const loading = isPending(dataStatus) || isPending(expensesStatus);

  const renderContent = () => {
    if (isPending(partnerStatus)) return <Loader label="Checking your partner link" />;
    if (!connected) return <PartnerConnectCard />;
    return (
      <div className="flex flex-col gap-5">
        {partnerCurrency && (
          <p role="note" className="rounded-xl bg-partner-soft px-4 py-3 text-sm text-ink">
            {names.partner} records amounts in {partnerCurrency} and you use {currency}. Amounts are
            compared as entered, without conversion.
          </p>
        )}
        <SpendingSplit month={month} loading={loading} />
        <SplitBalance month={month} loading={loading} />
        <div className="grid gap-5 lg:grid-cols-2">
          <CategoryComparison month={month} loading={loading} />
          <TrendComparisonChart month={month} loading={loading} />
        </div>
        <SharedActivity month={month} />
        <CategoryManager scope="shared" />
      </div>
    );
  };

  return (
    <div className="together-page">
      <PageHeader
        title="Together"
        description={
          connected
            ? `You and ${names.partner}, side by side.`
            : 'Compare spending with your partner.'
        }
        actions={
          <>
            {connected && <MonthPicker value={month} onChange={setMonth} />}
            {connected && (
              <span className="together-page__live inline-flex items-center gap-2 text-xs font-medium text-ink-subtle">
                <span aria-hidden="true" className="together-page__live-dot" />
                Live
              </span>
            )}
          </>
        }
      />
      <div className="flex flex-col gap-5">
        {error && <InlineError message={error} onRetry={refresh} />}
        {renderContent()}
      </div>
    </div>
  );
};
