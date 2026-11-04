import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { CATEGORY_COLOR_OPTIONS } from '@/constants/categories';
import { DEFAULT_CATEGORY_ICON } from '@/constants/categoryIcons';
import { useToast } from '@/hooks/useToast';
import {
  selectCategoriesMutating,
  selectCategoryNames,
} from '@/redux/categories/categoriesSelectors';
import { addCategory, editCategory } from '@/redux/categories/categoriesThunks';
import type { Category, CategoryInput } from '@/types/category';
import { validateCategoryName } from '@/utils/validation';
import { CategoryIcon } from '../CategoryIcon';
import { ColorPicker } from '../ColorPicker';
import { IconPicker } from '../IconPicker';
import './CategoryFormModal.css';

interface CategoryFormModalProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
}

const FORM_ID = 'category-form';

const initialValues = (category: Category | null): CategoryInput => ({
  name: category?.name ?? '',
  color: category?.color ?? CATEGORY_COLOR_OPTIONS[0],
  icon: category?.icon ?? DEFAULT_CATEGORY_ICON,
});

export const CategoryFormModal = ({ open, category, onClose }: CategoryFormModalProps) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const saving = useAppSelector(selectCategoriesMutating);
  const names = useAppSelector(selectCategoryNames);
  const [values, setValues] = useState<CategoryInput>(() => initialValues(category));
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValues(initialValues(category));
    setNameError(null);
  }, [open, category]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const takenNames = names.filter((name) => name !== category?.name);
    const error = validateCategoryName(values.name, takenNames);
    setNameError(error);
    if (error) return;

    try {
      if (category) await dispatch(editCategory({ id: category.id, changes: values })).unwrap();
      else await dispatch(addCategory(values)).unwrap();
      toast.success(category ? 'Category updated.' : `“${values.name.trim()}” created.`);
      onClose();
    } catch (message) {
      toast.error(String(message));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      title={category ? 'Edit category' : 'New category'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={saving}>
            {category ? 'Save changes' : 'Create category'}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className="category-form flex flex-col gap-5 pb-2"
      >
        <div className="flex items-end gap-3">
          <CategoryIcon icon={values.icon} color={values.color} className="mb-0.5 h-10 w-10" />
          <Input
            label="Name"
            value={values.name}
            maxLength={32}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            error={nameError ?? undefined}
            wrapperClassName="flex-1"
          />
        </div>
        <ColorPicker
          value={values.color}
          onChange={(color) => setValues((current) => ({ ...current, color }))}
        />
        <IconPicker
          value={values.icon ?? DEFAULT_CATEGORY_ICON}
          color={values.color}
          onChange={(icon) => setValues((current) => ({ ...current, icon }))}
        />
      </form>
    </Modal>
  );
};
