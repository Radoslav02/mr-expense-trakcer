import { Input } from '@/components/Input';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
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
  /** Who paid: `partner` when editing their expense, so the share is what I owe them. */
  payer?: 'me' | 'partner';
}

const MODES: { value: SplitMode; label: string }[] = [
  { value: 'even', label: 'Half' },
  { value: 'custom', label: 'Custom amount' },
];

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
  const amount = validAmount(values.amount);
  const share =
    values.splitMode === 'even'
      ? amount !== null
        ? halfOf(amount)
        : null
      : validAmount(values.partnerShare);
  const valid = amount !== null && share !== null && share <= amount;
  const rest = valid ? format(roundMoney(amount - share)) : '';
  const summary =
    payer === 'me'
      ? valid
        ? `${partnerName} owes you ${format(share)} · your share ${rest}`
        : `${partnerName} will owe you their part of this expense.`
      : valid
        ? `You owe ${partnerName} ${format(share)} · their share ${rest}`
        : `You’ll owe ${partnerName} your part of this expense.`;
  const shareLabel = payer === 'me' ? `${partnerName}’s share` : 'Your share';
  const offText =
    payer === 'me'
      ? 'You paid, and you’re sharing the cost.'
      : `${partnerName} paid. Turn on to share the cost.`;

  const chooseMode = (mode: SplitMode) => {
    setField('splitMode', mode);
    if (mode === 'custom' && !values.partnerShare.trim() && amount !== null) {
      setField('partnerShare', String(halfOf(amount)));
    }
  };

  return (
    <fieldset
      className={cn(
        'split-field rounded-xl border border-line p-3.5 sm:col-span-2',
        values.split && 'is-on',
      )}
    >
      <legend className="sr-only">Split with {partnerName}</legend>
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-sm font-medium text-ink">Split with {partnerName}</span>
          <span className="block truncate text-[0.8125rem] text-ink-subtle">
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
            aria-label="How to split"
            className="inline-flex shrink-0 self-start rounded-lg bg-sunken p-0.5"
          >
            {MODES.map((mode) => (
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
