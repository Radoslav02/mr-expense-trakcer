import type { CSSProperties } from 'react';
import { Scale } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useI18n } from '@/i18n';
import { selectCategoryComparison, selectPersonNames } from '@/redux/partner/partnerSelectors';
import { PersonLegend } from '../PersonLegend';
import './CategoryComparison.css';

interface CategoryComparisonProps {
  month: string;
  loading: boolean;
}

const barStyle = (value: number, max: number) =>
  ({ '--bar': max > 0 ? value / max : 0 }) as CSSProperties;

export const CategoryComparison = ({ month, loading }: CategoryComparisonProps) => {
  const rows = useAppSelector((state) => selectCategoryComparison(state, month));
  const names = useAppSelector(selectPersonNames);
  const { format } = useCurrencyFormatter();
  const { t } = useI18n();
  const max = Math.max(0, ...rows.flatMap((row) => [row.me, row.partner]));

  return (
    <Card
      title={t.partner.categories.title}
      description={t.partner.categories.description}
      actions={<PersonLegend />}
      className="category-comparison"
    >
      {loading ? (
        <div className="space-y-5">
          {[0, 1, 2].map((row) => (
            <div key={row} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-2/3" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Scale />}
          title={t.partner.categories.emptyTitle}
          description={t.partner.categories.emptyDescription}
          className="py-8"
        />
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.key}>
              <p className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                {row.name}
              </p>
              <div className="space-y-1">
                {(['me', 'partner'] as const).map((person) => (
                  <div key={person} className="grid grid-cols-[1fr_auto] items-center gap-3">
                    <span className="sr-only">{names[person]}</span>
                    <span className="category-comparison__track">
                      <span
                        className={`category-comparison__bar is-${person}`}
                        style={barStyle(row[person], max)}
                      />
                    </span>
                    <span className="tabular w-24 text-right text-[0.8125rem] text-ink-muted">
                      {format(row[person])}
                    </span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
