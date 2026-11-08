import { useState } from 'react';
import { Plus, Tags } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { InlineError } from '@/components/InlineError';
import { Skeleton } from '@/components/Skeleton';
import { useI18n } from '@/i18n';
import {
  selectCategoriesError,
  selectCategoriesStatus,
  selectPrivateCategories,
  selectSharedCategories,
} from '@/redux/categories/categoriesSelectors';
import { selectExpenseCountsByCategory } from '@/redux/expenses/expensesSelectors';
import {
  selectLinkStatus,
  selectPersonNames,
  selectSharedCategoryCounts,
} from '@/redux/partner/partnerSelectors';
import type { Category } from '@/types/category';
import { CategoryFormModal } from '../CategoryFormModal';
import { CategoryRow } from '../CategoryRow';
import { DeleteCategoryDialog } from '../DeleteCategoryDialog';
import './CategoryManager.css';

interface CategoryManagerProps {
  onRetry?: () => void;
  /** `shared` shows only the categories both partners use (the Together tab). */
  scope?: 'all' | 'shared';
}

type FormState = { open: false } | { open: true; category: Category | null; isPrivate: boolean };

const SKELETON_ROWS = 5;

const SkeletonRows = ({ label }: { label: string }) => (
  <ul aria-busy="true" aria-label={label}>
    {Array.from({ length: SKELETON_ROWS }, (_, index) => (
      <li key={index} className="flex items-center gap-3 border-line px-5 py-3 [&+&]:border-t">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </li>
    ))}
  </ul>
);

export const CategoryManager = ({ onRetry, scope = 'all' }: CategoryManagerProps) => {
  const { t } = useI18n();
  const shared = useAppSelector(selectSharedCategories);
  const privateOnes = useAppSelector(selectPrivateCategories);
  const status = useAppSelector(selectCategoriesStatus);
  const error = useAppSelector(selectCategoriesError);
  const ownCounts = useAppSelector(selectExpenseCountsByCategory);
  const sharedCounts = useAppSelector(selectSharedCategoryCounts);
  // On the Together tab, a shared category counts both people's expenses.
  const counts = scope === 'shared' ? sharedCounts : ownCounts;
  const hasPartner = useAppSelector(selectLinkStatus) !== 'none';
  const partnerName = useAppSelector(selectPersonNames).partner;
  const [form, setForm] = useState<FormState>({ open: false });
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const isLoading = status === 'idle' || status === 'loading';
  const openCreate = (isPrivate: boolean) => setForm({ open: true, category: null, isPrivate });
  const openEdit = (category: Category) =>
    setForm({ open: true, category, isPrivate: category.isPrivate === true });

  const renderRows = (categories: readonly Category[], isPrivate: boolean) => {
    if (isLoading) return <SkeletonRows label={t.categories.loadingList} />;
    if (categories.length === 0) {
      return isPrivate ? (
        <p className="px-5 py-6 text-sm text-ink-subtle">{t.categories.manager.privateEmpty}</p>
      ) : (
        <EmptyState
          icon={<Tags />}
          title={t.categories.manager.emptyTitle}
          description={t.categories.manager.emptyDescription}
          action={
            <Button icon={<Plus />} onClick={() => openCreate(false)}>
              {t.categories.manager.create}
            </Button>
          }
        />
      );
    }
    return (
      <ul>
        {categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            expenseCount={counts[category.id] ?? 0}
            onEdit={openEdit}
            onDelete={setPendingDelete}
          />
        ))}
      </ul>
    );
  };

  return (
    <div className="category-manager flex flex-col gap-5">
      {error && onRetry && <InlineError message={error} onRetry={onRetry} />}
      <Card
        padded={false}
        title={hasPartner ? t.categories.manager.sharedTitle : t.categories.title}
        description={
          hasPartner
            ? t.categories.manager.sharedDescription(partnerName)
            : t.categories.manager.soloDescription
        }
        actions={
          <Button size="sm" icon={<Plus />} onClick={() => openCreate(false)}>
            {t.common.new}
          </Button>
        }
      >
        <div className="mt-4 border-t border-line">{renderRows(shared, false)}</div>
      </Card>
      {scope === 'all' && (
        <Card
          padded={false}
          title={t.categories.manager.privateTitle}
          description={t.categories.manager.privateDescription}
          actions={
            <Button size="sm" variant="secondary" icon={<Plus />} onClick={() => openCreate(true)}>
              {t.common.new}
            </Button>
          }
        >
          <div className="mt-4 border-t border-line">{renderRows(privateOnes, true)}</div>
        </Card>
      )}
      <CategoryFormModal
        open={form.open}
        category={form.open ? form.category : null}
        isPrivate={form.open && form.isPrivate}
        partnerName={hasPartner ? partnerName : undefined}
        onClose={() => setForm({ open: false })}
      />
      <DeleteCategoryDialog
        category={pendingDelete}
        expenseCount={pendingDelete ? (counts[pendingDelete.id] ?? 0) : 0}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
};
