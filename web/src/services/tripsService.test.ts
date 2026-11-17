import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// USE_MOCKS e API_URL são lidos ao carregar o módulo; por isso o stub fica no vi.hoisted.
const { getIdTokenMock } = vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCKS', 'false');
  vi.stubEnv('VITE_API_URL', 'http://api.test');
  return { getIdTokenMock: vi.fn() };
});

vi.mock('./authService', () => ({ getIdToken: getIdTokenMock }));

import { ApiError } from './api';
import { createTrip, getTrips } from './tripsService';

const tripResponse = {
  id: 'trip-1',
  userId: 'user-1',
  destinationId: 'dest-1',
  destinationName: 'Lisboa',
  destinationRegion: 'Lisboa',
  destinationCountryCode: 'PT',
  title: 'Mochilão',
  startsOn: '2027-07-01',
  endsOn: '2027-07-15',
  durationDays: 15,
  createdAt: '2026-11-03T12:00:00Z',
  updatedAt: '2026-11-03T12:00:00Z',
};

const trip = {
  id: 'trip-1',
  title: 'Mochilão',
  destination: {
    id: 'dest-1',
    city: 'Lisboa',
    region: 'Lisboa',
    country: 'Portugal',
  },
  startDate: '2027-07-01',
  endDate: '2027-07-15',
};

const fetchMock = vi.fn();

function respond(status: number, body: unknown) {
  fetchMock.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
}

beforeEach(() => {
  fetchMock.mockReset();
  getIdTokenMock.mockReset().mockResolvedValue('firebase-id-token');
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getTrips', () => {
  it('chama GET /trips com o token e converte a resposta', async () => {
    respond(200, [tripResponse]);

    await expect(getTrips()).resolves.toEqual([trip]);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/trips',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer firebase-id-token',
        }),
      }),
    );
  });

  it('propaga ApiError quando o back-end responde com erro', async () => {
    respond(401, { status: 401, message: 'Firebase Bearer token is required' });

    await expect(getTrips()).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
    });
  });

  it('não chama a API quando não há usuário autenticado', async () => {
    getIdTokenMock.mockRejectedValue(new Error('Usuário não autenticado.'));

    await expect(getTrips()).rejects.toThrow('Usuário não autenticado.');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('createTrip', () => {
  it('envia POST /trips no formato do back-end e converte a resposta', async () => {
    respond(201, tripResponse);

    const { id, ...input } = trip;
    await expect(createTrip(input)).resolves.toEqual({ ...trip, id });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api.test/trips');
    expect(options.method).toBe('POST');
    expect(options.headers).toMatchObject({
      Authorization: 'Bearer firebase-id-token',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(options.body)).toEqual({
      title: 'Mochilão',
      destinationId: 'dest-1',
      startsOn: '2027-07-01',
      endsOn: '2027-07-15',
    });
  });

  it('propaga ApiError com o corpo do erro', async () => {
    respond(404, { status: 404, message: 'Destination not found' });

    const error = await createTrip(trip).catch((reason) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.body).toEqual({
      status: 404,
      message: 'Destination not found',
    });
  });
});
