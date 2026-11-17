import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../services/api';
import { getPlace, type Place } from '../services/placesService';
import PlaceDetailsPage from './PlaceDetailsPage';

vi.mock('../services/placesService', () => ({
  getPlace: vi.fn(),
}));

const getPlaceMock = vi.mocked(getPlace);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const place: Place = {
  id: '1',
  name: 'Cristo Redentor',
  categories: ['LANDMARK'],
  neighborhood: 'Cosme Velho',
  photo: null,
  openingHours: [],
};

function renderPage(state?: unknown) {
  // Sem espera entre as novas tentativas, para o teste não demorar.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[{ pathname: '/locais/1', state }]}>
        <Routes>
          <Route path="/locais/:placeId" element={<PlaceDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PlaceDetailsPage', () => {
  it('busca o local pelo id da rota e mostra os detalhes', async () => {
    getPlaceMock.mockResolvedValue(place);

    renderPage();

    expect(screen.getByText('Carregando local...')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Cristo Redentor' }),
    ).toBeInTheDocument();
    expect(getPlaceMock).toHaveBeenCalledWith('1');
  });

  it('informa local removido do catálogo sem oferecer nova tentativa', async () => {
    getPlaceMock.mockRejectedValue(new ApiError(404, null));

    renderPage({
      savedActivity: { name: 'Visita ao Cristo', notes: 'Ir cedo' },
    });

    expect(
      await screen.findByRole('heading', { name: 'Local indisponível' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Visita ao Cristo')).toBeInTheDocument();
    expect(screen.getByText('Ir cedo')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Tentar novamente' }),
    ).not.toBeInTheDocument();
    expect(getPlaceMock).toHaveBeenCalledTimes(1);
  });

  it('também trata 410 como local removido', async () => {
    getPlaceMock.mockRejectedValue(new ApiError(410, null));

    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Local indisponível' }),
    ).toBeInTheDocument();
  });

  it('permite tentar de novo quando a falha não é de local removido', async () => {
    getPlaceMock.mockRejectedValue(new ApiError(500, null));

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os detalhes deste local.',
    );

    getPlaceMock.mockResolvedValue(place);
    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Cristo Redentor' }),
    ).toBeInTheDocument();
  });
});
