import { Link } from 'react-router-dom';
import { APP_NAME, APP_SHORT_NAME } from '@/constants/settings';
import { ROUTES } from '@/constants/routes';
import './Brand.css';

export const Brand = () => (
  <Link
    to={ROUTES.dashboard}
    aria-label={`${APP_NAME}, go to overview`}
    className="brand inline-flex items-center gap-2 rounded-md text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink"
  >
    <span
      aria-hidden="true"
      className="brand__mark flex h-7 items-center justify-center rounded-lg bg-accent px-1.5 text-[0.75rem] font-bold text-accent-ink"
    >
      {APP_SHORT_NAME}
    </span>
    <span aria-hidden="true">Expense Tracker</span>
  </Link>
);
