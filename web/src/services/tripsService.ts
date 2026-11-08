import type { DayResolution } from '../features/trips/periodConflicts';
import { request } from './api';
import { getIdToken } from './authService';
import {
  mockCreateTrip,
  mockGetTrips,
  mockSearchDestinations,
  mockUpdateTrip,
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

export type UpdateTripInput = CreateTripInput & {
  // Escolhas para os dias em conflito, enviadas após um 409 do PATCH.
  resolutions?: DayResolution[];
};

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

// Corpo de POST /trips e PATCH /trips/{id} (CreateTripRequest/UpdateTripRequest do back-end).
function toTripRequest(input: CreateTripInput) {
  return {
    title: input.title,
    destinationId: input.destination.id,
    startsOn: input.startDate,
    endsOn: input.endDate,
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
    body: JSON.stringify(toTripRequest(input)),
  });
  return toTrip(trip);
}

export async function updateTrip(
  id: string,
  input: UpdateTripInput,
): Promise<Trip> {
  if (USE_MOCKS) return mockUpdateTrip(id, input);
  const trip = await request<TripResponse>(`/trips/${id}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify({
      ...toTripRequest(input),
      resolutions: input.resolutions,
    }),
  });
  return toTrip(trip);
}

// Back-end ainda não expõe busca de destinos: segue usando o mock.
export function searchDestinations(query: string): Promise<Destination[]> {
  return mockSearchDestinations(query);
}
