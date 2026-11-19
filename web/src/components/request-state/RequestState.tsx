import type { ReactNode } from 'react';

export function LoadingState({ children }: { children: ReactNode }) {
  return (
    <div className="request-state" role="status">
      <span className="request-state__spinner" aria-hidden="true" />
      {children}
    </div>
  );
}

export function ErrorState({
  children,
  onRetry,
}: {
  children: ReactNode;
  onRetry?: () => void;
}) {
  return (
    <div className="request-state request-state--error" role="alert">
      <div>{children}</div>
      {onRetry && (
        <button
          className="form-button button-secondary"
          type="button"
          onClick={onRetry}
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
