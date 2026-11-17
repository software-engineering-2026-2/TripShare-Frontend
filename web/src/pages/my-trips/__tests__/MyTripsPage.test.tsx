import { getAuthSession } from '../../../resources/auth/session';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionContext } from '../../../providers/session';
import { tripQueryKeys } from '../../../resources/api/trips/tripQueryKeys';
import type { Trip } from '../../../resources/api/trips/contract';
import MyTripsPage from '..';

vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCKS', 'false');
  vi.stubEnv('VITE_API_URL', 'http://api.test');
});

vi.mock('../../../resources/auth/flow', () => ({
  getIdToken: vi.fn().mockResolvedValue('firebase-id-token'),
}));

const destinationId = '20000000-0000-0000-0000-000000000001';
const tripId = '40000000-0000-0000-0000-000000000001';
const uid = 'firebase-uid';
const trip: Trip = {
  id: tripId,
  title: 'Mochilão',
  destination: {
    id: destinationId,
    city: 'Lisboa',
    region: 'Lisboa',
    country: 'Portugal',
  },
  startDate: '2027-07-01',
  endDate: '2027-07-15',
  durationDays: 15,
};

function tripResponse(fields: object = {}) {
  return {
    id: trip.id,
    userId: '10000000-0000-0000-0000-000000000001',
    destinationId,
    destinationName: 'Lisboa',
    destinationRegion: 'Lisboa',
    destinationCountryCode: 'PT',
    title: trip.title,
    startsOn: trip.startDate,
    endsOn: trip.endDate,
    durationDays: trip.durationDays,
    createdAt: '2026-11-03T12:00:00Z',
    updatedAt: '2026-11-03T12:00:00Z',
    ...fields,
  };
}

const preview = {
  content: [
    {
      id: 'it-1',
      title: 'Roteiro antigo',
      published: true,
      favoriteCount: 4,
      inRanking: true,
    },
  ],
  page: 0,
  size: 20,
  totalElements: 21,
  totalPages: 2,
  last: false,
};

const fetchMock = vi.fn();

function respond(status: number, body?: object) {
  fetchMock.mockResolvedValueOnce(
    new Response(body ? JSON.stringify(body) : null, { status }),
  );
}

function renderPage(trips: Trip[] = [], currentUid: string = uid) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(tripQueryKeys.list(uid), trips);

  render(
    <SessionContext.Provider
      value={{
        ...getAuthSession(),
        uid: currentUid,
        ready: true,
        status: 'authenticated',
      }}
    >
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <MyTripsPage />
        </MemoryRouter>
      </QueryClientProvider>
    </SessionContext.Provider>,
  );
  return userEvent.setup();
}

function lastRequest() {
  const [url, options] = fetchMock.mock.calls.at(-1)!;
  return {
    url,
    method: options.method,
    headers: options.headers,
    body: options.body ? JSON.parse(options.body) : undefined,
  };
}

async function openFormForCreate() {
  const user = renderPage();
  await user.click(screen.getByRole('button', { name: 'Nova viagem' }));
  const dialog = within(screen.getByRole('dialog'));
  await user.type(dialog.getByLabelText('Título'), 'Mochilão');
  await user.type(dialog.getByLabelText('Destino'), destinationId);
  return { user, dialog };
}

async function openFormForEdit() {
  const user = renderPage([trip]);
  await user.click(
    screen.getByRole('button', { name: 'Editar viagem Mochilão' }),
  );
  return {
    user,
    dialog: within(screen.getByRole('dialog', { name: 'Editar viagem' })),
  };
}

