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
  const trend = useAppSelector((state) => selectMonthlyTrend(state, month));
  const { format, formatCompact } = useCurrencyFormatter();

  const renderTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    const item = payload?.[0]?.payload as MonthTotal | undefined;
    if (!active || !item) return null;
    return <ChartTooltip title={formatMonthLabel(item.month)} value={format(item.total)} />;
  };

  return (
    <Card
      title="Last 6 months"
      description={`Monthly totals up to ${formatMonthLabel(month)}`}
      className="monthly-bar-chart"
    >
      {loading ? (
        <div className="flex h-56 items-end gap-4 px-2 pb-6">
          {SKELETON_HEIGHTS.slice(0, MONTHS_IN_TREND).map((height, index) => (
            <Skeleton key={index} className={`flex-1 rounded-b-none rounded-t-md ${height}`} />
          ))}
        </div>
      ) : (
        <div
          className="h-56"
          role="img"
          aria-label={`Bar chart of totals for the last ${MONTHS_IN_TREND} months`}
        >
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
                tickFormatter={formatCompact}
                axisLine={false}
                tickLine={false}
                width={56}
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
