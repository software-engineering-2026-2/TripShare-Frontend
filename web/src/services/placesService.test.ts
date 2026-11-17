import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./authService', () => ({
  getIdToken: vi.fn().mockResolvedValue('firebase-id-token'),
}));

async function importService() {
  vi.resetModules();
  return import('./placesService');
}

beforeEach(() => {
  vi.stubEnv('VITE_USE_MOCKS', 'false');
  vi.stubEnv('VITE_API_URL', 'http://api.test');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
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
    expect(result.content).toEqual([
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
