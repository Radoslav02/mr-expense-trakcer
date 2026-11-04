import { ToastProvider } from '@/components/Toast';
import { useAuthListener } from '@/hooks/useAuthListener';
import { useThemeSync } from '@/hooks/useTheme';
import { AppRouter } from '@/router/AppRouter';

export const App = () => {
  useAuthListener();
  useThemeSync();

  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
};
