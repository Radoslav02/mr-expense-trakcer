import { useEffect } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { startAuthListener } from '@/redux/auth/authThunks';

export const useAuthListener = (): void => {
  const dispatch = useAppDispatch();

  useEffect(() => dispatch(startAuthListener()), [dispatch]);
};
