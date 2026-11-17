import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPlaces, type PlacesPage } from '../services/placesService';
import TouristSpotsPage from './TouristSpotsPage';

vi.mock('../services/placesService', () => ({
  getPlaces: vi.fn(),
}));

const getPlacesMock = vi.mocked(getPlaces);

function makePage(
  page: number,
  totalPages: number,
  name: string,
): PlacesPage {
  return {
    content: [
      {
        id: `place-${page}`,
        name,
        categories: ['MUSEUM'],
        neighborhood: 'Centro',
        photo: null,
        openingHours: [],
      },
    ],
    page,
    size: 20,
    totalElements: totalPages,
    totalPages,
    last: page >= totalPages - 1,
  };
}

function renderPage(initialEntry = '/minhas-viagens/trip-1/explorar') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/pontos-turisticos" element={<TouristSpotsPage />} />
          <Route
            path="/minhas-viagens/:tripId/explorar"
            element={<TouristSpotsPage />}
          />
          <Route path="/minhas-viagens" element={<p>Minhas viagens</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TouristSpotsPage', () => {
  it('solicita selecionar ou criar uma viagem quando não há tripId', () => {
    renderPage('/pontos-turisticos');

    expect(
      screen.getByText(/Selecione ou crie uma viagem para explorar/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ir para Minhas viagens' }),
    ).toHaveAttribute('href', '/minhas-viagens');
    expect(getPlacesMock).not.toHaveBeenCalled();
  });

  it('carrega locais paginados da viagem e permite avançar e voltar páginas', async () => {
    getPlacesMock
      .mockResolvedValueOnce(makePage(0, 2, 'Museu do Amanhã'))
      .mockResolvedValueOnce(makePage(1, 2, 'Cristo Redentor'));
    const user = userEvent.setup();

    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Museu do Amanhã' }),
    ).toBeInTheDocument();
    expect(getPlacesMock).toHaveBeenCalledWith('trip-1', 0, 20);
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Próxima' }));

    expect(
      await screen.findByRole('heading', { name: 'Cristo Redentor' }),
    ).toBeInTheDocument();
    expect(getPlacesMock).toHaveBeenCalledWith('trip-1', 1, 20);
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Anterior' }));

    expect(
      await screen.findByRole('heading', { name: 'Museu do Amanhã' }),
    ).toBeInTheDocument();
  });

  it('exibe erro e permite tentar novamente quando a API falha', async () => {
    getPlacesMock
      .mockRejectedValueOnce(new Error('falha'))
      .mockResolvedValueOnce(makePage(0, 1, 'Parque Lage'));
    const user = userEvent.setup();

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os pontos turísticos.',
    );

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(
      await screen.findByRole('heading', { name: 'Parque Lage' }),
    ).toBeInTheDocument();
  });
});
