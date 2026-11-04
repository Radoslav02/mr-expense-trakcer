import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useToast } from '@/hooks/useToast';
import { selectExpensesMutating } from '@/redux/expenses/expensesSelectors';
import { removeExpense } from '@/redux/expenses/expensesThunks';
import type { Expense } from '@/types/expense';
import { formatShortDate } from '@/utils/dates';
import './DeleteExpenseDialog.css';

interface DeleteExpenseDialogProps {
  expense: Expense | null;
  onClose: () => void;
}

export const DeleteExpenseDialog = ({ expense, onClose }: DeleteExpenseDialogProps) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const deleting = useAppSelector(selectExpensesMutating);
  const { format } = useCurrencyFormatter();

  const handleConfirm = async () => {
    if (!expense) return;
    try {
      await dispatch(removeExpense(expense.id)).unwrap();
      toast.success('Expense deleted.');
      onClose();
    } catch (message) {
      toast.error(String(message));
    }
  };

  return (
    <ConfirmDialog
      open={expense !== null}
      title="Delete this expense?"
      confirmLabel="Delete expense"
      loading={deleting}
      onConfirm={handleConfirm}
      onCancel={onClose}
      message={
        expense && (
          <p className="delete-expense__message">
            <strong>{expense.title}</strong> · {format(expense.amount)} on{' '}
            {formatShortDate(expense.date)}. This can’t be undone.
          </p>
        )
      }
    />
  );
};
