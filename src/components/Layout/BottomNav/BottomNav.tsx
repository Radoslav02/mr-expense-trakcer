import { NavLink } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { MOBILE_TABS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/i18n';
import { selectLinkStatus } from '@/redux/partner/partnerSelectors';
import { cn } from '@/utils/cn';
import './BottomNav.css';

export const BottomNav = () => {
  const { t } = useI18n();
  const hasPartner = useAppSelector(selectLinkStatus) !== 'none';
  const tabs = MOBILE_TABS.filter((tab) => !tab.needsPartner || hasPartner);

  return (
    <nav
      aria-label={t.nav.main}
      className="bottom-nav safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 lg:hidden"
    >
      <ul
        className="mx-auto grid max-w-md"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map(({ to, labelKey, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === ROUTES.dashboard}
              className={({ isActive }) =>
                cn(
                  'bottom-nav__link flex h-16 min-w-0 flex-col items-center justify-center gap-1 px-1 text-[0.6875rem] font-medium',
                  isActive ? 'text-accent' : 'text-ink-subtle',
                )
              }
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
              <span className="max-w-full truncate">{t.nav[labelKey]}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
