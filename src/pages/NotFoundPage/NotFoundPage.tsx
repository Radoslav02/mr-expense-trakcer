import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import './NotFoundPage.css';

export const NotFoundPage = () => (
  <main className="not-found-page flex min-h-dvh flex-col items-center justify-center px-6 text-center">
    <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-sunken text-ink-muted">
      <Compass aria-hidden="true" className="h-5 w-5" />
    </span>
    <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">This page doesn’t exist</h1>
    <p className="mt-2 max-w-sm text-sm text-ink-subtle">
      The link may be old, or the address has a typo.
    </p>
    <Link
      to={ROUTES.dashboard}
      className="btn mt-6 inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink hover:bg-accent-hover"
    >
      Back to overview
    </Link>
  </main>
);
