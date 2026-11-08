import { Input } from '@/components/Input';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useI18n } from '@/i18n';
import { cn } from '@/utils/cn';
import { roundMoney } from '@/utils/currency';
import { halfOf } from '@/utils/split';
import {
  parseAmount,
  type ExpenseFormValues,
  type FormErrors,
  type SplitMode,
} from '@/utils/validation';
import './SplitField.css';

interface SplitFieldProps {
  values: ExpenseFormValues;
  errors: FormErrors<ExpenseFormValues>;
  setField: <K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) => void;
  partnerName: string;
  currency: string;
  /** Who bought it: `partner` when editing their expense, so the share is my part. */
  payer?: 'me' | 'partner';
}

const validAmount = (value: string): number | null => {
  const amount = parseAmount(value);
  return value.trim() && Number.isFinite(amount) && amount > 0 ? roundMoney(amount) : null;
};

export const SplitField = ({
  values,
  errors,
  setField,
  partnerName,
  currency,
  payer = 'me',
}: SplitFieldProps) => {
  const { format } = useCurrencyFormatter();
  const { t } = useI18n();
  const s = t.expenses.split;
  const modes: { value: SplitMode; label: string }[] = [
    { value: 'even', label: s.half },
    { value: 'custom', label: s.custom },
  ];
  const amount = validAmount(values.amount);
  const share =
    values.splitMode === 'even'
      ? amount !== null
        ? halfOf(amount)
        : null
      : validAmount(values.partnerShare);
  const valid = amount !== null && share !== null && share <= amount;
  const rest = valid ? format(roundMoney(amount - share)) : '';
  // A split is a cost we share, like groceries we both eat. Nobody owes anybody.
  const summary = valid
    ? payer === 'me'
      ? s.summary(rest, partnerName, format(share))
      : s.summary(format(share), partnerName, rest)
    : s.countedForBoth;
  const shareLabel = payer === 'me' ? s.partnerPart(partnerName) : s.yourPart;
  const offText = s.offHint;

  const chooseMode = (mode: SplitMode) => {
    setField('splitMode', mode);
    if (mode === 'custom' && !values.partnerShare.trim() && amount !== null) {
      setField('partnerShare', String(halfOf(amount)));
    }
  };

  return (
    <fieldset
      className={cn(
        'split-field min-w-0 rounded-xl border border-line p-3.5 sm:col-span-2',
        values.split && 'is-on',
      )}
    >
      <legend className="sr-only">{s.splitWith(partnerName)}</legend>
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-sm font-medium text-ink">{s.splitWith(partnerName)}</span>
          <span className="block text-[0.8125rem] text-ink-subtle">
            {values.split ? summary : offText}
          </span>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={values.split}
          onChange={(event) => setField('split', event.target.checked)}
          className="split-field__switch"
        />
      </label>

      {values.split && (
        <div className="mt-3.5 flex flex-col gap-3 border-t border-line pt-3.5 sm:flex-row sm:items-start">
          <div
            role="group"
            aria-label={s.howToSplit}
            className="inline-flex shrink-0 self-start rounded-lg bg-sunken p-0.5"
          >
            {modes.map((mode) => (
              <button
                key={mode.value}
                type="button"
                aria-pressed={values.splitMode === mode.value}
                onClick={() => chooseMode(mode.value)}
                className={cn(
                  'split-field__option',
                  values.splitMode === mode.value && 'is-selected',
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
          {values.splitMode === 'custom' && (
            <Input
              label={shareLabel}
              hideLabel
              inputMode="decimal"
              placeholder={shareLabel}
              value={values.partnerShare}
              onChange={(event) => setField('partnerShare', event.target.value)}
              error={errors.partnerShare}
              trailing={currency}
              className="tabular"
              wrapperClassName="min-w-0 flex-1"
            />
          )}
        </div>
      )}
    </fieldset>
  );
};
