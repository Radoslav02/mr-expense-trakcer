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
    const firstField = bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    firstField?.focus();

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
      className={cn(
        'modal m-auto w-[calc(100%-2rem)] rounded-2xl border border-line bg-surface p-0 text-ink shadow-overlay',
        size === 'sm' ? 'max-w-sm' : 'max-w-lg',
      )}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <header className="flex items-start justify-between gap-4 px-6 pb-2 pt-5">
            <div>
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
          <div ref={bodyRef} className="overflow-y-auto px-6 py-3">
            {children}
          </div>
          {footer && (
            <footer className="flex flex-col-reverse gap-2 border-t border-line px-6 py-4 sm:flex-row sm:justify-end">
              {footer}
            </footer>
          )}
        </div>
      )}
    </dialog>
  );
};
