import { useContext } from 'react';
import { ToastContext, type ToastApi } from '@/components/Toast';

export const useToast = (): ToastApi => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>.');
  return context;
};
