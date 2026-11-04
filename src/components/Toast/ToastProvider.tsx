import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ToastContext, type ToastApi, type ToastMessage, type ToastTone } from './ToastContext';
import './Toast.css';

const TOAST_DURATION_MS = 4000;
const MAX_TOASTS = 3;

const TONE_ICON = {
  success: <CircleCheck className="text-positive" />,
  error: <CircleAlert className="text-danger" />,
  info: <Info className="text-ink-muted" />,
} as const;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-(MAX_TOASTS - 1)), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-region pointer-events-none fixed inset-x-0 z-50 flex flex-col items-center gap-2 px-4 sm:items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={cn(
              'toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-surface py-3 pl-4 pr-2 text-sm text-ink shadow-overlay',
            )}
          >
            <span className="toast__icon mt-0.5">{TONE_ICON[toast.tone]}</span>
            <p className="flex-1 py-px">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded-md p-1 text-ink-subtle hover:bg-sunken hover:text-ink"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
