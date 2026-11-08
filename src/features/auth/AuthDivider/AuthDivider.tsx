import { useI18n } from '@/i18n';
import './AuthDivider.css';

export const AuthDivider = () => {
  const { t } = useI18n();

  return (
    <div
      className="auth-divider my-6 flex items-center gap-3 text-xs text-ink-subtle"
      role="separator"
    >
      <span className="h-px flex-1 bg-line" />
      {t.auth.orWithEmail}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
};
