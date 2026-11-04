import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AuthShell } from '@/features/auth/AuthShell';
import { RegisterForm } from '@/features/auth/RegisterForm';
import './RegisterPage.css';

export const RegisterPage = () => (
  <AuthShell
    title="Create your account"
    subtitle="We’ll set you up with eight starter categories you can change anytime."
    footer={
      <>
        Already have an account? <Link to={ROUTES.login}>Sign in</Link>
      </>
    }
  >
    <div className="register-page">
      <RegisterForm />
    </div>
  </AuthShell>
);