async function openDeleteDialog(status = 200, body: object = preview) {
  const user = renderPage([trip]);
  respond(status, body);
  await user.click(
    screen.getByRole('button', { name: 'Excluir viagem Mochilão' }),
  );
  return { user, dialog: within(screen.getByRole('alertdialog')) };
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Minhas Viagens com o backend real', () => {
  it('mostra a lista da sessão atual e não chama GET /trips', () => {
    renderPage([trip]);
    expect(
      screen.getByRole('heading', { name: 'Mochilão' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/viagens criadas ou editadas nesta sessão/),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('não exibe viagens de outro UID no cache', () => {
    renderPage([trip], 'outra-conta');
    expect(screen.getByText('Nenhuma viagem nesta sessão')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Mochilão' }),
    ).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('cria uma viagem por duração e mostra os dados devolvidos pelo backend', async () => {
    const { user, dialog } = await openFormForCreate();
    await user.selectOptions(dialog.getByLabelText('Planejamento'), 'duration');
    await user.type(dialog.getByLabelText('Duração em dias'), '5');
    respond(
      201,
      tripResponse({
        startsOn: null,
        endsOn: null,
        durationDays: 5,
        destinationRegion: null,
      }),
    );
    await user.click(dialog.getByRole('button', { name: 'Criar viagem' }));

    expect(
      await screen.findByRole('heading', { name: 'Mochilão' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sem datas definidas')).toBeInTheDocument();
    expect(screen.getByText('5 dias')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(lastRequest()).toMatchObject({
      url: 'http://api.test/trips',
      method: 'POST',
      headers: { Authorization: 'Bearer firebase-id-token' },
      body: { title: 'Mochilão', destinationId, durationDays: 5 },
    });
  });

  it('mostra destino inexistente no campo e permite corrigir', async () => {
    const { user, dialog } = await openFormForCreate();
    fireEvent.change(dialog.getByLabelText('Data de início'), {
      target: { value: '2027-07-01' },
    });
    fireEvent.change(dialog.getByLabelText('Data de término'), {
      target: { value: '2027-07-15' },
    });
    respond(404, { status: 404, message: 'Destination not found' });
    await user.click(dialog.getByRole('button', { name: 'Criar viagem' }));
    expect(
      await dialog.findByText('Destino não encontrado.'),
    ).toBeInTheDocument();
    expect(dialog.getByLabelText('Destino')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(dialog.getByRole('button', { name: 'Criar viagem' })).toBeEnabled();
  });

  it('edita apenas o título e usa a resposta para atualizar a lista', async () => {
    const { user, dialog } = await openFormForEdit();
    const title = dialog.getByLabelText('Título');
    await user.clear(title);
    await user.type(title, 'Mochilão editado');
    respond(200, tripResponse({ title: 'Mochilão editado' }));
    await user.click(dialog.getByRole('button', { name: 'Salvar alterações' }));

    expect(
      await screen.findByRole('heading', { name: 'Mochilão editado' }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(lastRequest()).toMatchObject({
      url: `http://api.test/trips/${tripId}`,
      method: 'PATCH',
    });
    expect(lastRequest().body).toEqual({ title: 'Mochilão editado' });
  });

  it('reenvia o período e a resolução após 409 e mostra o conflito de publicação', async () => {
    const { user, dialog } = await openFormForEdit();
    const save = dialog.getByRole('button', { name: 'Salvar alterações' });
    fireEvent.change(dialog.getByLabelText('Data de término'), {
      target: { value: '2027-07-10' },
    });
    respond(409, {
      status: 409,
      message: 'Cannot shorten trip',
      conflicts: [{ dayNumber: 12, activityCount: 1 }],
    });
    await user.click(save);
    await user.click(
      await dialog.findByRole('radio', { name: 'Remover 1 atividade' }),
    );
    respond(409, {
      status: 409,
      message:
        'A public itinerary needs an activity with an identified location',
    });
    await user.click(save);

    expect(
      await dialog.findByText(/Um roteiro público precisa manter/),
    ).toBeInTheDocument();
    expect(lastRequest().body).toEqual({
      endsOn: '2027-07-10',
      resolutions: [{ dayNumber: 12, action: 'REMOVE' }],
    });
    expect(
      screen.getByRole('heading', { name: 'Mochilão' }),
    ).toBeInTheDocument();
  });

  it('usa o UUID, pagina a prévia e remove a viagem após o DELETE confirmado', async () => {
    const { user, dialog } = await openDeleteDialog();
    expect(
      await dialog.findByText(/Serão removidos 21 roteiros/),
    ).toBeInTheDocument();
    expect(lastRequest()).toMatchObject({
      url: `http://api.test/trips/${tripId}/delete-preview?page=0&size=20`,
      method: 'GET',
    });

    respond(200, {
      ...preview,
      content: [{ ...preview.content[0], id: 'it-2', title: 'Último roteiro' }],
      page: 1,
      last: true,
    });
    await user.click(dialog.getByRole('button', { name: 'Próxima' }));
    expect(await dialog.findByText(/Último roteiro/)).toBeInTheDocument();
    expect(lastRequest().url).toBe(
      `http://api.test/trips/${tripId}/delete-preview?page=1&size=20`,
    );

    respond(204);
    await user.click(dialog.getByRole('button', { name: 'Excluir viagem' }));
    expect(
      await screen.findByText('Nenhuma viagem nesta sessão'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(lastRequest()).toMatchObject({
      url: `http://api.test/trips/${tripId}?confirm=true`,
      method: 'DELETE',
      headers: { Authorization: 'Bearer firebase-id-token' },
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('bloqueia exclusão e remove a viagem da sessão quando a prévia responde 404', async () => {
    const { dialog } = await openDeleteDialog(404, {
      status: 404,
      message: 'Trip not found',
    });
    expect(
      await dialog.findByText('Esta viagem não existe mais.'),
    ).toBeInTheDocument();
    expect(
      dialog.getByRole('button', { name: 'Excluir viagem' }),
    ).toBeDisabled();
    expect(screen.getByText('Nenhuma viagem nesta sessão')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
