import { useMemo, useState } from 'react';
import { ReceiptText } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { CategoryBadge } from '@/features/categories/CategoryBadge';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { selectPersonNames, selectSharedFeed } from '@/redux/partner/partnerSelectors';
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

const PAGE_SIZE = 12;

export const SharedActivity = ({ month }: SharedActivityProps) => {
  const feed = useAppSelector((state) => selectSharedFeed(state, month));
  const names = useAppSelector(selectPersonNames);
  const { format } = useCurrencyFormatter();
  const [owner, setOwner] = useState<OwnerFilter>('all');
  const [limit, setLimit] = useState(PAGE_SIZE);

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
      description="Every expense from both of you this month"
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
            <li
              key={`${person}-${expense.id}`}
              className="shared-activity__row flex items-center gap-3 px-5 py-3"
            >
              <PersonAvatar person={person} name={names[person]} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.9375rem] font-medium text-ink">{expense.title}</p>
                <p className="mt-0.5 flex min-w-0 items-center gap-2 text-[0.8125rem] text-ink-subtle">
                  <span className="shrink-0">{names[person]}</span>
                  <span aria-hidden="true">·</span>
                  <CategoryBadge category={category} className="hidden sm:inline-flex" />
                  <span className="truncate sm:hidden">{category?.name ?? 'Uncategorized'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="shrink-0">{formatDayHeading(expense.date)}</span>
                </p>
              </div>
              <span className="shrink-0 text-right">
                <span className="tabular block text-[0.9375rem] font-semibold text-ink">
                  {format(expense.amount)}
                </span>
                {isSplit(expense) && (
                  <span className="mt-0.5 block text-[0.75rem] font-medium text-partner">
                    Split
                  </span>
                )}
              </span>
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
    </Card>
  );
};
