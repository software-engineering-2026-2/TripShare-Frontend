import { getAuthSession } from '../../resources/auth/session';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPlaces } from '../../resources/api/places/services';
import type { PlacesPage } from '../../resources/api/places/contract';
import { appRoutes } from '..';
import { routes } from '../paths';
import { SessionContext } from '../../providers/session';

vi.mock('../../commons/config/env', () => ({ USE_MOCKS: false }));
vi.mock('../../resources/auth/flow', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../resources/auth/flow')>()),
  getSessionUser: vi.fn().mockResolvedValue(null),
}));
vi.mock('../../resources/api/places/services', async (importOriginal) => ({
  ...(await importOriginal<
    typeof import('../../resources/api/places/services')
  >()),
  getPlaces: vi.fn(),
}));

const tripId = '40000000-0000-0000-0000-000000000001';
const placeId = '30000000-0000-0000-0000-000000000001';
const getPlacesMock = vi.mocked(getPlaces);
const page: PlacesPage = {
  content: [
    {
      id: placeId,
      name: 'Museu do Amanhã',
      categories: [],
      neighborhood: null,
      photo: null,
      openingHours: [],
    },
  ],
  page: 1,
  size: 20,
  totalElements: 21,
  totalPages: 2,
  last: true,
};

function renderRoutes(
  path: string,
  session = { uid: 'uid-ana' as string | null, ready: true },
) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    router,
    ...render(
      <SessionContext.Provider
        value={{
          ...getAuthSession(),
          ...session,
          status: !session.ready
            ? 'restoring'
            : session.uid
              ? 'authenticated'
              : 'disconnected',
        }}
      >
        <QueryClientProvider client={client}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </SessionContext.Provider>,
    ),
  };
}

beforeEach(() => {
  getPlacesMock.mockReset().mockResolvedValue(page);
});

afterEach(cleanup);

describe('navegação e parâmetros', () => {
  it('aguarda a restauração da sessão antes de consultar a API', () => {
    renderRoutes(routes.tripPlaces(tripId), { uid: null, ready: false });
    expect(screen.getByText('Carregando sessão...')).toBeInTheDocument();
    expect(getPlacesMock).not.toHaveBeenCalled();
  });

  it('redireciona ao login sem fazer a chamada quando falta sessão', async () => {
    const { router } = renderRoutes(routes.tripPlaces(tripId), {
      uid: null,
      ready: true,
    });
    expect(
      await screen.findByRole('heading', { name: 'Entrar na conta' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(routes.login);
    expect(getPlacesMock).not.toHaveBeenCalled();
  });

  it('abre um link direto para um lugar pelo catálogo e volta à página de origem', async () => {
    const { router } = renderRoutes(routes.place(placeId, tripId, 1));
    expect(
      await screen.findByRole('heading', { name: 'Museu do Amanhã' }),
    ).toBeInTheDocument();
    expect(getPlacesMock).toHaveBeenCalledOnce();
    expect(getPlacesMock).toHaveBeenCalledWith(
      tripId,
      1,
      20,
      expect.any(AbortSignal),
    );

    await userEvent.click(screen.getByRole('link', { name: 'Voltar' }));
    expect(router.state.location.pathname + router.state.location.search).toBe(
      routes.tripPlaces(tripId, 1),
    );
    expect(await screen.findByText('Página 2 de 2')).toBeInTheDocument();
  });

  it('explica como abrir um lugar sem contexto e não consulta o catálogo', async () => {
    renderRoutes(routes.place(placeId));
    expect(
      await screen.findByRole('heading', { name: 'Local indisponível' }),
    ).toBeInTheDocument();
    expect(getPlacesMock).not.toHaveBeenCalled();
  });

  it('mostra o formulário de recuperação e o retorno ao login', async () => {
    renderRoutes(routes.passwordRecovery, { uid: null, ready: true });
    expect(
      await screen.findByRole('heading', {
        name: 'Recuperar senha',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Voltar ao login' }),
    ).toHaveAttribute('href', routes.login);
  });

  it('mostra uma página para URLs desconhecidas', async () => {
    renderRoutes('/nao-existe');
    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument();
  });
});
