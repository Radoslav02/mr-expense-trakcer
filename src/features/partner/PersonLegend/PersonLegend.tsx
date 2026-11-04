import { useAppSelector } from '@/app/hooks';
import { selectPersonNames } from '@/redux/partner/partnerSelectors';
import './PersonLegend.css';

export const PersonLegend = () => {
  const names = useAppSelector(selectPersonNames);

  return (
    <div className="person-legend flex items-center gap-3 text-xs text-ink-subtle">
      <span className="flex items-center gap-1.5">
        <span aria-hidden="true" className="person-legend__swatch bg-accent" />
        {names.me}
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden="true" className="person-legend__swatch bg-partner" />
        {names.partner}
      </span>
    </div>
  );
};
