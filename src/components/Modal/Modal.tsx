import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/Button';
import { cn } from '@/utils/cn';
import './Modal.css';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  footer?: ReactNode;
  size?: 'sm' | 'md';
  dismissible?: boolean;
  children: ReactNode;
}

/** Phones and tablets: focusing a field opens the on-screen keyboard, so don't do it uninvited. */
const prefersNoAutoFocus = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

const FOCUSABLE =
  'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export const Modal = ({
  open,
  title,
  description,
  onClose,
  footer,
  size = 'md',
  dismissible = true,
  children,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialog.showModal();
    if (prefersNoAutoFocus()) {
      // Keep focus inside the dialog for screen readers without summoning the keyboard.
      dialog.focus({ preventScroll: true });
    } else {
      bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }

    return () => {
      if (dialog.open) dialog.close();
      previouslyFocused?.focus();
    };
  }, [open]);

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (dismissible) onClose();
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (dismissible && event.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      tabIndex={-1}
      className={cn(
        'modal m-auto w-[calc(100%-2rem)] rounded-2xl border border-line bg-surface p-0 text-ink shadow-overlay',
        size === 'sm' ? 'max-w-sm' : 'max-w-lg',
      )}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col sm:max-h-[calc(100dvh-4rem)]">
          <header className="flex items-start justify-between gap-4 px-5 pb-2 pt-5 sm:px-6">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-ink-subtle">
                  {description}
                </p>
              )}
            </div>
            {dismissible && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                icon={<X />}
                onClick={onClose}
                className="-mr-2"
              >
                Close dialog
              </Button>
            )}
          </header>
          <div
            ref={bodyRef}
            className="min-h-0 overflow-y-auto overscroll-contain px-5 py-3 sm:px-6"
          >
            {children}
          </div>
          {footer && (
            <footer className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              {footer}
            </footer>
          )}
        </div>
      )}
    </dialog>
  );
};
