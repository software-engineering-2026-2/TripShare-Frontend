import { USE_MOCKS } from '../../../commons/config/env';
import { requestAuthenticated } from '../../client/tripshare';
import { apiRoutes } from '../paths';
import {
  mockCreateTrip,
  mockDeleteTrip,
  mockGetTrip,
  mockGetTripActivities,
  mockGetTripDeletionPreview,
  mockGetTrips,
  mockSearchDestinations,
  mockUpdateTrip,
} from './mock';

import type {
  CreateTripInput,
  UpdateTripInput,
  Trip,
  Destination,
  TripDeletionPreview,
  TripActivities,
  TripResponse,
} from './contract';

const countryNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' });

function toTrip(response: TripResponse): Trip {
  return {
    id: response.id,
    title: response.title,
    destination: {
      id: response.destinationId,
      city: response.destinationName,
      region: response.destinationRegion,
      country:
        countryNames.of(response.destinationCountryCode) ??
        response.destinationCountryCode,
    },
    startDate: response.startsOn,
    endDate: response.endsOn,
    durationDays: response.durationDays,
  };
}

export function getTrips(): Promise<Trip[]> {
  // TODO(backend): GET /trips. Em modo real, a lista é mantida em memória por useTrips.
  return USE_MOCKS ? mockGetTrips() : Promise.resolve([]);
}

export function getTrip(id: string): Promise<Trip | null> {
  // TODO(backend): GET /trips/{id}. Em modo real, use apenas a lista da sessão.
  return USE_MOCKS ? mockGetTrip(id) : Promise.resolve(null);
}

export function getTripActivities(
  tripId: string,
): Promise<TripActivities | null> {
  // TODO(backend): GET /trips/{id}/activities ainda não está disponível.
  return USE_MOCKS ? mockGetTripActivities(tripId) : Promise.resolve(null);
}

export async function createTrip(input: CreateTripInput): Promise<Trip> {
  if (USE_MOCKS) return mockCreateTrip(input);
  return toTrip(
    await requestAuthenticated<TripResponse>(apiRoutes.trips.create, {
      method: 'POST',
      body: input,
    }),
  );
}

export async function updateTrip(
  id: string,
  input: UpdateTripInput,
): Promise<Trip> {
  if (USE_MOCKS) return mockUpdateTrip(id, input);
  return toTrip(
    await requestAuthenticated<TripResponse>(apiRoutes.trips.update(id), {
      method: 'PATCH',
      body: input,
    }),
  );
}

export async function getTripDeletionPreview(
  id: string,
  page = 0,
  size = 20,
  signal?: AbortSignal,
): Promise<TripDeletionPreview> {
  if (USE_MOCKS) return mockGetTripDeletionPreview(id, page, size);
  return requestAuthenticated<TripDeletionPreview>(
    apiRoutes.trips.deletePreview(id),
    {
      method: 'GET',
      query: { page, size },
      signal,
    },
  );
}

export async function deleteTrip(id: string): Promise<void> {
  if (USE_MOCKS) return mockDeleteTrip(id);
  await requestAuthenticated<void>(apiRoutes.trips.delete(id), {
    method: 'DELETE',
    query: { confirm: true },
  });
}

export function searchDestinations(query: string): Promise<Destination[]> {
  // TODO(backend): busca de destinos. Em modo real, o formulário recebe um UUID cadastrado.
  return USE_MOCKS ? mockSearchDestinations(query) : Promise.resolve([]);
}
