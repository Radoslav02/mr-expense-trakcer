import { useAppDispatch } from '@/app/hooks';
import { PageHeader } from '@/components/PageHeader';
import { CategoryManager } from '@/features/categories/CategoryManager';
import { useI18n } from '@/i18n';
import { loadCategories } from '@/redux/categories/categoriesThunks';
import './CategoriesPage.css';

export const CategoriesPage = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  return (
    <div className="categories-page mx-auto max-w-3xl">
      <PageHeader title={t.categories.title} description={t.categories.pageDescription} />
      <CategoryManager onRetry={() => void dispatch(loadCategories())} />
    </div>
  );
};
