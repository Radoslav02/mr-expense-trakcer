import { ToastProvider } from '@/components/Toast';
import { useAuthListener } from '@/hooks/useAuthListener';
import { useThemeSync } from '@/hooks/useTheme';
import { I18nRoot } from '@/i18n/I18nRoot';
import { AppRouter } from '@/router/AppRouter';

export const App = () => {
  useAuthListener();
  useThemeSync();

  return (
    <ToastProvider>
      <I18nRoot>
        <AppRouter />
      </I18nRoot>
    </ToastProvider>
  );
};
