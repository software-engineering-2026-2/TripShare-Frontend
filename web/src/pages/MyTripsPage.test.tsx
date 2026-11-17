import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
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
  searchDestinations: vi.fn().mockResolvedValue([
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

const forbidden = { status: 403, message: 'You do not own this trip' };
const notFound = { status: 404, message: 'Trip not found' };

function lastCall() {
  const [url, options] = fetchMock.mock.calls.at(-1)!;
  return { url, method: options?.method ?? 'GET', options };
}

describe('MyTripsPage — edição via PATCH /trips/{id}', () => {
  async function openEditForm() {
    respond(200, [tripResponse('t1', 'Mochilão')]);
    const user = renderPage();
    await user.click(
      await screen.findByRole('button', { name: 'Editar viagem Mochilão' }),
    );
    return {
      user,
      dialog: screen.getByRole('dialog', { name: 'Editar viagem' }),
    };
  }

  it('envia o PATCH com token, fecha o modal e atualiza a lista', async () => {
    const { user, dialog } = await openEditForm();

    const title = within(dialog).getByLabelText('Título');
    await user.clear(title);
    await user.type(title, 'Mochilão editado');

    respond(200, tripResponse('t1', 'Mochilão editado'));
    respond(200, [tripResponse('t1', 'Mochilão editado')]);
    await user.click(
      within(dialog).getByRole('button', { name: 'Salvar alterações' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Mochilão editado' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toBe('http://api.test/trips/t1');
    expect(options.method).toBe('PATCH');
    expect(options.headers).toMatchObject({
      Authorization: 'Bearer firebase-id-token',
    });
    expect(JSON.parse(options.body)).toEqual({
      title: 'Mochilão editado',
      destinationId: 'dest-lisboa',
      startsOn: '2027-07-01',
      endsOn: '2027-07-15',
    });
  });

  it('após um 409 reenvia o PATCH com as escolhas dos dias em conflito', async () => {
    const { user, dialog } = await openEditForm();

    fireEvent.change(within(dialog).getByLabelText('Data de término'), {
      target: { value: '2027-07-10' },
    });
    respond(409, {
      status: 409,
      message: 'Cannot shorten trip',
      conflicts: [{ dayNumber: 12, activityCount: 1 }],
    });
    await user.click(
      within(dialog).getByRole('button', { name: 'Salvar alterações' }),
    );

    await within(dialog).findByText('Dia 12: 1 atividade');
    await user.click(
      within(dialog).getByRole('radio', { name: 'Remover 1 atividade' }),
    );

    respond(200, tripResponse('t1', 'Mochilão'));
    respond(200, [tripResponse('t1', 'Mochilão')]);
    await user.click(
      within(dialog).getByRole('button', { name: 'Salvar alterações' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    const [url, options] = fetchMock.mock.calls[2];
    expect(url).toBe('http://api.test/trips/t1');
    expect(JSON.parse(options.body)).toMatchObject({
      endsOn: '2027-07-10',
      resolutions: [{ dayNumber: 12, action: 'REMOVE' }],
    });
  });

  it.each([
    [forbidden, 'Você não tem permissão para alterar esta viagem.'],
    [notFound, 'Esta viagem não existe mais.'],
  ])(
    'com $status mantém o modal com o motivo e recarrega a lista',
    async (body, message) => {
      const { user, dialog } = await openEditForm();

      respond(body.status, body);
      respond(200, []);
      await user.click(
        within(dialog).getByRole('button', { name: 'Salvar alterações' }),
      );

      expect(await within(dialog).findByText(message)).toBeInTheDocument();
      expect(
        within(dialog).getByRole('button', { name: 'Salvar alterações' }),
      ).toBeDisabled();
      expect(
        await screen.findByText('Você ainda não tem viagens'),
      ).toBeInTheDocument();
      expect(lastCall()).toMatchObject({
        url: 'http://api.test/trips',
        method: 'GET',
      });
    },
  );
});

describe('MyTripsPage — exclusão via DELETE /trips/{id}', () => {
  const summary = {
    itineraryCount: 3,
    publishedItineraryCount: 1,
    favoriteCount: 4,
  };

  async function openDeleteDialog(
    summaryStatus = 200,
    summaryBody: unknown = summary,
    // Lista devolvida pela recarga que um 403/404 no resumo dispara.
    refreshedTrips?: unknown[],
  ) {
    respond(200, [
      tripResponse('t1', 'Mochilão'),
      tripResponse('t2', 'Bate e volta'),
    ]);
    const user = renderPage();
    const deleteButton = await screen.findByRole('button', {
      name: 'Excluir viagem Mochilão',
    });

    respond(summaryStatus, summaryBody);
    if (refreshedTrips) respond(200, refreshedTrips);
    await user.click(deleteButton);
    return {
      user,
      dialog: screen.getByRole('alertdialog', { name: 'Excluir Mochilão?' }),
    };
  }

  function confirmButton(dialog: HTMLElement) {
    return within(dialog).getByRole('button', {
      name: /^(Excluir viagem|Excluindo\.\.\.)$/,
    });
  }

  it('busca o resumo, exclui com token e tira a viagem da lista', async () => {
    const { user, dialog } = await openDeleteDialog();

    expect(await within(dialog).findByText('3 roteiros')).toBeInTheDocument();
    expect(fetchMock.mock.calls[1][0]).toBe(
      'http://api.test/trips/t1/deletion-summary',
    );

    respond(204, null);
    respond(200, [tripResponse('t2', 'Bate e volta')]);
    await user.click(confirmButton(dialog));

    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Mochilão' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Bate e volta' }),
    ).toBeInTheDocument();

    // GET /trips, resumo, DELETE e recarga da lista; o resumo da viagem excluída não é buscado de novo.
    expect(
      fetchMock.mock.calls.map(
        ([url, options]) => `${options?.method ?? 'GET'} ${url}`,
      ),
    ).toEqual([
      'GET http://api.test/trips',
      'GET http://api.test/trips/t1/deletion-summary',
      'DELETE http://api.test/trips/t1',
      'GET http://api.test/trips',
    ]);
    const [url, options] = fetchMock.mock.calls[2];
    expect(url).toBe('http://api.test/trips/t1');
    expect(options.method).toBe('DELETE');
    expect(options.headers).toMatchObject({
      Authorization: 'Bearer firebase-id-token',
    });
  });

  it('cancelar fecha o diálogo sem chamar o DELETE', async () => {
    const { user, dialog } = await openDeleteDialog();
    await within(dialog).findByText('3 roteiros');

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(([, options]) => options?.method === 'DELETE'),
    ).toBe(false);
  });

  it.each([
    [forbidden, 'Você não tem permissão para excluir esta viagem.'],
    [notFound, 'Esta viagem não existe mais.'],
  ])(
    'com $status no DELETE mantém o diálogo com o motivo e recarrega a lista',
    async (body, message) => {
      const { user, dialog } = await openDeleteDialog();
      await within(dialog).findByText('3 roteiros');

      respond(body.status, body);
      respond(200, [tripResponse('t2', 'Bate e volta')]);
      await user.click(confirmButton(dialog));

      expect(await within(dialog).findByText(message)).toBeInTheDocument();
      expect(confirmButton(dialog)).toBeDisabled();
      await waitFor(() =>
        expect(
          screen.queryByRole('heading', { name: 'Mochilão' }),
        ).not.toBeInTheDocument(),
      );
      expect(lastCall()).toMatchObject({
        url: 'http://api.test/trips',
        method: 'GET',
      });
    },
  );

  it('com 404 no resumo mostra o motivo, sem tentar de novo, e recarrega a lista', async () => {
    const { dialog } = await openDeleteDialog(404, notFound, [
      tripResponse('t2', 'Bate e volta'),
    ]);

    expect(
      await within(dialog).findByText('Esta viagem não existe mais.'),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole('button', { name: 'Tentar novamente' }),
    ).not.toBeInTheDocument();
    expect(confirmButton(dialog)).toBeDisabled();
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Mochilão' }),
      ).not.toBeInTheDocument(),
    );
  });
});
