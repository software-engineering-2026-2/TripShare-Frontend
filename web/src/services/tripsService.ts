import { request } from './api';
import {
  mockCreateTrip,
  mockGetTrip,
  mockGetTripActivities,
  mockGetTrips,
  mockSearchDestinations,
  mockUpdateTrip,
} from './tripsMock';

// Remover junto com tripsMock.ts quando o back-end estiver pronto.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Tipos provisórios: devem ser substituídos pelos gerados a partir do OpenAPI do back-end.
export interface Destination {
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

export type UpdateTripInput = CreateTripInput;

// Posição no mapa ilustrativo; na integração deve virar latitude/longitude.
export interface MapPosition {
  x: number;
  y: number;
}

export interface TripActivity {
  id: string;
  // 1 = primeiro dia da viagem
  dayNumber: number;
  name: string;
  location: string;
  durationMinutes: number;
  // Horário fixo de início (HH:MM), quando houver
  startsAt: string | null;
  mapPosition: MapPosition;
}

export interface TripActivities {
  lodging: { name: string; mapPosition: MapPosition };
  activities: TripActivity[];
}

export function getTrips(): Promise<Trip[]> {
  if (USE_MOCKS) return mockGetTrips();
  return request<Trip[]>('/trips');
}

// Endpoint ainda não confirmado com o back-end.
export function getTrip(id: string): Promise<Trip> {
  if (USE_MOCKS) return mockGetTrip(id);
  return request<Trip>(`/trips/${id}`);
}

// Endpoint ainda não confirmado com o back-end.
export function getTripActivities(tripId: string): Promise<TripActivities> {
  if (USE_MOCKS) return mockGetTripActivities(tripId);
  return request<TripActivities>(`/trips/${tripId}/activities`);
}

export function createTrip(input: CreateTripInput): Promise<Trip> {
  if (USE_MOCKS) return mockCreateTrip(input);
  return request<Trip>('/trips', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// O back-end (branch RF-05) espera destinationId, startsOn e endsOn; ajustar o corpo quando os tipos vierem do OpenAPI.
export function updateTrip(id: string, input: UpdateTripInput): Promise<Trip> {
  if (USE_MOCKS) return mockUpdateTrip(id, input);
  return request<Trip>(`/trips/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

// Endpoint ainda não confirmado com o back-end.
export function searchDestinations(query: string): Promise<Destination[]> {
  if (USE_MOCKS) return mockSearchDestinations(query);
  return request<Destination[]>(`/destinations?q=${encodeURIComponent(query)}`);
}
