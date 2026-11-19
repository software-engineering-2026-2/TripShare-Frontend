import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  children: ReactNode;
  titleId: string;
  descriptionId?: string;
  role?: 'dialog' | 'alertdialog';
  allowClose?: boolean;
  onClose: () => void;
}

export default function Modal({
  children,
  titleId,
  descriptionId,
  role = 'dialog',
  allowClose = true,
  onClose,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const active = document.activeElement;
    dialog.showModal();
    dialog.querySelector<HTMLElement>('[data-initial-focus]')?.focus();
    return () => {
      dialog.close();
      if (active instanceof HTMLElement && active.isConnected) active.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      role={role}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="modal card-surface"
      onCancel={(event) => {
        event.preventDefault();
        if (allowClose) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
