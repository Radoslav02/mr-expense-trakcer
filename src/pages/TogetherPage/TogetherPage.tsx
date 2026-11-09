import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/Button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { InlineError } from '@/components/InlineError';
import { Loader } from '@/components/Loader';
import { PageHeader } from '@/components/PageHeader';
import { CategoryManager } from '@/features/categories/CategoryManager';
import { useI18n } from '@/i18n';
import { CategoryComparison } from '@/features/partner/CategoryComparison';
import { PartnerConnectCard } from '@/features/partner/PartnerConnectCard';
import { SharedActivity } from '@/features/partner/SharedActivity';
import { SharedCosts } from '@/features/partner/SharedCosts';
import { SpendingSplit } from '@/features/partner/SpendingSplit';
import { TogetherExportModal } from '@/features/partner/TogetherExportModal';
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
import { monthKeyOf } from '@/utils/dates';
import { currentPeriod, periodBounds, rangeKey } from '@/utils/expenses';
import type { PeriodValue } from '@/types/expense';
import { PeriodChoice, PeriodNavigator } from '@/features/expenses/PeriodPicker';
import './TogetherPage.css';

const isPending = (status: string) => status === 'idle' || status === 'loading';

export const TogetherPage = () => {
  const dispatch = useAppDispatch();
  const [period, setPeriod] = useState<PeriodValue>(currentPeriod);
  const bounds = periodBounds(period);
  const range = rangeKey(bounds);
  // The trend chart shows the months up to the end of the chosen period.
  const trendMonth = monthKeyOf(bounds.end);
  const [exporting, setExporting] = useState(false);
  const linkStatus = useAppSelector(selectLinkStatus);
  const partnerStatus = useAppSelector(selectPartnerStatus);
  const dataStatus = useAppSelector(selectPartnerDataStatus);
  const expensesStatus = useAppSelector(selectExpensesStatus);
  const error = useAppSelector(selectPartnerError);
  const names = useAppSelector(selectPersonNames);
  const currency = useAppSelector(selectCurrency);
  const partnerCurrency = useAppSelector(selectCurrencyMismatch);
  const refresh = () => void dispatch(loadPartner());
  const { t } = useI18n();
  const copy = t.partner.page;

  const connected = linkStatus === 'connected';
  const loading = isPending(dataStatus) || isPending(expensesStatus);

  const renderContent = () => {
    if (isPending(partnerStatus)) return <Loader label={copy.checkingLink} />;
    if (!connected) return <PartnerConnectCard />;
    return (
      <div className="flex flex-col gap-5">
        {partnerCurrency && (
          <p role="note" className="rounded-xl bg-partner-soft px-4 py-3 text-sm text-ink">
            {copy.currencyMismatch(names.partner, partnerCurrency, currency)}
          </p>
        )}
        <SpendingSplit range={range} loading={loading} />
        <SharedCosts range={range} loading={loading} />
        <div className="grid gap-5 lg:grid-cols-2">
          <CategoryComparison range={range} loading={loading} />
          <TrendComparisonChart month={trendMonth} loading={loading} />
        </div>
        <SharedActivity range={range} />
        <CategoryManager scope="shared" />
      </div>
    );
  };

  return (
    <div className="together-page">
      <PageHeader
        title={copy.title}
        description={connected ? copy.descriptionConnected(names.partner) : copy.description}
        actions={
          <>
            {connected && <PeriodChoice value={period} onChange={setPeriod} />}
            {connected && <PeriodNavigator value={period} onChange={setPeriod} />}
            {connected && (
              <Button variant="secondary" icon={<FileDown />} onClick={() => setExporting(true)}>
                {t.partner.export.button}
              </Button>
            )}
            {connected && (
              <span className="together-page__live inline-flex items-center gap-2 text-xs font-medium text-ink-subtle">
                <span aria-hidden="true" className="together-page__live-dot" />
                {copy.live}
              </span>
            )}
          </>
        }
      />
      <div className="flex flex-col gap-5">
        {error && <InlineError message={error} onRetry={refresh} />}
        {renderContent()}
      </div>
      <TogetherExportModal open={exporting} onClose={() => setExporting(false)} />
    </div>
  );
};
