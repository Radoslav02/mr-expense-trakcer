import { useCallback, useSyncExternalStore } from 'react';
import {
  clearInstallPrompt,
  getInstallPrompt,
  subscribeToInstallPrompt,
} from '@/app/installPrompt';

export type InstallMode = 'installed' | 'prompt' | 'ios' | 'unsupported';

const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIos = (): boolean =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const useInstallApp = () => {
  const prompt = useSyncExternalStore(subscribeToInstallPrompt, getInstallPrompt);

  const mode: InstallMode = isStandalone()
    ? 'installed'
    : prompt
      ? 'prompt'
      : isIos()
        ? 'ios'
        : 'unsupported';

  const install = useCallback(async () => {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    clearInstallPrompt();
  }, [prompt]);

  return { mode, install };
};
