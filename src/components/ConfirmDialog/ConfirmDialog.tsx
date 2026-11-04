import type { ReactNode } from 'react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Modal
    open={open}
    title={title}
    onClose={onCancel}
    size="sm"
    dismissible={!loading}
    footer={
      <>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <div className="confirm-dialog__message pb-2 text-sm text-ink-muted">{message}</div>
  </Modal>
);
