import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlaceDetailsResponse } from './placesService';

vi.mock('./authService', () => ({
  getIdToken: vi.fn().mockResolvedValue('firebase-id-token'),
}));

const response: PlaceDetailsResponse = {
  id: 'b3f1c2d4-0000-0000-0000-000000000001',
  name: 'Museu do Amanhã',
  address: 'Praça Mauá, 1, Centro',
  neighborhood: 'Centro',
  description: 'Museu de ciências.',
  latitude: -22.8944,
  longitude: -43.1795,
  estimatedVisitMinutes: 90,
  estimatedCost: 30,
  currency: 'BRL',
  categories: ['MUSEUM', 'DESCONHECIDA'],
  images: [{ url: 'https://exemplo.com/museu.jpg', altText: 'Fachada' }],
  openingHours: [
    {
      weekday: 2,
      opensAt: '10:00:00',
      closesAt: '18:00:00',
      closesNextDay: false,
    },
  ],
  source: 'Foursquare',
};

// O serviço lê VITE_USE_MOCKS e VITE_API_URL ao ser importado.
async function importService() {
  vi.resetModules();
  return import('./placesService');
}

// Intl usa espaço não separável entre "R$" e o valor.
function normalizeSpaces(text: string | null | undefined) {
  return text?.replace(/\s/g, ' ');
}

beforeEach(() => {
  vi.stubEnv('VITE_USE_MOCKS', 'false');
  vi.stubEnv('VITE_API_URL', 'http://api.test');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('toPlace', () => {
  it('converte a resposta do back-end para o formato da tela', async () => {
    const { toPlace } = await importService();

    const place = toPlace(response);

    expect(place).toMatchObject({
      id: response.id,
      name: 'Museu do Amanhã',
      categories: ['MUSEUM'],
      neighborhood: 'Centro',
      photo: { url: 'https://exemplo.com/museu.jpg', altText: 'Fachada' },
      openingHours: [
        {
          weekday: 2,
          opensAt: '10:00',
          closesAt: '18:00',
          closesNextDay: false,
        },
      ],
      description: 'Museu de ciências.',
      coordinates: { latitude: -22.8944, longitude: -43.1795 },
      address: 'Praça Mauá, 1, Centro',
      estimatedDurationMinutes: 90,
      source: 'Foursquare',
    });
    expect(normalizeSpaces(place.cost)).toBe('R$ 30,00');
  });

  it('mantém nulos os dados que o back-end não enviou', async () => {
    const { toPlace } = await importService();

    const place = toPlace({
      id: '1',
      name: 'Praia de Ipanema',
      address: null,
      neighborhood: null,
      description: null,
      latitude: null,
      longitude: null,
      estimatedVisitMinutes: null,
      estimatedCost: null,
      currency: null,
    });

    expect(place).toEqual({
      id: '1',
      name: 'Praia de Ipanema',
      categories: [],
      neighborhood: null,
      photo: null,
      openingHours: [],
      description: null,
      coordinates: null,
      address: null,
      estimatedDurationMinutes: null,
      cost: null,
      source: null,
    });
  });
});

describe('formatCost', () => {
  it('mostra "Gratuito" quando o custo é zero', async () => {
    const { formatCost } = await importService();

    expect(formatCost(0, 'BRL')).toBe('Gratuito');
  });

  it('usa a moeda informada', async () => {
    const { formatCost } = await importService();

    expect(normalizeSpaces(formatCost(10, 'USD'))).toBe('US$ 10,00');
  });

  it('não quebra com um código de moeda inválido', async () => {
    const { formatCost } = await importService();

    expect(formatCost(10, 'X')).toBe('10 X');
  });
});

describe('getPlaces', () => {
  it('chama GET /trips/{id}/places com paginação e token do Firebase', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          content: [
            {
              id: 'place-1',
              name: 'Museu de Arte',
              neighborhood: 'Centro',
              categories: ['MUSEUM', 'UNKNOWN'],
              images: [{ url: 'https://exemplo.com/m.jpg', altText: 'Museu' }],
              openingHours: [
                {
                  weekday: 2,
                  opensAt: '10:00:00',
                  closesAt: '18:00:00',
                  closesNextDay: false,
                },
              ],
            },
          ],
          page: 1,
          size: 20,
          totalElements: 21,
          totalPages: 2,
          last: true,
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { getPlaces } = await importService();

    const result = await getPlaces('trip-1', 1, 20);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/trips/trip-1/places?page=1&size=20',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer firebase-id-token',
        }),
      }),
    );
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(2);
    expect(result.last).toBe(true);
    expect(result.content).toMatchObject([
      {
        id: 'place-1',
        name: 'Museu de Arte',
        neighborhood: 'Centro',
        categories: ['MUSEUM'],
        photo: { url: 'https://exemplo.com/m.jpg', altText: 'Museu' },
        openingHours: [
          {
            weekday: 2,
            opensAt: '10:00',
            closesAt: '18:00',
            closesNextDay: false,
          },
        ],
      },
    ]);
  });
});

describe('getPlace', () => {
  it('chama GET /places/{id} com o token do Firebase', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(response), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const { getPlace } = await importService();

    const place = await getPlace(response.id);

    expect(fetchMock).toHaveBeenCalledWith(
      `http://api.test/places/${response.id}`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer firebase-id-token',
        }),
      }),
    );
    expect(place.name).toBe('Museu do Amanhã');
  });

  it('lança ApiError 404 quando o local saiu do catálogo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    );
    const { getPlace } = await importService();

    await expect(getPlace('removido')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
    });
  });
});
