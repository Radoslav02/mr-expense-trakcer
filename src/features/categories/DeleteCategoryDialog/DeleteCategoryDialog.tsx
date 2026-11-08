import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { OTHER_CATEGORY_ID } from '@/constants/categories';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
import {
  selectCategoriesMutating,
  selectCategoryMap,
} from '@/redux/categories/categoriesSelectors';
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
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const otherName =
    useAppSelector(selectCategoryMap)[OTHER_CATEGORY_ID]?.name ??
    t.categories.defaults[OTHER_CATEGORY_ID];
  const copy = t.categories.deleteDialog;
  const toast = useToast();
  const deleting = useAppSelector(selectCategoriesMutating);
  const hasExpenses = expenseCount > 0;

  const handleConfirm = async () => {
    if (!category) return;
    try {
      const result = await dispatch(removeCategory(category)).unwrap();
      toast.success(
        result.reassignedCount > 0
          ? copy.deletedAndMoved(category.name, result.reassignedCount, otherName)
          : copy.deleted(category.name),
      );
      onClose();
    } catch (message) {
      toast.error(String(message));
    }
  };

  return (
    <ConfirmDialog
      open={category !== null}
      title={copy.title(category?.name ?? copy.fallbackName)}
      confirmLabel={hasExpenses ? copy.confirmReassign : copy.confirm}
      loading={deleting}
      onConfirm={handleConfirm}
      onCancel={onClose}
      message={
        hasExpenses ? (
          <p className="delete-category__message">
            {!category?.isPrivate && copy.partnerToo}
            <strong>{copy.inUse(expenseCount)}</strong> {copy.movedBefore}
            <strong>{otherName}</strong>
            {copy.movedAfter}
          </p>
        ) : (
          <p className="delete-category__message">
            {!category?.isPrivate && copy.partnerToo}
            {copy.unused}
          </p>
        )
      }
    />
  );
};
