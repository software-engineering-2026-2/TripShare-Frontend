import type { ComponentPropsWithoutRef, ReactNode } from 'react';

interface ActionButtonProps extends ComponentPropsWithoutRef<'button'> {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
}

export default function ActionButton({
  pending,
  pendingLabel,
  children,
  disabled,
  ...button
}: ActionButtonProps) {
  return (
    <button {...button} disabled={disabled || pending} aria-busy={pending}>
      {pending && (
        <span className="request-state__spinner" aria-hidden="true" />
      )}
      {pending ? pendingLabel : children}
    </button>
  );
}
