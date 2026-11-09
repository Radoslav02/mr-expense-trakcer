import { useMemo, useState } from 'react';
import { ArrowDownLeft, Lock, PiggyBank, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { InlineError } from '@/components/InlineError';
import { Loader } from '@/components/Loader';
import { PageHeader } from '@/components/PageHeader';
import { SavingForm } from '@/features/savings/SavingForm';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
import { selectLinkStatus, selectPersonNames } from '@/redux/partner/partnerSelectors';
import {
  deleteSavingThunk,
  selectSavings,
  selectSavingsError,
  selectSavingsStatus,
  selectSavingsTotals,
} from '@/redux/savings/savingsSlice';
import { signedAmount, type Saving, type SavingKind } from '@/types/saving';
import { roundMoney } from '@/utils/currency';
import { formatMonthLabel, formatShortDate, monthKeyOf } from '@/utils/dates';

export const SavingsPage = () => {
  const { t } = useI18n();
  const s = t.savings;
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { format } = useCurrencyFormatter();
  const savings = useAppSelector(selectSavings);
  const status = useAppSelector(selectSavingsStatus);
  const error = useAppSelector(selectSavingsError);
  const totals = useAppSelector(selectSavingsTotals);
  const connected = useAppSelector(selectLinkStatus) === 'connected';
  const partnerName = useAppSelector(selectPersonNames).partner;
  const [form, setForm] = useState<{ open: boolean; saving: Saving | null; kind: SavingKind }>({
    open: false,
    saving: null,
    kind: 'deposit',
  });
  const [pendingDelete, setPendingDelete] = useState<Saving | null>(null);
  const [deleting, setDeleting] = useState(false);
  const loading = status === 'idle' || status === 'loading';

  const months = useMemo(
    () =>
      savings.reduce<{ month: string; total: number; items: Saving[] }[]>((list, saving) => {
        const month = monthKeyOf(saving.date);
        const last = list[list.length - 1];
        if (last?.month === month) {
          last.items.push(saving);
          last.total = roundMoney(last.total + signedAmount(saving));
        } else {
          list.push({ month, total: signedAmount(saving), items: [saving] });
        }
        return list;
      }, []),
    [savings],
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteSavingThunk(pendingDelete)).unwrap();
      toast.success(s.form.deleted);
      setPendingDelete(null);
      setForm({ open: false, saving: null, kind: 'deposit' });
    } catch (message) {
      toast.error(String(message));
    } finally {
      setDeleting(false);
    }
  };

  const openNew = (kind: SavingKind = 'deposit') => setForm({ open: true, saving: null, kind });

  const stats = [
    { label: s.totals.mine, value: totals.mine },
    { label: s.totals.thisYear, value: totals.thisYear },
    ...(connected
      ? [
          {
            label: s.totals.together,
            value: totals.together,
            hint: s.totals.togetherHint(partnerName),
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <PageHeader
        title={s.title}
        description={s.description}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<ArrowDownLeft />}
              onClick={() => openNew('withdrawal')}
              disabled={totals.mine <= 0}
            >
              {s.takeOut}
            </Button>
            <Button icon={<Plus />} onClick={() => openNew()}>
              {s.add}
            </Button>
          </>
        }
      />
      {error && <InlineError message={error} />}
      {loading ? (
        <Loader />
      ) : (
        <>
          <dl
            className="grid gap-px overflow-hidden rounded-xl border border-line bg-line"
            style={{ gridTemplateColumns: `repeat(auto-fit, minmax(10rem, 1fr))` }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="bg-surface px-4 py-3.5">
                <dt className="text-[0.8125rem] text-ink-muted">{stat.label}</dt>
                <dd className="tabular mt-0.5 text-xl font-semibold tracking-[-0.01em] text-ink">
                  {format(stat.value)}
                </dd>
                {'hint' in stat && stat.hint && (
                  <dd className="mt-0.5 truncate text-xs text-ink-subtle">{stat.hint}</dd>
                )}
              </div>
            ))}
          </dl>

          {savings.length === 0 ? (
            <Card padded={false}>
              <EmptyState
                icon={<PiggyBank />}
                title={s.empty.title}
                description={s.empty.description}
                action={
                  <Button icon={<Plus />} onClick={() => openNew()}>
                    {s.add}
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="flex flex-col gap-5">
              {months.map((group) => (
                <section key={group.month}>
                  <header className="mb-2 flex items-baseline justify-between px-1">
                    <h2 className="text-sm font-medium text-ink-muted">
                      {formatMonthLabel(group.month)}
                    </h2>
                    <span className="tabular text-sm text-ink-subtle">{format(group.total)}</span>
                  </header>
                  <Card padded={false} as="div">
                    <ul>
                      {group.items.map((saving) => (
                        <li key={saving.id} className="[&+&]:border-t [&+&]:border-line">
                          <button
                            type="button"
                            onClick={() => setForm({ open: true, saving, kind: saving.kind })}
                            className="flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-sunken/60 sm:px-5"
                          >
                            {saving.kind === 'withdrawal' ? (
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-soft text-danger">
                                <ArrowDownLeft aria-hidden="true" className="h-4 w-4" />
                              </span>
                            ) : (
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                                <PiggyBank aria-hidden="true" className="h-4 w-4" />
                              </span>
                            )}
                            <span className="min-w-0 flex-1 overflow-hidden">
                              <span className="flex min-w-0 items-center gap-1.5">
                                <span className="truncate text-[0.9375rem] font-medium text-ink">
                                  {saving.title}
                                </span>
                                {saving.isPrivate && (
                                  <Lock
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5 shrink-0 text-ink-subtle"
                                  />
                                )}
                              </span>
                              <span className="mt-0.5 flex min-w-0 items-center gap-2 text-[0.8125rem] text-ink-subtle">
                                <span className="shrink-0">{formatShortDate(saving.date)}</span>
                                {saving.kind === 'withdrawal' && (
                                  <span className="shrink-0 rounded bg-danger-soft px-1.5 py-px text-[0.75rem] font-medium text-danger">
                                    {s.takenOut}
                                  </span>
                                )}
                                {saving.note && <span className="truncate">{saving.note}</span>}
                                {saving.kind === 'deposit' && saving.source === 'leftover' && (
                                  <span className="truncate rounded bg-accent-soft px-1.5 py-px text-[0.75rem] font-medium text-accent">
                                    {s.leftoverBadge}
                                  </span>
                                )}
                              </span>
                            </span>
                            <span
                              className={`tabular shrink-0 whitespace-nowrap text-[0.9375rem] font-semibold ${
                                saving.kind === 'withdrawal' ? 'text-danger' : 'text-positive'
                              }`}
                            >
                              {saving.kind === 'withdrawal' ? '−' : '+'}
                              {format(saving.amount)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </section>
              ))}
            </div>
          )}
        </>
      )}

      <SavingForm
        open={form.open}
        saving={form.saving}
        defaultKind={form.kind}
        onClose={() => setForm({ open: false, saving: null, kind: 'deposit' })}
        onDelete={setPendingDelete}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        title={s.dialogs.deleteTitle}
        message={<p>{pendingDelete ? s.dialogs.deleteMessage(pendingDelete.title) : ''}</p>}
        confirmLabel={s.form.delete}
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};
