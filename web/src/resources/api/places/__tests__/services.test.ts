import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPlace, getPlaces, formatCost, toPlace } from '../services';
import type { PlaceResponse } from '../contract';

vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCKS', 'false');
  vi.stubEnv('VITE_API_URL', 'http://api.test');
});

vi.mock('../../../auth/flow', () => ({
  getIdToken: vi.fn().mockResolvedValue('firebase-id-token'),
}));

const response: PlaceResponse = {
  id: '30000000-0000-0000-0000-000000000001',
  name: 'Museu do Amanhã',
  address: 'Praça Mauá, 1, Centro',
  neighborhood: 'Centro',
  description: 'Museu de ciências.',
  latitude: -22.8944,
  longitude: -43.1795,
  estimatedVisitMinutes: 90,
  estimatedCost: 30,
  currency: 'BRL',
};

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

const normalizeSpaces = (value: string | null) => value?.replace(/\s/g, ' ');

describe('catálogo de lugares', () => {
  it('usa apenas os campos disponíveis no DTO real', () => {
    const place = toPlace(response);
    expect(place).toEqual({
      id: response.id,
      name: response.name,
      address: response.address,
      neighborhood: response.neighborhood,
      description: response.description,
      coordinates: { latitude: -22.8944, longitude: -43.1795 },
      estimatedDurationMinutes: 90,
      cost: expect.any(String),
      categories: [],
      photo: null,
      openingHours: [],
      source: null,
    });
    expect(normalizeSpaces(place.cost ?? null)).toBe('R$ 30,00');
  });

  it('preserva campos nulos e não inventa moeda', () => {
    const place = toPlace({
      ...response,
      address: null,
      latitude: null,
      longitude: null,
      estimatedVisitMinutes: null,
      estimatedCost: null,
      currency: null,
    });
    expect(place).toMatchObject({
      address: null,
      coordinates: null,
      estimatedDurationMinutes: null,
      cost: null,
    });
    expect(formatCost(10, null)).toBeNull();
    expect(formatCost(0, 'BRL')).toBe('Gratuito');
    expect(normalizeSpaces(formatCost(10, 'USD'))).toBe('US$ 10,00');
  });

  it('consulta o catálogo da viagem com paginação e token', async () => {
    const page = {
      content: [response],
      page: 1,
      size: 20,
      totalElements: 21,
      totalPages: 2,
      last: true,
    };
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(page), { status: 200 }),
    );

    await expect(getPlaces('trip-1', 1, 20)).resolves.toEqual({
      ...page,
      content: [toPlace(response)],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/trips/trip-1/places?page=1&size=20',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer firebase-id-token' },
      }),
    );
  });

  it('não chama GET /places/{id} enquanto o endpoint estiver pendente', async () => {
    await expect(getPlace(response.id)).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
