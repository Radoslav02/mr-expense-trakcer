import { useMemo } from 'react';
import { Repeat } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { TextArea } from '@/components/TextArea';
import { ToggleField } from '@/components/ToggleField';
import { NOTE_MAX_LENGTH, PAYMENT_METHODS, TITLE_MAX_LENGTH } from '@/constants/expenses';
import { useExpenseForm, type ExpenseFormTarget } from '@/hooks/useExpenseForm';
import { useI18n } from '@/i18n';
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
  const { t } = useI18n();
  const form = t.expenses.form;
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
          label: category.isPrivate
            ? t.expenses.form.privateCategory(category.name)
            : category.name,
        })),
    [categories, isPrivate, t],
  );

  const paymentOptions = useMemo(
    () =>
      PAYMENT_METHODS.map((method) => ({
        value: method,
        label: t.expenses.paymentMethods[method],
      })),
    [t],
  );

  const dayOptions = useMemo(
    () =>
      Array.from({ length: 31 }, (_, index) => ({
        value: String(index + 1),
        label: t.expenses.form.dayOption(ordinal(index + 1), index + 1 > 28),
      })),
    [t],
  );

  const titles: Record<ExpenseFormTarget['kind'], string> = {
    new: t.expenses.add,
    expense: t.expenses.edit,
    partner: t.expenses.edit,
    recurring: t.expenses.editRecurring,
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      title={titles[target.kind]}
      description={
        target.kind === 'recurring'
          ? form.recurringDescription
          : isPartners
            ? form.partnerDescription(partnerName)
            : undefined
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button type="submit" form={FORM_ID} loading={saving}>
            {target.kind === 'new' ? t.expenses.add : t.common.saveChanges}
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
          label={form.title}
          value={values.title}
          maxLength={TITLE_MAX_LENGTH}
          placeholder={form.titlePlaceholder}
          onChange={(event) => setField('title', event.target.value)}
          error={errors.title}
          wrapperClassName="sm:col-span-2"
        />
        <Input
          label={form.amount}
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
            label={form.dayOfMonth}
            value={values.dayOfMonth}
            options={dayOptions}
            onChange={(event) => setField('dayOfMonth', event.target.value)}
          />
        ) : (
          <Input
            label={form.date}
            type="date"
            value={values.date}
            onChange={(event) => setField('date', event.target.value)}
            error={errors.date}
          />
        )}
        <Select
          label={form.category}
          value={values.categoryId}
          options={categoryOptions}
          placeholder={form.categoryPlaceholder}
          onChange={(event) => setField('categoryId', event.target.value)}
          error={errors.categoryId}
        />
        <Select
          label={form.paidWith}
          value={values.paymentMethod}
          options={paymentOptions}
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
            label={form.repeats}
            description={
              values.repeats
                ? form.repeatsOn(ordinal(Number(values.date.slice(8, 10)) || 1))
                : form.repeatsHint
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
            {form.fromRecurring}
          </p>
        )}
        <div className="sm:col-span-2">
          <TextArea
            label={form.note}
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
