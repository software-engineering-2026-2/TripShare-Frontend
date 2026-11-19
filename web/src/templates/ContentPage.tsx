import type { ReactNode } from 'react';
import AppHeader from './AppHeader';

export function ContentPage({
  className = '',
  children,
  wide = false,
}: {
  className?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`content-page ${className}`}>
      <a className="skip-link" href="#page-content">
        Pular para o conteúdo
      </a>
      <AppHeader />
      <main
        id="page-content"
        tabIndex={-1}
        className={`content-page__inner${wide ? ' content-page__inner--wide' : ''}`}
      >
        {children}
      </main>
      <footer className="app-footer">
        <span>tripshare.</span>
        <p>Seu próximo destino começa aqui.</p>
      </footer>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="page-heading__action">{action}</div>}
    </header>
  );
}
