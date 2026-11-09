// Dados falsos para visualizar as telas sem back-end (viagens ativadas com VITE_USE_MOCKS=true).
// A busca de destinos usa este mock sempre: o back-end ainda não tem rota de destinos,
// então os ids abaixo precisam existir no banco para o POST /trips funcionar.
// Vou apagar isso quando a API tiver pronta
import {
  INVALID_DURATION_MESSAGE,
  type DayConflict,
  type DayResolution,
} from '../features/trips/periodConflicts';
import { getTripDays } from '../features/trips/tripValidation';
import { ApiError } from './api';
import type {
  CreateTripInput,
  Destination,
  Trip,
  TripDeletionSummary,
  UpdateTripInput,
} from './tripsService';

const destinations: Destination[] = [
  {
    id: '3f1c2a9e-1b7d-4c8e-9a01-0d5e6f7a8b01',
    city: 'Rio de Janeiro',
    region: 'Rio de Janeiro',
    country: 'Brasil',
  },
  {
    id: '3f1c2a9e-1b7d-4c8e-9a01-0d5e6f7a8b02',
    city: 'São Paulo',
    region: 'São Paulo',
    country: 'Brasil',
  },
  {
    id: '3f1c2a9e-1b7d-4c8e-9a01-0d5e6f7a8b03',
    city: 'Lisboa',
    region: 'Lisboa',
    country: 'Portugal',
  },
  {
    id: '3f1c2a9e-1b7d-4c8e-9a01-0d5e6f7a8b04',
    city: 'Paris',
    region: 'Île-de-France',
    country: 'França',
  },
  {
    id: '3f1c2a9e-1b7d-4c8e-9a01-0d5e6f7a8b05',
    city: 'Paris',
    region: 'Texas',
    country: 'Estados Unidos',
  },
];

const trips: Trip[] = [
  {
    id: '1',
    title: 'Férias de verão',
    destination: destinations[0],
    startDate: '2027-01-10',
    endDate: '2027-01-20',
  },
  {
    id: '2',
    title: 'Mochilão na Europa',
    destination: destinations[2],
    startDate: '2027-07-01',
    endDate: '2027-07-15',
  },
];

// Atividades já planejadas por dia da viagem (número do dia -> quantidade).
const activitiesByTrip: Record<string, Record<number, number>> = {
  '1': { 9: 2, 11: 1 },
};

// Roteiros, publicações e favoritos por viagem; viagens fora daqui não têm nenhum.
const deletionSummaryByTrip: Record<string, TripDeletionSummary> = {
  '1': { itineraryCount: 3, publishedItineraryCount: 1, favoriteCount: 4 },
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockGetTrips(): Promise<Trip[]> {
  await wait(500);
  return [...trips];
}

export async function mockCreateTrip(input: CreateTripInput): Promise<Trip> {
  await wait(500);
  const trip = { ...input, id: String(Date.now()) };
  trips.push(trip);
  return trip;
}

export async function mockUpdateTrip(
  id: string,
  input: UpdateTripInput,
): Promise<Trip> {
  await wait(500);
  const index = trips.findIndex((trip) => trip.id === id);

  if (index === -1) {
    throw new Error('Viagem não encontrada');
  }

  // Simula o 409 do back-end: dias além da nova duração que já têm atividades.
  const newDuration = getTripDays(input.startDate, input.endDate);
  const conflicts: DayConflict[] = Object.entries(activitiesByTrip[id] ?? {})
    .map(([day, count]) => ({ dayNumber: Number(day), activityCount: count }))
    .filter((conflict) => conflict.dayNumber > newDuration);

  const { resolutions, ...tripInput } = input;

  if (conflicts.length > 0) {
    if (!resolutions?.length) {
      throw new ApiError(409, {
        status: 409,
        message:
          'Cannot shorten trip: activities exist on days outside the new period',
        conflicts,
      });
    }

    if (!areValidResolutions(conflicts, resolutions, newDuration)) {
      throw new ApiError(400, {
        status: 400,
        message: INVALID_DURATION_MESSAGE,
      });
    }

    applyResolutions(activitiesByTrip[id], resolutions);
  }

  trips[index] = { ...tripInput, id };
  return trips[index];
}

// Mesmas regras de TripService.validateResolutions: uma escolha por dia em conflito.
function areValidResolutions(
  conflicts: DayConflict[],
  resolutions: DayResolution[],
  newDuration: number,
): boolean {
  const days = new Set(resolutions.map((resolution) => resolution.dayNumber));
  return (
    days.size === resolutions.length &&
    resolutions.length === conflicts.length &&
    conflicts.every((conflict) => days.has(conflict.dayNumber)) &&
    resolutions.every(
      (resolution) =>
        resolution.action === 'REMOVE' ||
        (resolution.targetDay >= 1 && resolution.targetDay <= newDuration),
    )
  );
}

function applyResolutions(
  activities: Record<number, number>,
  resolutions: DayResolution[],
) {
  resolutions.forEach((resolution) => {
    const count = activities[resolution.dayNumber];
    delete activities[resolution.dayNumber];

    if (resolution.action === 'MOVE') {
      activities[resolution.targetDay] =
        (activities[resolution.targetDay] ?? 0) + count;
    }
  });
}

export async function mockGetTripDeletionSummary(
  id: string,
): Promise<TripDeletionSummary> {
  await wait(300);
  return (
    deletionSummaryByTrip[id] ?? {
      itineraryCount: 0,
      publishedItineraryCount: 0,
      favoriteCount: 0,
    }
  );
}

export async function mockDeleteTrip(id: string): Promise<void> {
  await wait(500);
  const index = trips.findIndex((trip) => trip.id === id);

  if (index === -1) {
    throw new Error('Viagem não encontrada');
  }

  trips.splice(index, 1);
  delete deletionSummaryByTrip[id];
  delete activitiesByTrip[id];
}

export async function mockSearchDestinations(
  query: string,
): Promise<Destination[]> {
  await wait(300);
  const search = query.trim().toLowerCase();
  return destinations.filter((destination) =>
    destination.city.toLowerCase().includes(search),
  );
}
