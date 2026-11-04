import './ChartTooltip.css';

interface ChartTooltipProps {
  title: string;
  value: string;
  color?: string;
}

export const ChartTooltip = ({ title, value, color }: ChartTooltipProps) => (
  <div className="chart-tooltip rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-overlay">
    <p className="flex items-center gap-2 text-ink-subtle">
      {color && (
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {title}
    </p>
    <p className="tabular mt-0.5 font-semibold text-ink">{value}</p>
  </div>
);
