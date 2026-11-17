import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getIdTokenMock } = vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCKS', 'false');
  vi.stubEnv('VITE_API_URL', 'http://api.test/');
  return { getIdTokenMock: vi.fn() };
});

vi.mock('../../../auth/flow', () => ({ getIdToken: getIdTokenMock }));

import {
  createTrip,
  deleteTrip,
  getTrip,
  getTripActivities,
  getTripDeletionPreview,
  getTrips,
  searchDestinations,
  updateTrip,
} from '../services';

const response = {
  id: 'trip-1',
  userId: 'user-1',
  destinationId: 'dest-1',
  destinationName: 'Lisboa',
  destinationRegion: null,
  destinationCountryCode: 'PT',
  title: 'Mochilão',
  startsOn: null,
  endsOn: null,
  durationDays: 15,
  createdAt: '2026-11-03T12:00:00Z',
  updatedAt: '2026-11-03T12:00:00Z',
};

const input = {
  title: response.title,
  destinationId: response.destinationId,
  durationDays: response.durationDays,
};
const fetchMock = vi.fn();

function respond(status: number, body?: object) {
  fetchMock.mockResolvedValueOnce(
    new Response(body ? JSON.stringify(body) : null, { status }),
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  getIdTokenMock.mockReset().mockResolvedValue('firebase-id-token');
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

describe('contrato de viagens', () => {
  it('não envia chamadas para as operações pendentes em modo real', async () => {
    await expect(getTrips()).resolves.toEqual([]);
    await expect(getTrip('trip-1')).resolves.toBeNull();
    await expect(getTripActivities('trip-1')).resolves.toBeNull();
    await expect(searchDestinations('Lisboa')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(getIdTokenMock).not.toHaveBeenCalled();
  });

  it('envia a criação com Bearer e duração, preservando a nulabilidade da resposta', async () => {
    respond(201, response);
    await expect(createTrip(input)).resolves.toEqual({
      id: 'trip-1',
      title: 'Mochilão',
      destination: {
        id: 'dest-1',
        city: 'Lisboa',
        region: null,
        country: 'Portugal',
      },
      startDate: null,
      endDate: null,
      durationDays: 15,
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api.test/trips');
    expect(options).toMatchObject({
      method: 'POST',
      headers: {
        Authorization: 'Bearer firebase-id-token',
        'Content-Type': 'application/json',
      },
    });
    expect(JSON.parse(options.body)).toEqual(input);
  });

  it('envia PATCH parcial preservando campos omitidos, null e resoluções', async () => {
    respond(200, response);
    const patch = {
      startsOn: null,
      durationDays: 12,
      resolutions: [
        { dayNumber: 15, action: 'REMOVE' as const },
        { dayNumber: 14, action: 'MOVE' as const, targetDay: 10 },
      ],
    };
    await updateTrip('trip/id', patch);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api.test/trips/trip%2Fid');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual(patch);
  });

  it('propaga status e corpo do erro sem mascarar o conflito', async () => {
    const body = {
      status: 409,
      message: 'Cannot shorten trip',
      conflicts: [{ dayNumber: 15, activityCount: 2 }],
    };
    respond(409, body);
    await expect(
      updateTrip('trip-1', { durationDays: 12 }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 409, body });
  });

  it('chama a prévia paginada sem enviar Content-Type de JSON', async () => {
    const page = {
      content: [],
      page: 2,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      last: true,
    };
    respond(200, page);
    await expect(getTripDeletionPreview('trip-1', 2)).resolves.toEqual(page);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/trips/trip-1/delete-preview?page=2&size=20',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer firebase-id-token' },
      }),
    );
  });

  it('confirma DELETE e aceita 204 sem JSON', async () => {
    respond(204);
    await expect(deleteTrip('trip-1')).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/trips/trip-1?confirm=true',
      expect.objectContaining({
        method: 'DELETE',
        headers: { Authorization: 'Bearer firebase-id-token' },
      }),
    );
  });

  it('não envia a requisição sem token', async () => {
    getIdTokenMock.mockRejectedValue(new Error('Usuário não autenticado.'));
    await expect(createTrip(input)).rejects.toThrow('Usuário não autenticado.');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
