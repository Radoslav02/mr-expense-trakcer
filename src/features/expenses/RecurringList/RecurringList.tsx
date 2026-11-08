import { useState } from 'react';
import { ChevronDown, Lock, Pencil, Repeat, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { UNCATEGORIZED_COLOR } from '@/constants/categories';
import { CategoryIcon } from '@/features/categories/CategoryIcon';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useToast } from '@/hooks/useToast';
import { selectCategoryMap } from '@/redux/categories/categoriesSelectors';
import {
  selectRecurring,
  selectRecurringMutating,
  stopRecurring,
} from '@/redux/recurring/recurringSlice';
import type { RecurringExpense } from '@/types/expense';
import { cn } from '@/utils/cn';
import { roundMoney } from '@/utils/currency';
import { formatShortDate, ordinal } from '@/utils/dates';
import { nextDueDate, ownPartOf } from '@/utils/recurring';
import { ExpenseForm } from '../ExpenseForm';
import './RecurringList.css';

/** Monthly expenses that are added automatically, with edit and stop. */
export const RecurringList = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const templates = useAppSelector(selectRecurring);
  const categories = useAppSelector(selectCategoryMap);
  const stopping = useAppSelector(selectRecurringMutating);
  const { format } = useCurrencyFormatter();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState<RecurringExpense | null>(null);
  const [pendingStop, setPendingStop] = useState<RecurringExpense | null>(null);

  if (templates.length === 0) return null;

  const monthlyTotal = roundMoney(templates.reduce((sum, item) => sum + ownPartOf(item), 0));

  const confirmStop = async () => {
    if (!pendingStop) return;
    try {
      await dispatch(stopRecurring(pendingStop.id)).unwrap();
      toast.success(`“${pendingStop.title}” won’t be added anymore.`);
      setPendingStop(null);
    } catch (message) {
      toast.error(String(message));
    }
  };

  return (
    <Card padded={false} as="div" className="recurring-list">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
        className="recurring-list__toggle flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Repeat aria-hidden="true" className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink">Every month</span>
          <span className="block truncate text-[0.8125rem] text-ink-subtle">
            {templates.length} recurring · your part{' '}
            <span className="tabular">{format(monthlyTotal)}</span> a month
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'recurring-list__chevron h-4 w-4 shrink-0 text-ink-subtle',
            expanded && 'is-open',
          )}
        />
      </button>
      {expanded && (
        <ul className="border-t border-line">
          {templates.map((template) => {
            const category = categories[template.categoryId];
            return (
              <li
                key={template.id}
                className="recurring-list__item flex items-center gap-3 px-4 py-3 sm:px-5"
              >
                <CategoryIcon
                  icon={category?.icon}
                  color={category?.color ?? UNCATEGORIZED_COLOR}
                  className="hidden min-[400px]:flex"
                />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate text-[0.9375rem] font-medium text-ink">
                      {template.title}
                    </span>
                    {template.isPrivate && (
                      <Lock aria-label="Private" className="h-3.5 w-3.5 shrink-0 text-ink-subtle" />
                    )}
                  </p>
                  <p className="truncate text-[0.8125rem] text-ink-subtle">
                    {template.partnerShare ? 'Split · ' : ''}On the {ordinal(template.dayOfMonth)}
                    {' · next '}
                    {formatShortDate(nextDueDate(template))}
                  </p>
                </div>
                <span className="tabular shrink-0 whitespace-nowrap text-[0.9375rem] font-semibold text-ink">
                  {format(ownPartOf(template))}
                </span>
                <div className="flex shrink-0 items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    icon={<Pencil />}
                    onClick={() => setEditing(template)}
                  >
                    {`Edit ${template.title}`}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    icon={<Trash2 />}
                    onClick={() => setPendingStop(template)}
                    className="hover:text-danger"
                  >
                    {`Stop ${template.title}`}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <ExpenseForm
        open={editing !== null}
        expense={null}
        recurring={editing}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        open={pendingStop !== null}
        title="Stop this recurring expense?"
        confirmLabel="Stop repeating"
        loading={stopping}
        onConfirm={confirmStop}
        onCancel={() => setPendingStop(null)}
        message={
          pendingStop && (
            <p>
              <strong>{pendingStop.title}</strong> won’t be added in future months. Expenses already
              added stay where they are.
            </p>
          )
        }
      />
    </Card>
  );
};
