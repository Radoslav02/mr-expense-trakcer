import './AuthDivider.css';

export const AuthDivider = () => (
  <div
    className="auth-divider my-6 flex items-center gap-3 text-xs text-ink-subtle"
    role="separator"
  >
    <span className="h-px flex-1 bg-line" />
    or with email
    <span className="h-px flex-1 bg-line" />
  </div>
);
