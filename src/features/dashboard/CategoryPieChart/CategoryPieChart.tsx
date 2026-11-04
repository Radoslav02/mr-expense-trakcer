import { PieChart as PieIcon } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipProps } from 'recharts';
import { useAppSelector } from '@/app/hooks';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { selectCategoryTotalsForMonth } from '@/redux/expenses/expensesSelectors';
import { formatPercent } from '@/utils/currency';
import type { CategoryTotal } from '@/utils/expenses';
import { ChartTooltip } from '../ChartTooltip';
import './CategoryPieChart.css';

interface CategoryPieChartProps {
  month: string;
  loading: boolean;
}

export const CategoryPieChart = ({ month, loading }: CategoryPieChartProps) => {
  const totals = useAppSelector((state) => selectCategoryTotalsForMonth(state, month));
  const { format } = useCurrencyFormatter();
  const grandTotal = totals.reduce((sum, item) => sum + item.total, 0);

  const renderTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    const item = payload?.[0]?.payload as CategoryTotal | undefined;
    if (!active || !item) return null;
    return <ChartTooltip title={item.name} value={format(item.total)} color={item.color} />;
  };

  return (
    <Card
      title="Spending by category"
      description="Where this month’s money went"
      className="category-pie-chart"
    >
      {loading ? (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <Skeleton className="h-44 w-44 rounded-full" />
          <div className="w-full flex-1 space-y-3">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} className="h-4 w-full" />
            ))}
          </div>
        </div>
      ) : totals.length === 0 ? (
        <EmptyState
          icon={<PieIcon />}
          title="No spending this month"
          description="Add an expense and its category share will show up here."
          className="py-10"
        />
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div
            className="relative h-44 w-44 shrink-0"
            role="img"
            aria-label="Donut chart of spending by category"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={totals}
                  dataKey="total"
                  nameKey="name"
                  innerRadius="68%"
                  outerRadius="100%"
                  paddingAngle={totals.length > 1 ? 2 : 0}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {totals.map((item) => (
                    <Cell key={item.categoryId} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-ink-subtle">Total</span>
              <span className="tabular text-sm font-semibold text-ink">{format(grandTotal)}</span>
            </div>
          </div>
          <ul className="category-pie-chart__legend w-full min-w-0 flex-1 space-y-2.5">
            {totals.map((item) => (
              <li key={item.categoryId} className="flex items-center gap-2.5 text-sm">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="min-w-0 flex-1 truncate text-ink">{item.name}</span>
                <span className="tabular text-ink-subtle">
                  {formatPercent(item.total / grandTotal)}
                </span>
                <span className="tabular w-24 text-right font-medium text-ink">
                  {format(item.total)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
