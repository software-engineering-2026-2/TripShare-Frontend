import { request } from './api';
import { getIdToken } from './authService';
import {
  mockCreateTrip,
  mockDeleteTrip,
  mockGetTripDeletionSummary,
  mockGetTrips,
  mockSearchDestinations,
} from './tripsMock';

// Remover junto com tripsMock.ts quando o back-end estiver pronto.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export interface Destination {
  id: string;
  city: string;
  region: string;
  country: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: Destination;
  // Datas no formato AAAA-MM-DD
  startDate: string;
  endDate: string;
}

export type CreateTripInput = Omit<Trip, 'id'>;

// O que é apagado junto com a viagem: roteiros, os publicados entre eles e os favoritos que receberam.
export interface TripDeletionSummary {
  itineraryCount: number;
  publishedItineraryCount: number;
  favoriteCount: number;
}

// Campos usados de TripResponse do back-end (dto/TripResponse.java).
interface TripResponse {
  id: string;
  destinationId: string;
  destinationName: string;
  destinationRegion: string;
  destinationCountryCode: string;
  title: string;
  startsOn: string;
  endsOn: string;
}

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
  };
}

async function authHeaders() {
  return { Authorization: `Bearer ${await getIdToken()}` };
}

// GET /trips ainda não existe no back-end: assume que devolve TripResponse[].
export async function getTrips(): Promise<Trip[]> {
  if (USE_MOCKS) return mockGetTrips();
  const trips = await request<TripResponse[]>('/trips', {
    headers: await authHeaders(),
  });
  return trips.map(toTrip);
}

export async function createTrip(input: CreateTripInput): Promise<Trip> {
  if (USE_MOCKS) return mockCreateTrip(input);
  const trip = await request<TripResponse>('/trips', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      title: input.title,
      destinationId: input.destination.id,
      startsOn: input.startDate,
      endsOn: input.endDate,
    }),
  });
  return toTrip(trip);
}

// GET /trips/{id}/deletion-summary ainda não existe no back-end: contrato proposto na T04 do RF-05.
export async function getTripDeletionSummary(
  id: string,
): Promise<TripDeletionSummary> {
  if (USE_MOCKS) return mockGetTripDeletionSummary(id);
  return request<TripDeletionSummary>(`/trips/${id}/deletion-summary`, {
    headers: await authHeaders(),
  });
}

// DELETE /trips/{id} ainda não existe no back-end: assume 204 sem corpo.
export async function deleteTrip(id: string): Promise<void> {
  if (USE_MOCKS) return mockDeleteTrip(id);
  await request<void>(`/trips/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
}

// Back-end ainda não expõe busca de destinos: segue usando o mock.
export function searchDestinations(query: string): Promise<Destination[]> {
  return mockSearchDestinations(query);
}
