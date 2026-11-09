import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { VisibilityField } from '@/features/expenses/VisibilityField';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
import { selectMonthSummary } from '@/redux/expenses/expensesSelectors';
import { selectLinkStatus, selectPersonNames } from '@/redux/partner/partnerSelectors';
import { saveSavingThunk, selectSavingsTotals } from '@/redux/savings/savingsSlice';
import { selectCurrency, selectMonthlyIncome } from '@/redux/settings/settingsSelectors';
import { signedAmount, type Saving, type SavingKind, type SavingSource } from '@/types/saving';
import { cn } from '@/utils/cn';
import { roundMoney } from '@/utils/currency';
import { formatMonthLabel, isValidDateKey, monthKeyOf, todayKey } from '@/utils/dates';
import { parseAmount, type Visibility } from '@/utils/validation';

interface SavingFormProps {
  open: boolean;
  /** Edit this saving; without it, a new one is added. */
  saving?: Saving | null;
  onClose: () => void;
  onDelete?: (saving: Saving) => void;
  /** For a new entry: start as money put in, or money taken out. */
  defaultKind?: SavingKind;
}

const FORM_ID = 'saving-form';

export const SavingForm = ({
  open,
  saving = null,
  onClose,
  onDelete,
  defaultKind = 'deposit',
}: SavingFormProps) => {
  const { t } = useI18n();
  const s = t.savings;
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { format } = useCurrencyFormatter();
  const currency = useAppSelector(selectCurrency);
  const income = useAppSelector(selectMonthlyIncome);
  const linkStatus = useAppSelector(selectLinkStatus);
  const partnerName = useAppSelector(selectPersonNames).partner;

  const [kind, setKind] = useState<SavingKind>('deposit');
  const [source, setSource] = useState<SavingSource>('custom');
  const [note, setNote] = useState('');
  const balance = useAppSelector(selectSavingsTotals).mine;
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayKey());
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('shared');
  const [errors, setErrors] = useState<{ title?: string; amount?: string }>({});
  const [saving_, setSaving] = useState(false);

  const month = monthKeyOf(isValidDateKey(date) ? date : todayKey());
  const spent = useAppSelector((state) => selectMonthSummary(state, month).total);
  const leftover = income ? roundMoney(income - spent) : null;
  const canUseLeftover = leftover !== null && leftover > 0;

  useEffect(() => {
    if (!open) return;
    setKind(saving?.kind ?? defaultKind);
    setNote(saving?.note ?? '');
    setSource(saving?.source ?? (income ? 'leftover' : 'custom'));
    setAmount(saving ? String(saving.amount) : '');
    setDate(saving?.date ?? todayKey());
    setTitle(saving?.title ?? '');
    setVisibility(saving?.isPrivate ? 'private' : 'shared');
    setErrors({});
    // Reset only when opening or switching saving.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, saving]);

  const isWithdrawal = kind === 'withdrawal';
  const useLeftover = !isWithdrawal && source === 'leftover' && canUseLeftover;
  // What can be taken out: the balance without this entry, when editing one.
  const available = roundMoney(balance - (saving ? signedAmount(saving) : 0));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = useLeftover ? (leftover ?? 0) : parseAmount(amount);
    const next: typeof errors = {};
    if (!title.trim()) next.title = s.validation.titleRequired;
    if (!Number.isFinite(value) || value <= 0) next.amount = s.validation.amountPositive;
    else if (isWithdrawal && roundMoney(value) > available) {
      next.amount = s.validation.overBalance(format(Math.max(available, 0)));
    }
    setErrors(next);
    if (next.title || next.amount) return;

    setSaving(true);
    try {
      await dispatch(
        saveSavingThunk({
          input: {
            title,
            amount: roundMoney(value),
            date: isValidDateKey(date) ? date : todayKey(),
            kind,
            source: useLeftover ? 'leftover' : 'custom',
            note: isWithdrawal ? note.trim() || undefined : undefined,
            isPrivate: visibility === 'private' || undefined,
          },
          existing: saving ?? undefined,
        }),
      ).unwrap();
      toast.success(saving ? s.form.saved : isWithdrawal ? s.form.takenAdded : s.form.added);
      onClose();
    } catch (message) {
      toast.error(String(message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving_}
      title={saving ? s.edit : isWithdrawal ? s.takeOut : s.add}
      footer={
        <>
          {saving && onDelete && (
            <Button
              variant="ghost"
              onClick={() => onDelete(saving)}
              disabled={saving_}
              className="text-danger hover:text-danger sm:mr-auto"
            >
              {s.form.delete}
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} disabled={saving_}>
            {t.common.cancel}
          </Button>
          <Button type="submit" form={FORM_ID} loading={saving_}>
            {saving ? t.common.saveChanges : isWithdrawal ? s.takeOut : s.add}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className="grid min-w-0 gap-4 pb-2 sm:grid-cols-2"
      >
        <div
          role="group"
          aria-label={s.form.kind}
          className="grid grid-cols-2 rounded-lg bg-sunken p-0.5 sm:col-span-2"
        >
          {(['deposit', 'withdrawal'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={kind === value}
              onClick={() => {
                setKind(value);
                setErrors({});
              }}
              className={cn(
                'h-9 rounded-md px-2 text-[0.8125rem] font-medium transition-colors',
                kind === value
                  ? value === 'withdrawal'
                    ? 'bg-danger text-white dark:text-[rgb(var(--color-canvas))]'
                    : 'bg-accent text-accent-ink'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              {value === 'deposit' ? s.form.deposit : s.form.withdrawal}
            </button>
          ))}
        </div>
        {isWithdrawal && (
          <p className="tabular -mt-2 text-[0.8125rem] text-ink-muted sm:col-span-2">
            {s.form.balanceHint(format(Math.max(available, 0)))}
          </p>
        )}
        {!isWithdrawal && income !== null && (
          <fieldset className="min-w-0 sm:col-span-2">
            <legend className="mb-1.5 text-sm font-medium text-ink">{s.form.source}</legend>
            <div role="group" className="grid grid-cols-2 rounded-lg bg-sunken p-0.5">
              {(['leftover', 'custom'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={source === value}
                  onClick={() => setSource(value)}
                  className={cn(
                    'h-9 truncate rounded-md px-2 text-[0.8125rem] font-medium transition-colors',
                    source === value
                      ? 'bg-accent text-accent-ink'
                      : 'text-ink-muted hover:text-ink',
                  )}
                >
                  {value === 'leftover' ? s.form.leftover : s.form.custom}
                </button>
              ))}
            </div>
            {source === 'leftover' && (
              <p
                className={cn(
                  'tabular mt-2 text-[0.8125rem]',
                  canUseLeftover ? 'text-ink-muted' : 'text-warning',
                )}
              >
                {canUseLeftover
                  ? s.form.leftoverHint(formatMonthLabel(month), format(leftover ?? 0))
                  : s.form.nothingLeft(formatMonthLabel(month))}
              </p>
            )}
          </fieldset>
        )}
        {!useLeftover && (
          <Input
            label={s.form.amount}
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setErrors((current) => ({ ...current, amount: undefined }));
            }}
            error={errors.amount}
            trailing={currency}
            className="tabular"
            wrapperClassName="min-w-0"
          />
        )}
        <Input
          label={s.form.date}
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          wrapperClassName={cn('min-w-0', useLeftover && 'sm:col-span-2')}
        />
        <Input
          label={isWithdrawal ? s.form.withdrawalTitle : s.form.title}
          value={title}
          maxLength={60}
          placeholder={isWithdrawal ? s.form.withdrawalPlaceholder : s.form.titlePlaceholder}
          onChange={(event) => {
            setTitle(event.target.value);
            setErrors((current) => ({ ...current, title: undefined }));
          }}
          error={errors.title}
          wrapperClassName="min-w-0 sm:col-span-2"
        />
        {isWithdrawal && (
          <Input
            label={s.form.note}
            optional
            value={note}
            maxLength={120}
            placeholder={s.form.notePlaceholder}
            onChange={(event) => setNote(event.target.value)}
            wrapperClassName="min-w-0 sm:col-span-2"
          />
        )}
        {(linkStatus !== 'none' || visibility === 'private') && (
          <VisibilityField value={visibility} onChange={setVisibility} partnerName={partnerName} />
        )}
      </form>
    </Modal>
  );
};
