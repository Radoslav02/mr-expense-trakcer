import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { selectCategoriesMutating } from '@/redux/categories/categoriesSelectors';
import { removeCategory } from '@/redux/categories/categoriesThunks';
import type { Category } from '@/types/category';
import './DeleteCategoryDialog.css';

interface DeleteCategoryDialogProps {
  category: Category | null;
  expenseCount: number;
  onClose: () => void;
}

export const DeleteCategoryDialog = ({
  category,
  expenseCount,
  onClose,
}: DeleteCategoryDialogProps) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const deleting = useAppSelector(selectCategoriesMutating);
  const hasExpenses = expenseCount > 0;

  const handleConfirm = async () => {
    if (!category) return;
    try {
      const result = await dispatch(removeCategory(category.id)).unwrap();
      toast.success(
        result.reassignedCount > 0
          ? `Deleted “${category.name}” and moved ${result.reassignedCount} expenses to Other.`
          : `Deleted “${category.name}”.`,
      );
      onClose();
    } catch (message) {
      toast.error(String(message));
    }
  };

  return (
    <ConfirmDialog
      open={category !== null}
      title={`Delete ${category?.name ?? 'category'}?`}
      confirmLabel={hasExpenses ? 'Delete and reassign' : 'Delete category'}
      loading={deleting}
      onConfirm={handleConfirm}
      onCancel={onClose}
      message={
        hasExpenses ? (
          <p className="delete-category__message">
            <strong>
              {expenseCount} {expenseCount === 1 ? 'expense uses' : 'expenses use'} this category.
            </strong>{' '}
            They will be moved to <strong>Other</strong> so nothing is lost.
          </p>
        ) : (
          <p className="delete-category__message">
            No expenses use this category. This can’t be undone.
          </p>
        )
      }
    />
  );
};
