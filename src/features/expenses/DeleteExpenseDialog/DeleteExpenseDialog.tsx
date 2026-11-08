import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
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
  const { t } = useI18n();

  const handleConfirm = async () => {
    if (!expense) return;
    try {
      await dispatch(removeExpense(expense)).unwrap();
      toast.success(t.expenses.toasts.deleted);
      onClose();
    } catch (message) {
      toast.error(String(message));
    }
  };

  return (
    <ConfirmDialog
      open={expense !== null}
      title={t.expenses.delete.title}
      confirmLabel={t.expenses.delete.confirm}
      loading={deleting}
      onConfirm={handleConfirm}
      onCancel={onClose}
      message={
        expense && (
          <p className="delete-expense__message">
            <strong>{expense.title}</strong> ·{' '}
            {t.expenses.delete.details(format(expense.amount), formatShortDate(expense.date))}
          </p>
        )
      }
    />
  );
};
