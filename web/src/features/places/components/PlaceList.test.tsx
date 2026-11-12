import { cleanup, render, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import type { Place } from '../../../services/placesService';
import PlaceList from './PlaceList';

afterEach(cleanup);

// O card tem um link para os detalhes, que precisa de um roteador.
function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const places: Place[] = [
  {
    id: '1',
    name: 'Museu do Amanhã',
    categories: ['MUSEUM'],
    neighborhood: 'Centro',
    photo: {
      url: 'https://exemplo.com/museu.jpg',
      altText: 'Fachada do museu',
    },
    openingHours: [],
  },
  {
    id: '2',
    name: 'Aprazível',
    categories: ['RESTAURANT', 'CAFE'],
    neighborhood: null,
    photo: null,
    openingHours: [],
  },
];

describe('PlaceList', () => {
  it('leva aos detalhes do lugar ao clicar no card', () => {
    renderWithRouter(<PlaceList places={places} />);

    expect(
      screen.getByRole('link', { name: 'Museu do Amanhã' }),
    ).toHaveAttribute('href', '/locais/1');
  });

  it('mostra foto, categoria, bairro e horário de cada lugar', () => {
    renderWithRouter(<PlaceList places={places} />);

    const card = screen
      .getByRole('heading', { name: 'Museu do Amanhã' })
      .closest('article')!;
    expect(within(card).getByRole('img')).toHaveAttribute(
      'src',
      'https://exemplo.com/museu.jpg',
    );
    expect(within(card).getByRole('img')).toHaveAccessibleName(
      'Fachada do museu',
    );
    expect(within(card).getByText('Museu')).toBeInTheDocument();
    expect(within(card).getByText('Centro')).toBeInTheDocument();
    expect(within(card).getByText('Horário não informado')).toBeInTheDocument();
  });

  it('usa alternativas quando faltam foto e bairro', () => {
    renderWithRouter(<PlaceList places={places} />);

    const card = screen
      .getByRole('heading', { name: 'Aprazível' })
      .closest('article')!;
    expect(within(card).queryByRole('img')).not.toBeInTheDocument();
    expect(within(card).getByText('Sem foto')).toBeInTheDocument();
    expect(within(card).getByText('Restaurante')).toBeInTheDocument();
    expect(within(card).getByText('Café')).toBeInTheDocument();
    expect(within(card).getByText('Não informado')).toBeInTheDocument();
  });

  it('mostra aviso quando não há lugares', () => {
    renderWithRouter(<PlaceList places={[]} />);

    expect(
      screen.getByText('Nenhum ponto turístico encontrado'),
    ).toBeInTheDocument();
  });
});
