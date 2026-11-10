import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getTrip,
  getTripActivities,
  type TripActivity,
} from '../services/tripsService';
import TripDetailPage from './TripDetailPage';

vi.mock('../services/tripsService', () => ({
  getTrip: vi.fn(),
  getTripActivities: vi.fn(),
}));

const getTripMock = vi.mocked(getTrip);
const getTripActivitiesMock = vi.mocked(getTripActivities);

function activity(dayNumber: number, name: string, x: number): TripActivity {
  return {
    id: name,
    dayNumber,
    name,
    location: 'Centro',
    durationMinutes: 60,
    startsAt: null,
    mapPosition: { x, y: 0 },
  };
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/minhas-viagens/1']}>
        <Routes>
          <Route path="/minhas-viagens/:tripId" element={<TripDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(cleanup);

beforeEach(() => {
  getTripMock.mockResolvedValue({
    id: '1',
    title: 'Férias de verão',
    destination: {
      city: 'Rio de Janeiro',
      region: 'Rio de Janeiro',
      country: 'Brasil',
    },
    startDate: '2027-01-10',
    endDate: '2027-01-12',
  });
  getTripActivitiesMock.mockResolvedValue({
    lodging: { name: 'Hospedagem', mapPosition: { x: 0, y: 0 } },
    activities: [
      activity(1, 'Longe', 900),
      activity(1, 'Perto', 100),
      activity(2, 'Museu', 300),
    ],
  });
});

describe('TripDetailPage', () => {
  it('mostra os dados da viagem e um botão para cada dia', async () => {
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Férias de verão' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Rio de Janeiro, Rio de Janeiro, Brasil · 10/01/2027 – 12/01/2027 · 3 dias',
      ),
    ).toBeInTheDocument();

    const days = within(
      screen.getByRole('navigation', { name: 'Dias da viagem' }),
    );
    expect(days.getAllByRole('button')).toHaveLength(3);
    expect(days.getByRole('button', { name: 'Dia 1 · 10/01' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('lista os lugares do dia na melhor sequência', async () => {
    renderPage();

    const stops = await screen.findAllByRole('heading', { level: 4 });
    expect(stops.map((stop) => stop.textContent)).toEqual(['Perto', 'Longe']);
    expect(screen.getByRole('img', { name: /2 paradas/ })).toBeInTheDocument();
  });

  it('troca o roteiro ao escolher outro dia', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      await screen.findByRole('button', { name: 'Dia 2 · 11/01' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Roteiro do Dia 2 · 11/01' }),
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('heading', { level: 4 })
        .map((stop) => stop.textContent),
    ).toEqual(['Museu']);

    await user.click(screen.getByRole('button', { name: 'Dia 3 · 12/01' }));
    expect(
      screen.getByText('Nenhum lugar para visitar neste dia.'),
    ).toBeInTheDocument();
  });

  it('avisa quando a viagem ainda não tem lugares', async () => {
    getTripActivitiesMock.mockResolvedValue({
      lodging: { name: 'Hospedagem', mapPosition: { x: 0, y: 0 } },
      activities: [],
    });
    renderPage();

    expect(
      await screen.findByText('Esta viagem ainda não tem lugares para visitar'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('mostra erro quando não consegue carregar a viagem', async () => {
    getTripMock.mockRejectedValue(new Error('falha'));
    renderPage();

    expect(
      await screen.findByText('Não foi possível carregar a viagem.'),
    ).toBeInTheDocument();
  });
});
