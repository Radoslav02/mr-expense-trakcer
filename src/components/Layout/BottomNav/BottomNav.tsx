import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import './BottomNav.css';

export const BottomNav = () => (
  <nav
    aria-label="Main"
    className="bottom-nav safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 lg:hidden"
  >
    <ul className="mx-auto grid max-w-md grid-cols-5">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={to === ROUTES.dashboard}
            className={({ isActive }) =>
              cn(
                'bottom-nav__link flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium',
                isActive ? 'text-accent' : 'text-ink-subtle',
              )
            }
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);
