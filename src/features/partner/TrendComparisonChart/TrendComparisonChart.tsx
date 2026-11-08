import { formatAxisAmount } from '@/utils/currency';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { useAppSelector } from '@/app/hooks';
import { Card } from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { MONTHS_IN_TREND } from '@/constants/expenses';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useI18n } from '@/i18n';
import { selectPersonNames, selectTrendComparison } from '@/redux/partner/partnerSelectors';
import type { TrendComparisonPoint } from '@/utils/comparison';
import { formatMonthLabel, formatShortMonth } from '@/utils/dates';
import { PersonLegend } from '../PersonLegend';
import './TrendComparisonChart.css';

interface TrendComparisonChartProps {
  month: string;
  loading: boolean;
}

export const TrendComparisonChart = ({ month, loading }: TrendComparisonChartProps) => {
  const trend = useAppSelector((state) => selectTrendComparison(state, month));
  const names = useAppSelector(selectPersonNames);
  const { format } = useCurrencyFormatter();
  const { t } = useI18n();

  const renderTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    const point = payload?.[0]?.payload as TrendComparisonPoint | undefined;
    if (!active || !point) return null;
    return (
      <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-overlay">
        <p className="mb-1 text-ink-subtle">{formatMonthLabel(point.month)}</p>
        <p className="tabular flex justify-between gap-4 text-ink">
          <span>{names.me}</span>
          <span className="font-semibold">{format(point.me)}</span>
        </p>
        <p className="tabular flex justify-between gap-4 text-ink">
          <span>{names.partner}</span>
          <span className="font-semibold">{format(point.partner)}</span>
        </p>
      </div>
    );
  };

  return (
    <Card
      title={t.partner.trend.title(MONTHS_IN_TREND)}
      description={t.partner.trend.description}
      actions={<PersonLegend />}
      className="trend-comparison"
    >
      {loading ? (
        <Skeleton className="h-56 w-full" />
      ) : (
        <div className="h-56" role="img" aria-label={t.partner.trend.chartLabel(MONTHS_IN_TREND)}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trend}
              margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
              barGap={3}
              barCategoryGap="24%"
            >
              <CartesianGrid vertical={false} className="trend-comparison__grid" />
              <XAxis
                dataKey="month"
                tickFormatter={formatShortMonth}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                tickFormatter={formatAxisAmount}
                axisLine={false}
                tickLine={false}
                width={64}
                tickMargin={4}
              />
              <Tooltip content={renderTooltip} cursor={{ className: 'trend-comparison__cursor' }} />
              <Bar
                dataKey="me"
                name={names.me}
                className="trend-comparison__me"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
              <Bar
                dataKey="partner"
                name={names.partner}
                className="trend-comparison__partner"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
