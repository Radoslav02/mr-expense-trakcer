import { useMemo, useState } from 'react';
import { Pencil, ReceiptText, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { PAYMENT_METHODS } from '@/constants/expenses';
import { CategoryBadge } from '@/features/categories/CategoryBadge';
import { ExpenseForm } from '@/features/expenses/ExpenseForm';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useI18n } from '@/i18n';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import { selectSharedCategories } from '@/redux/categories/categoriesSelectors';
import {
  selectConnectedPartnerUid,
  selectPersonNames,
  selectSharedFeed,
} from '@/redux/partner/partnerSelectors';
import { ALL, type Expense, type PaymentMethod } from '@/types/expense';
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
  const { t } = useI18n();
  const copy = t.partner.activity;
  const [owner, setOwner] = useState<OwnerFilter>('all');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [editing, setEditing] = useState<Editing>(null);
  const [search, setSearch] = useState('');
  /** A shared category's `sharedKey`, so it matches both people's copies. */
  const [categoryKey, setCategoryKey] = useState<string>(ALL);
  const [payment, setPayment] = useState<PaymentMethod | typeof ALL>(ALL);
  const [sheetOpen, setSheetOpen] = useState(false);
  const categories = useAppSelector(selectSharedCategories);
  const f = t.expenses.filters;
  const myUid = useAppSelector(selectAuthUser)?.uid;
  const partnerUid = useAppSelector(selectConnectedPartnerUid);

  /** Shown when the last change came from the other person. */
  const editedNote = (person: Person, expense: Expense): string | null => {
    if (!expense.editedBy) return null;
    if (person === 'me' && expense.editedBy === partnerUid)
      return copy.editedByPartner(names.partner);
    if (person === 'partner' && expense.editedBy === myUid) return copy.editedByYou;
    return null;
  };

  const query = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      feed.filter(
        ({ owner: person, expense, category }) =>
          (owner === 'all' || person === owner) &&
          (categoryKey === ALL || category?.sharedKey === categoryKey) &&
          (payment === ALL || expense.paymentMethod === payment) &&
          (!query ||
            [expense.title, expense.note ?? ''].some((text) => text.toLowerCase().includes(query))),
      ),
    [feed, owner, categoryKey, payment, query],
  );

  const activeCount = (categoryKey !== ALL ? 1 : 0) + (payment !== ALL ? 1 : 0);
  const filtering = activeCount > 0 || query !== '';
  const clearFilters = () => {
    setSearch('');
    setCategoryKey(ALL);
    setPayment(ALL);
    setLimit(PAGE_SIZE);
  };

  const categorySelect = (hideLabel: boolean) => (
    <Select
      label={f.category}
      hideLabel={hideLabel}
      value={categoryKey}
      options={[
        { value: ALL, label: f.allCategories },
        ...categories.map((category) => ({ value: category.sharedKey, label: category.name })),
      ]}
      onChange={(event) => {
        setCategoryKey(event.target.value);
        setLimit(PAGE_SIZE);
      }}
      wrapperClassName="min-w-0"
    />
  );

  const paymentSelect = (hideLabel: boolean) => (
    <Select
      label={f.paymentMethod}
      hideLabel={hideLabel}
      value={payment}
      options={[
        { value: ALL, label: f.anyPayment },
        ...PAYMENT_METHODS.map((method) => ({
          value: method,
          label: t.expenses.paymentMethods[method],
        })),
      ]}
      onChange={(event) => {
        setPayment(event.target.value as PaymentMethod | typeof ALL);
        setLimit(PAGE_SIZE);
      }}
      wrapperClassName="min-w-0"
    />
  );

  const filters: { value: OwnerFilter; label: string }[] = [
    { value: 'all', label: copy.both },
    { value: 'me', label: names.me },
    { value: 'partner', label: names.partner },
  ];

  return (
    <Card
      title={copy.title}
      description={copy.description}
      padded={false}
      actions={
        <div
          role="group"
          aria-label={copy.filterLabel}
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
      <div className="mt-4 flex min-w-0 flex-col gap-2 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:px-5">
        <div className="flex min-w-0 flex-1 gap-2">
          <Input
            label={f.search}
            hideLabel
            type="search"
            placeholder={f.searchPlaceholder}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setLimit(PAGE_SIZE);
            }}
            leadingIcon={<Search />}
            wrapperClassName="min-w-0 flex-1"
          />
          <Button
            variant="secondary"
            iconOnly
            icon={<SlidersHorizontal />}
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            className="sm:hidden"
          >
            {activeCount > 0 ? f.openWithCount(activeCount) : f.open}
          </Button>
          {activeCount > 0 && (
            <span
              aria-hidden="true"
              className="pointer-events-none -ml-4 -mt-1 flex h-5 min-w-5 items-center justify-center self-start rounded-full bg-accent px-1 text-[0.6875rem] font-semibold text-accent-ink sm:hidden"
            >
              {activeCount}
            </span>
          )}
        </div>
        <div className="hidden min-w-0 gap-2 sm:grid sm:w-80 sm:shrink-0 sm:grid-cols-2">
          {categorySelect(true)}
          {paymentSelect(true)}
        </div>
        {filtering && (
          <Button
            variant="ghost"
            size="sm"
            icon={<X />}
            onClick={clearFilters}
            className="hidden self-center sm:inline-flex"
          >
            {f.clear}
          </Button>
        )}
      </div>
      {visible.length === 0 ? (
        filtering ? (
          <EmptyState
            icon={<SearchX />}
            title={t.expenses.page.noMatchTitle}
            description={t.expenses.page.noMatchDescription}
            action={
              <Button variant="secondary" onClick={clearFilters}>
                {f.clear}
              </Button>
            }
            className="py-10"
          />
        ) : (
          <EmptyState
            icon={<ReceiptText />}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
            className="py-10"
          />
        )
      ) : (
        <ul className="border-t border-line">
          {visible.slice(0, limit).map(({ owner: person, expense, category }) => (
            <li key={`${person}-${expense.id}`} className="shared-activity__row">
              <button
                type="button"
                onClick={() => setEditing({ owner: person, expense })}
                aria-label={copy.editLabel(expense.title, format(expense.amount), names[person])}
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
                      {category?.name ?? t.common.uncategorized}
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
                      {copy.split}
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
            {copy.showMore(Math.min(PAGE_SIZE, visible.length - limit))}
          </Button>
        </div>
      )}
      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        size="sm"
        title={f.title}
        footer={
          <>
            {activeCount > 0 && (
              <Button variant="ghost" icon={<X />} onClick={clearFilters}>
                {f.clear}
              </Button>
            )}
            <Button onClick={() => setSheetOpen(false)}>{f.done}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 pb-2">
          {categorySelect(false)}
          {paymentSelect(false)}
        </div>
      </Modal>
      <ExpenseForm
        open={editing !== null}
        expense={editing?.owner === 'me' ? editing.expense : null}
        partnerExpense={editing?.owner === 'partner' ? editing.expense : null}
        onClose={() => setEditing(null)}
      />
    </Card>
  );
};
