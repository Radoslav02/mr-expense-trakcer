import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/Button';
import { InlineError } from '@/components/InlineError';
import { Input } from '@/components/Input';
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH, useAuthForm } from '@/hooks/useAuthForm';
import { registerUser } from '@/redux/auth/authThunks';
import type { RegistrationData } from '@/types/user';
import { AuthDivider } from '../AuthDivider';
import { GoogleButton } from '../GoogleButton';
import './RegisterForm.css';

type RegisterErrors = Partial<Record<keyof RegistrationData, string>>;

const validate = ({ displayName, email, password }: RegistrationData): RegisterErrors => ({
  ...(!displayName.trim() && { displayName: 'Tell us what to call you.' }),
  ...(!EMAIL_PATTERN.test(email.trim()) && { email: 'Enter a valid email address.' }),
  ...(password.length < MIN_PASSWORD_LENGTH && {
    password: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
  }),
});

export const RegisterForm = () => {
  const { dispatch, serverError, isBusy, pendingAction, setPendingAction, signInWithGoogle } =
    useAuthForm();
  const [values, setValues] = useState<RegistrationData>({
    displayName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<RegisterErrors>({});

  const update = (key: keyof RegistrationData) => (event: ChangeEvent<HTMLInputElement>) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setPendingAction('email');
    void dispatch(
      registerUser({
        ...values,
        displayName: values.displayName.trim(),
        email: values.email.trim(),
      }),
    );
  };

  return (
    <div className="register-form">
      <GoogleButton
        onClick={signInWithGoogle}
        loading={pendingAction === 'google'}
        disabled={isBusy}
      />
      <AuthDivider />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {serverError && <InlineError message={serverError} />}
        <Input
          label="Name"
          autoComplete="name"
          value={values.displayName}
          onChange={update('displayName')}
          error={errors.displayName}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={values.email}
          onChange={update('email')}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={update('password')}
          error={errors.password}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        />
        <Button
          type="submit"
          fullWidth
          loading={pendingAction === 'email'}
          disabled={isBusy}
          className="mt-2"
        >
          Create account
        </Button>
      </form>
    </div>
  );
};
