import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/Button';
import { currentMonthKey, formatMonthLabel, shiftMonth } from '@/utils/dates';
import './MonthPicker.css';

interface MonthPickerProps {
  value: string;
  onChange: (month: string) => void;
  allowFuture?: boolean;
}

export const MonthPicker = ({ value, onChange, allowFuture = false }: MonthPickerProps) => {
  const isCurrent = value >= currentMonthKey();

  return (
    <div
      role="group"
      aria-label="Month"
      className="month-picker inline-flex h-10 items-center rounded-lg border border-line bg-surface"
    >
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        icon={<ChevronLeft />}
        onClick={() => onChange(shiftMonth(value, -1))}
        className="ml-1"
      >
        Previous month
      </Button>
      <span
        aria-live="polite"
        className="tabular min-w-[8.5rem] px-2 text-center text-sm font-medium text-ink"
      >
        {formatMonthLabel(value)}
      </span>
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        icon={<ChevronRight />}
        onClick={() => onChange(shiftMonth(value, 1))}
        disabled={!allowFuture && isCurrent}
        className="mr-1"
      >
        Next month
      </Button>
    </div>
  );
};
