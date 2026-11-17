import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// USE_MOCKS e API_URL são lidos ao carregar o módulo; por isso o stub fica no vi.hoisted.
vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCKS', 'false');
  vi.stubEnv('VITE_API_URL', 'http://api.test');
});

vi.mock('../services/authService', () => ({
  getIdToken: vi.fn().mockResolvedValue('firebase-id-token'),
}));

vi.mock('../services/tripsService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/tripsService')>()),
  searchDestinations: vi
    .fn()
    .mockResolvedValue([
      {
        id: 'dest-lisboa',
        city: 'Lisboa',
        region: 'Lisboa',
        country: 'Portugal',
      },
    ]),
}));

import MyTripsPage from './MyTripsPage';

function tripResponse(id: string, title: string) {
  return {
    id,
    userId: 'user-1',
    destinationId: 'dest-lisboa',
    destinationName: 'Lisboa',
    destinationRegion: 'Lisboa',
    destinationCountryCode: 'PT',
    title,
    startsOn: '2027-07-01',
    endsOn: '2027-07-15',
    durationDays: 15,
    createdAt: '2026-11-03T12:00:00Z',
    updatedAt: '2026-11-03T12:00:00Z',
  };
}

const fetchMock = vi.fn();

function respond(status: number, body: unknown) {
  fetchMock.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MyTripsPage />
    </QueryClientProvider>,
  );
  return userEvent.setup();
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('MyTripsPage', () => {
  it('mostra carregando e depois as viagens vindas de GET /trips', async () => {
    respond(200, [tripResponse('t1', 'Mochilão')]);
    renderPage();

    expect(screen.getByText('Carregando viagens...')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Mochilão' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Lisboa, Lisboa, Portugal')).toBeInTheDocument();
    expect(screen.queryByText('Carregando viagens...')).not.toBeInTheDocument();
  });

  it('mostra o estado vazio quando não há viagens', async () => {
    respond(200, []);
    renderPage();

    expect(
      await screen.findByText('Você ainda não tem viagens'),
    ).toBeInTheDocument();
  });

  it('mostra erro e recarrega ao clicar em "Tentar novamente"', async () => {
    respond(500, { status: 500, message: 'Database operation failed' });
    const user = renderPage();

    expect(
      await screen.findByText('Não foi possível carregar suas viagens.'),
    ).toBeInTheDocument();

    respond(200, [tripResponse('t1', 'Mochilão')]);
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(
      await screen.findByRole('heading', { name: 'Mochilão' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Não foi possível carregar suas viagens.'),
    ).not.toBeInTheDocument();
  });

  it('cria uma viagem via POST /trips, fecha o modal e atualiza a lista', async () => {
    respond(200, []);
    const user = renderPage();
    await screen.findByText('Você ainda não tem viagens');

    await user.click(screen.getByRole('button', { name: 'Nova viagem' }));
    const dialog = screen.getByRole('dialog', { name: 'Criar nova viagem' });

    await user.type(within(dialog).getByLabelText('Título'), 'Mochilão');
    await user.type(within(dialog).getByLabelText('Destino'), 'Lisboa');
    await user.type(
      within(dialog).getByLabelText('Data de início'),
      '2027-07-01',
    );
    await user.type(
      within(dialog).getByLabelText('Data de término'),
      '2027-07-15',
    );

    respond(201, tripResponse('t1', 'Mochilão'));
    respond(200, [tripResponse('t1', 'Mochilão')]);
    await user.click(
      within(dialog).getByRole('button', { name: 'Criar viagem' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Mochilão' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toBe('http://api.test/trips');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      title: 'Mochilão',
      destinationId: 'dest-lisboa',
      startsOn: '2027-07-01',
      endsOn: '2027-07-15',
    });
  });

  it('mantém o modal aberto e mostra erro quando o POST falha', async () => {
    respond(200, []);
    const user = renderPage();
    await screen.findByText('Você ainda não tem viagens');

    await user.click(screen.getByRole('button', { name: 'Nova viagem' }));
    const dialog = screen.getByRole('dialog');

    await user.type(within(dialog).getByLabelText('Título'), 'Mochilão');
    await user.type(within(dialog).getByLabelText('Destino'), 'Lisboa');
    await user.type(
      within(dialog).getByLabelText('Data de início'),
      '2027-07-01',
    );
    await user.type(
      within(dialog).getByLabelText('Data de término'),
      '2027-07-15',
    );

    respond(400, { status: 400, message: 'Invalid request body' });
    await user.click(
      within(dialog).getByRole('button', { name: 'Criar viagem' }),
    );

    expect(
      await within(dialog).findByText(
        'Não foi possível criar a viagem. Tente novamente.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('fecha o modal ao cancelar', async () => {
    respond(200, []);
    const user = renderPage();

    await user.click(screen.getByRole('button', { name: 'Nova viagem' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
