import { request } from './api';
import {
  mockCreateTrip,
  mockGetTrips,
  mockSearchDestinations,
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

export function getTrips(): Promise<Trip[]> {
  if (USE_MOCKS) return mockGetTrips();
  return request<Trip[]>('/trips');
}

export function createTrip(input: CreateTripInput): Promise<Trip> {
  if (USE_MOCKS) return mockCreateTrip(input);
  return request<Trip>('/trips', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// Endpoint ainda não confirmado com o back-end.
export function searchDestinations(query: string): Promise<Destination[]> {
  if (USE_MOCKS) return mockSearchDestinations(query);
  return request<Destination[]>(`/destinations?q=${encodeURIComponent(query)}`);
}
