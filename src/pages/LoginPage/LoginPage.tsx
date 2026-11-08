import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/i18n';
import { AuthShell } from '@/features/auth/AuthShell';
import { LoginForm } from '@/features/auth/LoginForm';
import './LoginPage.css';

export const LoginPage = () => {
  const { t } = useI18n();

  return (
    <AuthShell
      title={t.auth.login.title}
      subtitle={t.auth.login.subtitle}
      footer={
        <>
          {t.auth.login.newHere} <Link to={ROUTES.register}>{t.auth.login.createAccountLink}</Link>
        </>
      }
    >
      <div className="login-page">
        <LoginForm />
      </div>
    </AuthShell>
  );
};
