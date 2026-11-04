import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AuthShell } from '@/features/auth/AuthShell';
import { LoginForm } from '@/features/auth/LoginForm';
import './LoginPage.css';

export const LoginPage = () => (
  <AuthShell
    title="Welcome back"
    subtitle="Sign in to see where your money went this month."
    footer={
      <>
        New here? <Link to={ROUTES.register}>Create an account</Link>
      </>
    }
  >
    <div className="login-page">
      <LoginForm />
    </div>
  </AuthShell>
);
