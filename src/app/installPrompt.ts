export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Listener = () => void;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<Listener>();
const notify = () => listeners.forEach((listener) => listener());

/** Chrome fires this once, early; capture it before React mounts so the Install button can use it later. */
export const captureInstallPrompt = (): void => {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
};

export const getInstallPrompt = (): BeforeInstallPromptEvent | null => deferredPrompt;

export const clearInstallPrompt = (): void => {
  deferredPrompt = null;
  notify();
};

export const subscribeToInstallPrompt = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
