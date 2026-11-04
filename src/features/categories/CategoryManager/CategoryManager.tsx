import { useState } from 'react';
import { Plus, Tags } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { InlineError } from '@/components/InlineError';
import { Skeleton } from '@/components/Skeleton';
import {
  selectCategoriesError,
  selectCategoriesStatus,
  selectSortedCategories,
} from '@/redux/categories/categoriesSelectors';
import { selectExpenseCountsByCategory } from '@/redux/expenses/expensesSelectors';
import type { Category } from '@/types/category';
import { CategoryFormModal } from '../CategoryFormModal';
import { CategoryRow } from '../CategoryRow';
import { DeleteCategoryDialog } from '../DeleteCategoryDialog';
import './CategoryManager.css';

interface CategoryManagerProps {
  onRetry: () => void;
}

type FormState = { open: false } | { open: true; category: Category | null };

const SKELETON_ROWS = 5;

export const CategoryManager = ({ onRetry }: CategoryManagerProps) => {
  const categories = useAppSelector(selectSortedCategories);
  const status = useAppSelector(selectCategoriesStatus);
  const error = useAppSelector(selectCategoriesError);
  const counts = useAppSelector(selectExpenseCountsByCategory);
  const [form, setForm] = useState<FormState>({ open: false });
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const isLoading = status === 'idle' || status === 'loading';
  const openCreate = () => setForm({ open: true, category: null });

  return (
    <div className="category-manager flex flex-col gap-4">
      <div className="flex justify-end">
        <Button icon={<Plus />} onClick={openCreate}>
          New category
        </Button>
      </div>
      {error && <InlineError message={error} onRetry={onRetry} />}
      <Card padded={false}>
        {isLoading ? (
          <ul aria-busy="true" aria-label="Loading categories">
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <li
                key={index}
                className="flex items-center gap-3 border-line px-5 py-3 [&+&]:border-t"
              >
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </li>
            ))}
          </ul>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={<Tags />}
            title="No categories yet"
            description="Categories group your spending so the overview can show where money goes."
            action={
              <Button icon={<Plus />} onClick={openCreate}>
                Create a category
              </Button>
            }
          />
        ) : (
          <ul>
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                expenseCount={counts[category.id] ?? 0}
                onEdit={(selected) => setForm({ open: true, category: selected })}
                onDelete={setPendingDelete}
              />
            ))}
          </ul>
        )}
      </Card>
      <CategoryFormModal
        open={form.open}
        category={form.open ? form.category : null}
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
