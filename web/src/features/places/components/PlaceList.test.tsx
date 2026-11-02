import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { Place } from '../../../services/placesService';
import PlaceList from './PlaceList';

afterEach(cleanup);

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
  it('mostra foto, categoria, bairro e horário de cada lugar', () => {
    render(<PlaceList places={places} />);

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
    render(<PlaceList places={places} />);

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
    render(<PlaceList places={[]} />);

    expect(
      screen.getByText('Nenhum ponto turístico encontrado'),
    ).toBeInTheDocument();
  });
});
