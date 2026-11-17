import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Place } from '../../../services/placesService';
import PlaceDetails from './PlaceDetails';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const completePlace: Place = {
  id: '1',
  name: 'Museu do Amanhã',
  categories: ['MUSEUM'],
  neighborhood: 'Centro',
  photo: null,
  openingHours: [
    { weekday: 2, opensAt: '10:00', closesAt: '18:00', closesNextDay: false },
  ],
  description: 'Museu de ciências.',
  coordinates: { latitude: -22.8944, longitude: -43.1795 },
  address: 'Praça Mauá, 1, Centro',
  estimatedDurationMinutes: 90,
  cost: 'R$ 30,00',
  source: 'OpenStreetMap',
};

const emptyPlace: Place = {
  id: '5',
  name: 'Praia de Ipanema',
  categories: ['BEACH'],
  neighborhood: null,
  photo: null,
  openingHours: [],
};

// Valor exibido ao lado de um rótulo da lista de informações.
function getInfo(label: string) {
  const row = screen.getByText(label, { selector: 'dt' }).parentElement!;
  return within(row).getByRole('definition');
}

describe('PlaceDetails', () => {
  it('mostra todas as informações do local', () => {
    render(<PlaceDetails place={completePlace} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Museu do Amanhã' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Museu')).toBeInTheDocument();
    expect(screen.getByText('Museu de ciências.')).toBeInTheDocument();
    expect(getInfo('Bairro')).toHaveTextContent('Centro');
    expect(getInfo('Endereço')).toHaveTextContent('Praça Mauá, 1, Centro');
    expect(getInfo('Coordenadas')).toHaveTextContent('-22.8944, -43.1795');
    expect(getInfo('Duração estimada da visita')).toHaveTextContent('1h30');
    expect(getInfo('Custos')).toHaveTextContent('R$ 30,00');
    expect(getInfo('Terça-feira')).toHaveTextContent('10:00 – 18:00');
    expect(getInfo('Segunda-feira')).toHaveTextContent('Fechado');
    expect(
      screen.getByText('Fonte das informações: OpenStreetMap'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('Mapa com a localização de Museu do Amanhã'),
    ).toBeInTheDocument();
  });

  it('mostra "Não informado" para os dados ausentes', () => {
    render(<PlaceDetails place={emptyPlace} />);

    for (const label of [
      'Bairro',
      'Endereço',
      'Coordenadas',
      'Duração estimada da visita',
      'Custos',
    ]) {
      expect(getInfo(label)).toHaveTextContent('Não informado');
    }
    // Descrição e horário de funcionamento também ficam como "Não informado".
    expect(screen.getAllByText('Não informado')).toHaveLength(7);
    expect(
      screen.getByText('Fonte das informações: Não informado'),
    ).toBeInTheDocument();
  });

  it('não trata horário desconhecido como local fechado', () => {
    render(<PlaceDetails place={emptyPlace} />);

    expect(screen.queryByText('Fechado')).not.toBeInTheDocument();
  });

  it('mantém o aviso de que horários e preços podem mudar', () => {
    render(<PlaceDetails place={emptyPlace} />);

    expect(
      screen.getByText(/Horários e preços podem mudar/),
    ).toBeInTheDocument();
  });

  it('avisa que não há mapa quando o local não tem coordenadas', () => {
    render(<PlaceDetails place={emptyPlace} />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Mapa indisponível: o local não tem coordenadas informadas.',
    );
    expect(
      screen.queryByTitle(/Mapa com a localização/),
    ).not.toBeInTheDocument();
  });

  it('mantém os detalhes em texto quando o navegador está sem conexão', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    render(<PlaceDetails place={completePlace} />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Não foi possível carregar o mapa.',
    );
    expect(
      screen.queryByTitle(/Mapa com a localização/),
    ).not.toBeInTheDocument();
    expect(getInfo('Endereço')).toHaveTextContent('Praça Mauá, 1, Centro');
  });
});
