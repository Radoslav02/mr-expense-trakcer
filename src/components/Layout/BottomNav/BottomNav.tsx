import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/constants/navigation';
import { useI18n } from '@/i18n';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import './BottomNav.css';

export const BottomNav = () => {
  const { t } = useI18n();

  return (
    <nav
      aria-label={t.nav.main}
      className="bottom-nav safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => (
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
              {t.nav[labelKey]}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
