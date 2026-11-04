import { useAppDispatch } from '@/app/hooks';
import { PageHeader } from '@/components/PageHeader';
import { CategoryManager } from '@/features/categories/CategoryManager';
import { loadCategories } from '@/redux/categories/categoriesThunks';
import './CategoriesPage.css';

export const CategoriesPage = () => {
  const dispatch = useAppDispatch();

  return (
    <div className="categories-page mx-auto max-w-3xl">
      <PageHeader
        title="Categories"
        description="Rename, recolor or remove categories. Deleted ones hand their expenses to Other."
      />
      <CategoryManager onRetry={() => void dispatch(loadCategories())} />
    </div>
  );
};
