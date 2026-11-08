import { formatAxisAmount } from '@/utils/currency';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { selectMonthlyTrend } from '@/redux/expenses/expensesSelectors';
import { formatMonthLabel, formatShortMonth } from '@/utils/dates';
import type { MonthTotal } from '@/utils/expenses';
import { ChartTooltip } from '../ChartTooltip';
import './MonthlyBarChart.css';

interface MonthlyBarChartProps {
  month: string;
  loading: boolean;
}

const SKELETON_HEIGHTS = ['h-16', 'h-28', 'h-20', 'h-36', 'h-24', 'h-32'];

export const MonthlyBarChart = ({ month, loading }: MonthlyBarChartProps) => {
  const { t } = useI18n();
  const trend = useAppSelector((state) => selectMonthlyTrend(state, month));
  const { format } = useCurrencyFormatter();

  const renderTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    const item = payload?.[0]?.payload as MonthTotal | undefined;
    if (!active || !item) return null;
    return <ChartTooltip title={formatMonthLabel(item.month)} value={format(item.total)} />;
  };

  return (
    <Card
      title={t.dashboard.trend.title(MONTHS_IN_TREND)}
      description={t.dashboard.trend.description(formatMonthLabel(month))}
      className="monthly-bar-chart"
    >
      {loading ? (
        <div className="flex h-56 items-end gap-4 px-2 pb-6">
          {SKELETON_HEIGHTS.slice(0, MONTHS_IN_TREND).map((height, index) => (
            <Skeleton key={index} className={`flex-1 rounded-b-none rounded-t-md ${height}`} />
          ))}
        </div>
      ) : (
        <div className="h-56" role="img" aria-label={t.dashboard.trend.chartLabel(MONTHS_IN_TREND)}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trend}
              margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
              barCategoryGap="28%"
            >
              <CartesianGrid vertical={false} className="monthly-bar-chart__grid" />
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
              <Tooltip
                content={renderTooltip}
                cursor={{ className: 'monthly-bar-chart__cursor' }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                {trend.map((item) => (
                  <Cell
                    key={item.month}
                    className={
                      item.month === month
                        ? 'monthly-bar-chart__bar is-active'
                        : 'monthly-bar-chart__bar'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
