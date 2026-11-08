import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useI18n } from '@/i18n';
import { AuthShell } from '@/features/auth/AuthShell';
import { RegisterForm } from '@/features/auth/RegisterForm';
import './RegisterPage.css';

export const RegisterPage = () => {
  const { t } = useI18n();

  return (
    <AuthShell
      title={t.auth.register.title}
      subtitle={t.auth.register.subtitle}
      footer={
        <>
          {t.auth.register.haveAccount} <Link to={ROUTES.login}>{t.auth.register.signInLink}</Link>
        </>
      }
    >
      <div className="register-page">
        <RegisterForm />
      </div>
    </AuthShell>
  );
};
