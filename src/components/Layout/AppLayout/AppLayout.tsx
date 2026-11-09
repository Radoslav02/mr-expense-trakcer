import { Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { useBudgetAlerts } from '@/hooks/useBudgetAlerts';
import { useUserDataSync } from '@/hooks/useUserDataSync';
import { selectCurrency } from '@/redux/settings/settingsSelectors';
import { useI18n } from '@/i18n';
import { BottomNav } from '../BottomNav';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import './AppLayout.css';

export const AppLayout = () => {
  const { t } = useI18n();
  useUserDataSync();
  useBudgetAlerts(useAppSelector(selectCurrency));

  return (
    <div className="app-layout min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        {t.common.skipToContent}
      </a>
      <Sidebar />
      <div className="app-layout__main lg:pl-[var(--sidebar-width)]">
        <Header />
        <main
          id="main"
          className="mx-auto max-w-6xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8"
        >
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
