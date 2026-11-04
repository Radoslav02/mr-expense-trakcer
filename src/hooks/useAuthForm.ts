import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectAuthError, selectAuthStatus } from '@/redux/auth/authSelectors';
import { authErrorCleared } from '@/redux/auth/authSlice';
import { loginWithGoogle } from '@/redux/auth/authThunks';

export type AuthAction = 'email' | 'google' | null;

export const useAuthForm = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const serverError = useAppSelector(selectAuthError);
  const [pendingAction, setPendingAction] = useState<AuthAction>(null);

  useEffect(() => {
    dispatch(authErrorCleared());
  }, [dispatch]);

  useEffect(() => {
    if (status !== 'loading') setPendingAction(null);
  }, [status]);

  const signInWithGoogle = () => {
    setPendingAction('google');
    void dispatch(loginWithGoogle());
  };

  return {
    dispatch,
    serverError,
    isBusy: status === 'loading',
    pendingAction,
    setPendingAction,
    signInWithGoogle,
  };
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;
