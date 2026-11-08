import { useState, type FormEvent } from 'react';
import { InlineError } from '@/components/InlineError';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { EMAIL_PATTERN, useAuthForm } from '@/hooks/useAuthForm';
import { getMessages, useI18n } from '@/i18n';
import { loginWithEmail } from '@/redux/auth/authThunks';
import { AuthDivider } from '../AuthDivider';
import { GoogleButton } from '../GoogleButton';
import './LoginForm.css';

interface LoginErrors {
  email?: string;
  password?: string;
}

const validate = (email: string, password: string): LoginErrors => {
  const v = getMessages().auth.validation;
  return {
    ...(!EMAIL_PATTERN.test(email.trim()) && { email: v.emailInvalid }),
    ...(!password && { password: v.passwordRequired }),
  };
};

export const LoginForm = () => {
  const { t } = useI18n();
  const { dispatch, serverError, isBusy, pendingAction, setPendingAction, signInWithGoogle } =
    useAuthForm();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setPendingAction('email');
    void dispatch(loginWithEmail({ email: email.trim(), password }));
  };

  return (
    <div className="login-form">
      <GoogleButton
        onClick={signInWithGoogle}
        loading={pendingAction === 'google'}
        disabled={isBusy}
      />
      <AuthDivider />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {serverError && <InlineError message={serverError} />}
        <Input
          label={t.auth.email}
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <Input
          label={t.auth.password}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <Button
          type="submit"
          fullWidth
          loading={pendingAction === 'email'}
          disabled={isBusy}
          className="mt-2"
        >
          {t.auth.signIn}
        </Button>
      </form>
    </div>
  );
};
