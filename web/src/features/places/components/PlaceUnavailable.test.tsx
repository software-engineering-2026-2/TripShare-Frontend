import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import PlaceUnavailable from './PlaceUnavailable';

afterEach(cleanup);

describe('PlaceUnavailable', () => {
  it('informa que o local foi removido do catálogo', () => {
    render(<PlaceUnavailable />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Local indisponível' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/removido do catálogo/)).toBeInTheDocument();
    expect(
      screen.queryByText('Atividade salva no seu roteiro'),
    ).not.toBeInTheDocument();
  });

  it('preserva nome e observações da atividade salva como dados não verificados', () => {
    render(
      <PlaceUnavailable
        savedActivity={{ name: 'Almoço no Aprazível', notes: 'Reservar mesa' }}
      />,
    );

    expect(screen.getByText('Almoço no Aprazível')).toBeInTheDocument();
    expect(screen.getByText('Reservar mesa')).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('Dados não verificados');
  });

  it('mostra "Sem observações" quando a atividade não tem observações', () => {
    render(
      <PlaceUnavailable savedActivity={{ name: 'Passeio', notes: null }} />,
    );

    expect(screen.getByText('Sem observações')).toBeInTheDocument();
  });
});
