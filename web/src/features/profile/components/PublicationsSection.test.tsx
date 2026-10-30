import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PublicationsSection from './PublicationsSection';

describe('PublicationsSection', () => {
  it('lista as publicações quando disponíveis', () => {
    render(
      <PublicationsSection
        publications={[
          {
            id: '1',
            title: 'Roteiro no Nordeste',
            summary: 'Sete dias de viagem',
          },
        ]}
      />,
    );

    expect(screen.getByText('Roteiro no Nordeste')).toBeInTheDocument();
    expect(screen.getByText('Sete dias de viagem')).toBeInTheDocument();
  });

  it('mostra o estado vazio quando não há publicações', () => {
    render(<PublicationsSection publications={[]} />);

    expect(
      screen.getByText('Este usuário ainda não possui publicações.'),
    ).toBeInTheDocument();
  });
});
