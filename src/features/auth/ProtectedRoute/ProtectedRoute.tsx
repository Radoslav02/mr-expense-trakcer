import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { Loader } from '@/components/Loader';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/i18n';
import { selectAuthInitialized, selectIsAuthenticated } from '@/redux/auth/authSelectors';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  children: ReactNode;
  mode?: 'private' | 'guest';
}

export interface RedirectState {
  from?: string;
}

export const ProtectedRoute = ({ children, mode = 'private' }: ProtectedRouteProps) => {
  const { t } = useI18n();
  const initialized = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!initialized) return <Loader fullScreen label={t.auth.checkingSession} />;

  if (mode === 'private' && !isAuthenticated) {
    const state: RedirectState = { from: location.pathname };
    return <Navigate to={ROUTES.login} replace state={state} />;
  }

  if (mode === 'guest' && isAuthenticated) {
    const from = (location.state as RedirectState | null)?.from;
    return <Navigate to={from ?? ROUTES.dashboard} replace />;
  }

  return <div className="protected-route contents">{children}</div>;
};
