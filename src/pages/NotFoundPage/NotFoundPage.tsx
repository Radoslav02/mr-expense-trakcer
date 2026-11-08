import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/i18n';
import './NotFoundPage.css';

export const NotFoundPage = () => {
  const { t } = useI18n();

  return (
    <main className="not-found-page flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-sunken text-ink-muted">
        <Compass aria-hidden="true" className="h-5 w-5" />
      </span>
      <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">
        {t.common.notFound.title}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink-subtle">{t.common.notFound.description}</p>
      <Link
        to={ROUTES.dashboard}
        className="btn mt-6 inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink hover:bg-accent-hover"
      >
        {t.common.notFound.backToOverview}
      </Link>
    </main>
  );
};
