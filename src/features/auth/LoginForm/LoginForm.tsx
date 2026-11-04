import { useState, type FormEvent } from 'react';
import { InlineError } from '@/components/InlineError';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { EMAIL_PATTERN, useAuthForm } from '@/hooks/useAuthForm';
import { loginWithEmail } from '@/redux/auth/authThunks';
import { AuthDivider } from '../AuthDivider';
import { GoogleButton } from '../GoogleButton';
import './LoginForm.css';

interface LoginErrors {
  email?: string;
  password?: string;
}

const validate = (email: string, password: string): LoginErrors => ({
  ...(!EMAIL_PATTERN.test(email.trim()) && { email: 'Enter a valid email address.' }),
  ...(!password && { password: 'Enter your password.' }),
});

export const LoginForm = () => {
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
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
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
          Sign in
        </Button>
      </form>
    </div>
  );
};
