import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { CATEGORY_COLOR_OPTIONS } from '@/constants/categories';
import { DEFAULT_CATEGORY_ICON } from '@/constants/categoryIcons';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
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
  /** For a new category: private ones are only for private expenses and only you see them. */
  isPrivate?: boolean;
  /** Set when you have a partner, to explain that shared categories show up for them too. */
  partnerName?: string;
  onClose: () => void;
}

const FORM_ID = 'category-form';

const initialValues = (category: Category | null): CategoryInput => ({
  name: category?.name ?? '',
  color: category?.color ?? CATEGORY_COLOR_OPTIONS[0],
  icon: category?.icon ?? DEFAULT_CATEGORY_ICON,
});

export const CategoryFormModal = ({
  open,
  category,
  isPrivate = false,
  partnerName,
  onClose,
}: CategoryFormModalProps) => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const saving = useAppSelector(selectCategoriesMutating);
  const names = useAppSelector(selectCategoryNames);
  const [values, setValues] = useState<CategoryInput>(() => initialValues(category));
  const [nameError, setNameError] = useState<string | null>(null);
  const privateCategory = category ? category.isPrivate === true : isPrivate;
  const scopeNote = privateCategory
    ? t.categories.form.privateNote
    : partnerName
      ? t.categories.form.sharedNote(partnerName)
      : undefined;

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
      if (category) {
        // A built-in category shows a translated name; only save the name if it was changed,
        // so it keeps translating.
        const { name, ...look } = values;
        const changes = name.trim() === category.name ? look : values;
        await dispatch(editCategory({ category, changes })).unwrap();
      } else await dispatch(addCategory({ input: values, isPrivate })).unwrap();
      toast.success(
        category ? t.categories.form.updated : t.categories.form.created(values.name.trim()),
      );
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
      title={
        category
          ? t.categories.form.editTitle
          : privateCategory
            ? t.categories.form.newPrivateTitle
            : t.categories.form.newTitle
      }
      description={scopeNote}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button type="submit" form={FORM_ID} loading={saving}>
            {category ? t.common.saveChanges : t.categories.form.create}
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
            label={t.categories.form.name}
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
