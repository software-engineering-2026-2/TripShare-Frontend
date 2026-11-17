import type { ReactNode } from 'react';
import Brand from '../components/brand/Brand';
import JourneyArt from '../components/journey-art/JourneyArt';

export default function AuthLayout({
  children,
  labelledBy,
  wide = false,
}: {
  children: ReactNode;
  labelledBy: string;
  wide?: boolean;
}) {
  return (
    <div className={`auth-page${wide ? ' auth-page--register' : ''}`}>
      <a className="skip-link" href="#auth-content">
        Pular para o formulário
      </a>
      <aside className="auth-page__rail" aria-label="TripShare">
        <Brand />
        <div className="auth-story">
          <p className="auth-story__title">
            A viagem começa <br />
            na sua imaginação.
          </p>
          <p className="auth-story__text">
            Escolha o destino. Encontre seus lugares. Dê forma à sua próxima
            viagem.
          </p>
          <div className="auth-story__art">
            <JourneyArt />
            <span className="auth-story__stamp">Vamos nessa?</span>
          </div>
        </div>
        <p className="auth-page__note">Um lugar para todos os seus planos.</p>
      </aside>
      <main
        id="auth-content"
        tabIndex={-1}
        className={`auth-page__panel${wide ? ' auth-page__panel--wide' : ''}`}
        aria-labelledby={labelledBy}
      >
        {children}
      </main>
    </div>
  );
}
