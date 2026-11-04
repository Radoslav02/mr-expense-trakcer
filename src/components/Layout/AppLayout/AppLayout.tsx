import { Outlet } from 'react-router-dom';
import { useUserDataSync } from '@/hooks/useUserDataSync';
import { BottomNav } from '../BottomNav';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import './AppLayout.css';

export const AppLayout = () => {
  useUserDataSync();

  return (
    <div className="app-layout min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="app-layout__main lg:pl-[var(--sidebar-width)]">
        <Header />
        <main
          id="main"
          className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8"
        >
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
