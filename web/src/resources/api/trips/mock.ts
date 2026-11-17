import {
  INVALID_RESOLUTIONS_MESSAGE,
  type DayConflict,
  type DayResolution,
} from './periodConflicts';
import { getTripDays } from './tripValidation';
import { ApiError } from '../../client/http';
import type {
  CreateTripInput,
  Destination,
  Trip,
  TripActivities,
  TripActivity,
  ItineraryImpact,
  TripDeletionPreview,
  UpdateTripInput,
} from './contract';

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
    durationDays: 11,
  },
  {
    id: '2',
    title: 'Mochilão na Europa',
    destination: destinations[2],
    startDate: '2027-07-01',
    endDate: '2027-07-15',
    durationDays: 15,
  },
];

// As posições batem com o desenho do Rio em RioMapBase.tsx, por isso só a viagem "1" (Rio) tem lugares.
const lodging = {
  name: 'Hospedagem · Copacabana',
  mapPosition: { x: 655, y: 470 },
};

function activity(
  dayNumber: number,
  name: string,
  location: string,
  durationMinutes: number,
  x: number,
  y: number,
  startsAt: string | null = null,
): TripActivity {
  return {
    id: `${dayNumber}-${name}`,
    dayNumber,
    name,
    location,
    durationMinutes,
    startsAt,
    mapPosition: { x, y },
  };
}

const plannedActivitiesByTrip: Record<string, TripActivity[]> = {
  '1': [
    activity(1, 'Café da manhã na Confeitaria Colombo', 'Centro', 60, 560, 150),
    activity(1, 'Museu do Amanhã', 'Praça Mauá', 105, 610, 95),
    activity(1, 'Escadaria Selarón', 'Lapa', 45, 535, 205),
    activity(1, 'Almoço no Aprazível', 'Santa Teresa', 90, 480, 215, '13:00'),
    activity(1, 'Cristo Redentor', 'Corcovado', 90, 410, 305),
    activity(1, 'Pôr do sol no Arpoador', 'Arpoador', 60, 580, 565, '17:15'),
    activity(1, 'Jantar no Leblon', 'Leblon', 90, 360, 580, '20:00'),
    activity(1, 'Samba na Pedra do Sal', 'Saúde', 90, 590, 130, '00:15'),
    activity(2, 'Bondinho do Pão de Açúcar', 'Urca', 90, 780, 330),
    activity(2, 'Jardim Botânico', 'Jardim Botânico', 90, 315, 425),
    activity(2, 'Parque Lage', 'Jardim Botânico', 60, 355, 395),
    activity(2, 'Instituto Moreira Salles', 'Gávea', 75, 275, 470),
    activity(2, 'Praia de Ipanema', 'Ipanema', 120, 480, 575),
    activity(3, 'Museu de Arte do Rio (MAR)', 'Praça Mauá', 90, 575, 105),
    activity(3, 'Circo Voador', 'Lapa', 120, 545, 235, '21:00'),
  ],
};

// Atividades já planejadas por dia da viagem (número do dia -> quantidade).
const activitiesByTrip: Record<string, Record<number, number>> = {
  '1': { 9: 2, 11: 1 },
};

const itinerariesByTrip: Record<string, ItineraryImpact[]> = {
  '1': [
    {
      id: '1',
      title: 'Centro histórico',
      published: true,
      favoriteCount: 4,
      inRanking: true,
    },
    {
      id: '2',
      title: 'Praias',
      published: false,
      favoriteCount: 0,
      inRanking: false,
    },
    {
      id: '3',
      title: 'Trilhas',
      published: false,
      favoriteCount: 0,
      inRanking: false,
    },
  ],
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mesmo 404 que o back devolve para TripException.TRIP_NOT_FOUND.
function tripNotFound() {
  return new ApiError(404, { status: 404, message: 'Trip not found' });
}

export async function mockGetTrips(): Promise<Trip[]> {
  await wait(500);
  return [...trips];
}

export async function mockGetTrip(id: string): Promise<Trip> {
  await wait(300);
  const trip = trips.find((item) => item.id === id);

  if (!trip) {
    throw tripNotFound();
  }

  return trip;
}

export async function mockGetTripActivities(
  tripId: string,
): Promise<TripActivities> {
  await wait(300);
  return { lodging, activities: plannedActivitiesByTrip[tripId] ?? [] };
}

function findDestination(id: string): Destination {
  const destination = destinations.find((item) => item.id === id);
  if (!destination)
    throw new ApiError(404, { status: 404, message: 'Destination not found' });
  return destination;
}

export async function mockCreateTrip(input: CreateTripInput): Promise<Trip> {
  await wait(500);
  const startDate = input.startsOn ?? null;
  const endDate = input.endsOn ?? null;
  const trip: Trip = {
    id: String(Date.now()),
    title: input.title,
    destination: findDestination(input.destinationId),
    startDate,
    endDate,
    durationDays: input.durationDays ?? getTripDays(startDate, endDate),
  };
  trips.push(trip);
  return trip;
}

export async function mockUpdateTrip(
  id: string,
  input: UpdateTripInput,
): Promise<Trip> {
  await wait(500);
  const index = trips.findIndex((trip) => trip.id === id);
  if (index === -1) throw tripNotFound();

  const current = trips[index];
  const startDate = input.startsOn ?? current.startDate;
  let endDate = input.endsOn ?? current.endDate;
  if (
    startDate &&
    !input.startsOn &&
    !input.endsOn &&
    input.durationDays != null
  ) {
    const end = new Date(`${startDate}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() + input.durationDays - 1);
    endDate = end.toISOString().slice(0, 10);
  }

  const newDuration =
    input.durationDays ??
    (startDate && endDate
      ? getTripDays(startDate, endDate)
      : current.durationDays);
  const destination = input.destinationId
    ? findDestination(input.destinationId)
    : current.destination;
  const conflicts: DayConflict[] = Object.entries(activitiesByTrip[id] ?? {})
    .map(([day, count]) => ({ dayNumber: Number(day), activityCount: count }))
    .filter((conflict) => conflict.dayNumber > newDuration);

  const { resolutions } = input;

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
        message: INVALID_RESOLUTIONS_MESSAGE,
      });
    }

    applyResolutions(activitiesByTrip[id], resolutions);
  }

  trips[index] = {
    id,
    title: input.title ?? current.title,
    destination,
    startDate,
    endDate,
    durationDays: newDuration,
  };
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

export async function mockGetTripDeletionPreview(
  id: string,
  page: number,
  size: number,
): Promise<TripDeletionPreview> {
  await wait(300);
  if (!trips.some((trip) => trip.id === id)) throw tripNotFound();

  const itineraries = itinerariesByTrip[id] ?? [];
  const effectiveSize = Math.min(size, 100);
  const totalPages = Math.ceil(itineraries.length / effectiveSize);
  return {
    content: itineraries.slice(
      page * effectiveSize,
      (page + 1) * effectiveSize,
    ),
    page,
    size: effectiveSize,
    totalElements: itineraries.length,
    totalPages,
    last: page + 1 >= totalPages,
  };
}

export async function mockDeleteTrip(id: string): Promise<void> {
  await wait(500);
  const index = trips.findIndex((trip) => trip.id === id);

  if (index === -1) {
    throw tripNotFound();
  }

  trips.splice(index, 1);
  delete itinerariesByTrip[id];
  delete activitiesByTrip[id];
  delete plannedActivitiesByTrip[id];
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
