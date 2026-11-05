import { useMemo } from 'react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { TextArea } from '@/components/TextArea';
import {
  NOTE_MAX_LENGTH,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  TITLE_MAX_LENGTH,
} from '@/constants/expenses';
import { useExpenseForm } from '@/hooks/useExpenseForm';
import { selectSortedCategories } from '@/redux/categories/categoriesSelectors';
import { selectExpensesMutating } from '@/redux/expenses/expensesSelectors';
import { selectLinkStatus, selectPersonNames } from '@/redux/partner/partnerSelectors';
import { selectCurrency } from '@/redux/settings/settingsSelectors';
import type { Expense } from '@/types/expense';
import { SplitField } from '../SplitField';
import './ExpenseForm.css';

interface ExpenseFormProps {
  open: boolean;
  expense: Expense | null;
  onClose: () => void;
}

const FORM_ID = 'expense-form';

const PAYMENT_OPTIONS = PAYMENT_METHODS.map((method) => ({
  value: method,
  label: PAYMENT_METHOD_LABELS[method],
}));

export const ExpenseForm = ({ open, expense, onClose }: ExpenseFormProps) => {
  const { values, errors, setField, handleSubmit } = useExpenseForm(open, expense, onClose);
  const categories = useAppSelector(selectSortedCategories);
  const currency = useAppSelector(selectCurrency);
  const saving = useAppSelector(selectExpensesMutating);
  const connected = useAppSelector(selectLinkStatus) === 'connected';
  const partnerName = useAppSelector(selectPersonNames).partner;

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      title={expense ? 'Edit expense' : 'Add expense'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={saving}>
            {expense ? 'Save changes' : 'Add expense'}
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
        <Input
          label="Date"
          type="date"
          value={values.date}
          onChange={(event) => setField('date', event.target.value)}
          error={errors.date}
        />
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
        {(connected || values.split) && (
          <SplitField
            values={values}
            errors={errors}
            setField={setField}
            partnerName={partnerName}
            currency={currency}
          />
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
