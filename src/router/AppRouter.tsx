import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/Layout';
import { Loader } from '@/components/Loader';
import { ROUTES } from '@/constants/routes';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const ExpensesPage = lazy(() =>
  import('@/pages/ExpensesPage').then((module) => ({ default: module.ExpensesPage })),
);
const TogetherPage = lazy(() =>
  import('@/pages/TogetherPage').then((module) => ({ default: module.TogetherPage })),
);
const CategoriesPage = lazy(() =>
  import('@/pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then((module) => ({ default: module.RegisterPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

const withSuspense = (page: ReactNode, fullScreen = false) => (
  <Suspense fallback={<Loader fullScreen={fullScreen} />}>{page}</Suspense>
);

const guestOnly = (page: ReactNode) => (
  <ProtectedRoute mode="guest">{withSuspense(page, true)}</ProtectedRoute>
);

export const AppRouter = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes>
      <Route path={ROUTES.login} element={guestOnly(<LoginPage />)} />
      <Route path={ROUTES.register} element={guestOnly(<RegisterPage />)} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.dashboard} element={withSuspense(<DashboardPage />)} />
        <Route path={ROUTES.expenses} element={withSuspense(<ExpensesPage />)} />
        <Route path={ROUTES.together} element={withSuspense(<TogetherPage />)} />
        <Route path={ROUTES.categories} element={withSuspense(<CategoriesPage />)} />
        <Route path={ROUTES.settings} element={withSuspense(<SettingsPage />)} />
      </Route>
      <Route path="*" element={withSuspense(<NotFoundPage />, true)} />
    </Routes>
  </BrowserRouter>
);
