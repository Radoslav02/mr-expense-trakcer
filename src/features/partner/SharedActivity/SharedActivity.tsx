import { useMemo, useState } from 'react';
import { Pencil, ReceiptText } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { CategoryBadge } from '@/features/categories/CategoryBadge';
import { ExpenseForm } from '@/features/expenses/ExpenseForm';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import {
  selectConnectedPartnerUid,
  selectPersonNames,
  selectSharedFeed,
} from '@/redux/partner/partnerSelectors';
import type { Expense } from '@/types/expense';
import type { Person } from '@/types/partner';
import { cn } from '@/utils/cn';
import { formatDayHeading } from '@/utils/dates';
import { isSplit } from '@/utils/split';
import { PersonAvatar } from '../PersonAvatar';
import './SharedActivity.css';

interface SharedActivityProps {
  month: string;
}

type OwnerFilter = Person | 'all';

type Editing = { owner: Person; expense: Expense } | null;

const PAGE_SIZE = 12;

export const SharedActivity = ({ month }: SharedActivityProps) => {
  const feed = useAppSelector((state) => selectSharedFeed(state, month));
  const names = useAppSelector(selectPersonNames);
  const { format } = useCurrencyFormatter();
  const [owner, setOwner] = useState<OwnerFilter>('all');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [editing, setEditing] = useState<Editing>(null);
  const myUid = useAppSelector(selectAuthUser)?.uid;
  const partnerUid = useAppSelector(selectConnectedPartnerUid);

  /** Shown when the last change came from the other person. */
  const editedNote = (person: Person, expense: Expense): string | null => {
    if (!expense.editedBy) return null;
    if (person === 'me' && expense.editedBy === partnerUid) return `edited by ${names.partner}`;
    if (person === 'partner' && expense.editedBy === myUid) return 'edited by you';
    return null;
  };

  const visible = useMemo(
    () => (owner === 'all' ? feed : feed.filter((item) => item.owner === owner)),
    [feed, owner],
  );

  const filters: { value: OwnerFilter; label: string }[] = [
    { value: 'all', label: 'Both' },
    { value: 'me', label: names.me },
    { value: 'partner', label: names.partner },
  ];

  return (
    <Card
      title="Who bought what"
      description="Every expense from both of you this month. Tap one to edit it."
      padded={false}
      actions={
        <div
          role="group"
          aria-label="Show expenses from"
          className="shared-activity__filter inline-flex rounded-lg bg-sunken p-0.5"
        >
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={owner === filter.value}
              onClick={() => {
                setOwner(filter.value);
                setLimit(PAGE_SIZE);
              }}
              className={cn('shared-activity__option', owner === filter.value && 'is-selected')}
            >
              {filter.label}
            </button>
          ))}
        </div>
      }
    >
      {visible.length === 0 ? (
        <EmptyState
          icon={<ReceiptText />}
          title="No expenses here"
          description="Nothing recorded for this month yet."
          className="py-10"
        />
      ) : (
        <ul className="mt-4 border-t border-line">
          {visible.slice(0, limit).map(({ owner: person, expense, category }) => (
            <li key={`${person}-${expense.id}`} className="shared-activity__row">
              <button
                type="button"
                onClick={() => setEditing({ owner: person, expense })}
                aria-label={`Edit ${expense.title}, ${format(expense.amount)}, paid by ${names[person]}`}
                className="shared-activity__main group flex w-full items-center gap-3 px-4 py-3 text-left sm:px-5"
              >
                <PersonAvatar person={person} name={names[person]} />
                <span className="min-w-0 flex-1 overflow-hidden">
                  <span className="block truncate text-[0.9375rem] font-medium text-ink">
                    {expense.title}
                  </span>
                  <span className="mt-0.5 flex min-w-0 items-center gap-2 text-[0.8125rem] text-ink-subtle">
                    <span className="shrink-0">{names[person]}</span>
                    <span aria-hidden="true" className="shrink-0">
                      ·
                    </span>
                    <CategoryBadge category={category} className="hidden min-w-0 sm:inline-flex" />
                    <span className="min-w-0 truncate sm:hidden">
                      {category?.name ?? 'Uncategorized'}
                    </span>
                    <span aria-hidden="true" className="hidden shrink-0 min-[400px]:inline">
                      ·
                    </span>
                    <span className="hidden shrink-0 whitespace-nowrap min-[400px]:inline">
                      {formatDayHeading(expense.date)}
                    </span>
                    {editedNote(person, expense) && (
                      <span className="hidden shrink-0 whitespace-nowrap italic md:inline">
                        · {editedNote(person, expense)}
                      </span>
                    )}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="tabular block whitespace-nowrap text-[0.9375rem] font-semibold text-ink">
                    {format(expense.amount)}
                  </span>
                  {isSplit(expense) && (
                    <span className="mt-0.5 block text-[0.75rem] font-medium text-partner">
                      Split
                    </span>
                  )}
                </span>
                <Pencil
                  aria-hidden="true"
                  className="shared-activity__edit hidden h-4 w-4 shrink-0 text-ink-subtle sm:block"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
      {visible.length > limit && (
        <div className="border-t border-line px-5 py-3 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLimit((current) => current + PAGE_SIZE)}
          >
            Show {Math.min(PAGE_SIZE, visible.length - limit)} more
          </Button>
        </div>
      )}
      <ExpenseForm
        open={editing !== null}
        expense={editing?.owner === 'me' ? editing.expense : null}
        partnerExpense={editing?.owner === 'partner' ? editing.expense : null}
        onClose={() => setEditing(null)}
      />
    </Card>
  );
};
