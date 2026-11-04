import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { Brand } from '../Brand';
import './Sidebar.css';

export const Sidebar = () => (
  <aside className="sidebar fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-width)] flex-col border-r border-line bg-sunken px-3 py-5 lg:flex">
    <div className="px-3">
      <Brand />
    </div>
    <nav aria-label="Main" className="mt-8">
      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === ROUTES.dashboard}
              className={({ isActive }) =>
                cn(
                  'sidebar__link flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium',
                  isActive
                    ? 'bg-surface text-ink shadow-card'
                    : 'text-ink-muted hover:bg-surface/60 hover:text-ink',
                )
              }
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  </aside>
);
