import { ShoppingBasket } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Card } from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { selectPersonNames, selectSharedCosts } from '@/redux/partner/partnerSelectors';
import type { Person } from '@/types/partner';
import { PersonAvatar } from '../PersonAvatar';

interface SharedCostsProps {
  month: string;
  loading: boolean;
}

interface PartRowProps {
  person: Person;
  name: string;
  label: string;
  detail: string;
  amount: string;
}

const PartRow = ({ person, name, label, detail, amount }: PartRowProps) => (
  <li className="flex items-center gap-3">
    <PersonAvatar person={person} name={name} size="sm" />
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm text-ink">{label}</span>
      <span className="block truncate text-[0.8125rem] text-ink-subtle">{detail}</span>
    </span>
    <span className="tabular shrink-0 whitespace-nowrap text-sm font-medium text-ink">
      {amount}
    </span>
  </li>
);

/** Costs you share, like groceries: the total and each person's part. Nobody owes anybody. */
export const SharedCosts = ({ month, loading }: SharedCostsProps) => {
  const costs = useAppSelector((state) => selectSharedCosts(state, month));
  const names = useAppSelector(selectPersonNames);
  const { format } = useCurrencyFormatter();

  return (
    <Card title="Shared costs" description="Things you split this month, like groceries">
      {loading ? (
        <Skeleton className="h-8 w-48" />
      ) : costs.count === 0 ? (
        <p className="flex items-center gap-2 text-sm text-ink-subtle">
          <ShoppingBasket className="h-4 w-4 shrink-0" aria-hidden="true" />
          Nothing shared this month. Turn on “Split with {names.partner}” when adding one.
        </p>
      ) : (
        <>
          <p
            aria-live="polite"
            className="tabular text-[1.375rem] font-semibold tracking-[-0.02em] text-ink"
          >
            {format(costs.total)}
            <span className="ml-2 text-sm font-normal tracking-normal text-ink-subtle">
              in {costs.count} {costs.count === 1 ? 'expense' : 'expenses'}
            </span>
          </p>
          <ul className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
            <PartRow
              person="me"
              name={names.me}
              label="Your part"
              detail={`You bought ${format(costs.boughtByMe)}`}
              amount={format(costs.myPart)}
            />
            <PartRow
              person="partner"
              name={names.partner}
              label={`${names.partner}’s part`}
              detail={`${names.partner} bought ${format(costs.boughtByPartner)}`}
              amount={format(costs.partnerPart)}
            />
          </ul>
        </>
      )}
    </Card>
  );
};
