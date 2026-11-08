import { useMemo } from 'react';
import { Repeat } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { TextArea } from '@/components/TextArea';
import { ToggleField } from '@/components/ToggleField';
import {
  NOTE_MAX_LENGTH,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  TITLE_MAX_LENGTH,
} from '@/constants/expenses';
import { useExpenseForm, type ExpenseFormTarget } from '@/hooks/useExpenseForm';
import { selectSortedCategories } from '@/redux/categories/categoriesSelectors';
import { selectExpensesMutating } from '@/redux/expenses/expensesSelectors';
import {
  selectLinkStatus,
  selectPartnerMutating,
  selectPersonNames,
} from '@/redux/partner/partnerSelectors';
import { selectRecurringMutating } from '@/redux/recurring/recurringSlice';
import { selectCurrency } from '@/redux/settings/settingsSelectors';
import type { Expense, RecurringExpense } from '@/types/expense';
import { ordinal } from '@/utils/dates';
import { SplitField } from '../SplitField';
import { VisibilityField } from '../VisibilityField';
import './ExpenseForm.css';

interface ExpenseFormProps {
  open: boolean;
  expense: Expense | null;
  /** Edit a recurring expense instead: changes apply to the months still to come. */
  recurring?: RecurringExpense | null;
  /** Edit one of my partner's shared expenses instead. */
  partnerExpense?: Expense | null;
  onClose: () => void;
}

const FORM_ID = 'expense-form';

const PAYMENT_OPTIONS = PAYMENT_METHODS.map((method) => ({
  value: method,
  label: PAYMENT_METHOD_LABELS[method],
}));

const DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => ({
  value: String(index + 1),
  label: `The ${ordinal(index + 1)}${index + 1 > 28 ? ' (or the last day)' : ''}`,
}));

const TITLES: Record<ExpenseFormTarget['kind'], string> = {
  new: 'Add expense',
  expense: 'Edit expense',
  partner: 'Edit expense',
  recurring: 'Edit recurring expense',
};

export const ExpenseForm = ({
  open,
  expense,
  recurring = null,
  partnerExpense = null,
  onClose,
}: ExpenseFormProps) => {
  const target = useMemo<ExpenseFormTarget>(
    () =>
      recurring
        ? { kind: 'recurring', recurring }
        : partnerExpense
          ? { kind: 'partner', expense: partnerExpense }
          : expense
            ? { kind: 'expense', expense }
            : { kind: 'new' },
    [expense, recurring, partnerExpense],
  );
  const { values, errors, setField, handleSubmit } = useExpenseForm(open, target, onClose);
  const categories = useAppSelector(selectSortedCategories);
  const currency = useAppSelector(selectCurrency);
  const savingExpense = useAppSelector(selectExpensesMutating);
  const savingRecurring = useAppSelector(selectRecurringMutating);
  const linkStatus = useAppSelector(selectLinkStatus);
  const partnerName = useAppSelector(selectPersonNames).partner;
  const savingPartner = useAppSelector(selectPartnerMutating);
  const saving = savingExpense || savingRecurring || savingPartner;
  const isPartners = target.kind === 'partner';
  const isPrivate = !isPartners && values.visibility === 'private';
  const connected = linkStatus === 'connected';
  // Offer the choice whenever someone could see your expenses, or to move a private one back.
  const showVisibility = !isPartners && (linkStatus !== 'none' || isPrivate);

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((category) => isPrivate || !category.isPrivate)
        .map((category) => ({
          value: category.id,
          label: category.isPrivate ? `${category.name} (private)` : category.name,
        })),
    [categories, isPrivate],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      title={TITLES[target.kind]}
      description={
        target.kind === 'recurring'
          ? 'Changes apply from the next month on. Expenses already added stay as they are.'
          : isPartners
            ? `This is ${partnerName}’s expense. Your changes show up for both of you.`
            : undefined
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={saving}>
            {target.kind === 'new' ? 'Add expense' : 'Save changes'}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className="expense-form grid gap-4 pb-2 sm:grid-cols-2"
      >
        <Input
          label="Title"
          value={values.title}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="e.g. Groceries at Maxi"
          onChange={(event) => setField('title', event.target.value)}
          error={errors.title}
          wrapperClassName="sm:col-span-2"
        />
        <Input
          label="Amount"
          inputMode="decimal"
          value={values.amount}
          placeholder="0"
          onChange={(event) => setField('amount', event.target.value)}
          error={errors.amount}
          trailing={currency}
          className="tabular"
        />
        {target.kind === 'recurring' ? (
          <Select
            label="Added every month on"
            value={values.dayOfMonth}
            options={DAY_OPTIONS}
            onChange={(event) => setField('dayOfMonth', event.target.value)}
          />
        ) : (
          <Input
            label="Date"
            type="date"
            value={values.date}
            onChange={(event) => setField('date', event.target.value)}
            error={errors.date}
          />
        )}
        <Select
          label="Category"
          value={values.categoryId}
          options={categoryOptions}
          placeholder="Choose a category"
          onChange={(event) => setField('categoryId', event.target.value)}
          error={errors.categoryId}
        />
        <Select
          label="Paid with"
          value={values.paymentMethod}
          options={PAYMENT_OPTIONS}
          onChange={(event) => setField('paymentMethod', event.target.value)}
        />
        {showVisibility && (
          <VisibilityField
            value={values.visibility}
            onChange={(visibility) => setField('visibility', visibility)}
            partnerName={partnerName}
          />
        )}
        {!isPrivate && (connected || values.split) && (
          <SplitField
            values={values}
            errors={errors}
            setField={setField}
            partnerName={partnerName}
            currency={currency}
            payer={isPartners ? 'partner' : 'me'}
          />
        )}
        {target.kind === 'new' && (
          <ToggleField
            label="Repeats every month"
            description={
              values.repeats
                ? `Added again on the ${ordinal(Number(values.date.slice(8, 10)) || 1)} of every month.`
                : 'For rent, bills and subscriptions.'
            }
            icon={<Repeat />}
            checked={values.repeats}
            onChange={(checked) => setField('repeats', checked)}
            className="sm:col-span-2"
          />
        )}
        {target.kind === 'expense' && target.expense.recurringId && (
          <p className="flex items-center gap-2 rounded-xl bg-sunken px-3.5 py-2.5 text-[0.8125rem] text-ink-muted sm:col-span-2">
            <Repeat aria-hidden="true" className="h-4 w-4 shrink-0" />
            Added by a recurring expense. Changes here only affect this month.
          </p>
        )}
        <div className="sm:col-span-2">
          <TextArea
            label="Note"
            optional
            rows={2}
            maxLength={NOTE_MAX_LENGTH}
            value={values.note}
            onChange={(event) => setField('note', event.target.value)}
            error={errors.note}
          />
        </div>
      </form>
    </Modal>
  );
};
