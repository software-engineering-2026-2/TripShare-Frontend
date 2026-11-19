import { requestAuthenticated } from '../../client/tripshare';
import type { ApiPage } from '../../client/http';
import { apiRoutes } from '../paths';
import { USE_MOCKS } from '../../../commons/config/env';
import { mockGetPlace, mockGetPlaces } from './mock';

import type { Place, PlaceResponse, PlacesPage } from './contract';

export function formatCost(
  value: number | null | undefined,
  currency: string | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  if (value === 0) return 'Gratuito';
  if (!currency) return null;

  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(value);
  } catch {
    // Código de moeda inválido: mostra o valor sem formatar a moeda.
    return `${value} ${currency}`;
  }
}

export function toPlace(response: PlaceResponse): Place {
  return {
    id: response.id,
    name: response.name,
    categories: [],
    neighborhood: response.neighborhood,
    photo: null,
    openingHours: [],
    description: response.description,
    coordinates:
      response.latitude != null && response.longitude != null
        ? { latitude: response.latitude, longitude: response.longitude }
        : null,
    address: response.address,
    estimatedDurationMinutes: response.estimatedVisitMinutes,
    cost: formatCost(response.estimatedCost, response.currency),
    source: null,
  };
}

export async function getPlaces(
  tripId: string,
  page = 0,
  size = 20,
  signal?: AbortSignal,
): Promise<PlacesPage> {
  if (USE_MOCKS) return mockGetPlaces(page, size);

  const response = await requestAuthenticated<ApiPage<PlaceResponse>>(
    apiRoutes.trips.places(tripId),
    {
      method: 'GET',
      query: { page, size },
      signal,
    },
  );

  return { ...response, content: response.content.map(toPlace) };
}

export function getPlace(id: string): Promise<Place | null> {
  // TODO(backend): GET /places/{id}. Em modo real, os detalhes vêm do catálogo da viagem.
  return USE_MOCKS ? mockGetPlace(id) : Promise.resolve(null);
}
