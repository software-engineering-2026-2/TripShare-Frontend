// Dados falsos para visualizar as telas sem back-end (ativados com VITE_USE_MOCKS=true)
// Vou apagar isso quando a API tiver pronta
import type {
  CreateTripInput,
  Destination,
  Trip,
  TripActivities,
  TripActivity,
  UpdateTripInput,
} from './tripsService';

const destinations: Destination[] = [
  { city: 'Rio de Janeiro', region: 'Rio de Janeiro', country: 'Brasil' },
  { city: 'São Paulo', region: 'São Paulo', country: 'Brasil' },
  { city: 'Lisboa', region: 'Lisboa', country: 'Portugal' },
  { city: 'Paris', region: 'Île-de-France', country: 'França' },
  { city: 'Paris', region: 'Texas', country: 'Estados Unidos' },
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

const activitiesByTrip: Record<string, TripActivity[]> = {
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

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockGetTrips(): Promise<Trip[]> {
  await wait(500);
  return [...trips];
}

export async function mockGetTrip(id: string): Promise<Trip> {
  await wait(300);
  const trip = trips.find((item) => item.id === id);

  if (!trip) {
    throw new Error('Viagem não encontrada');
  }

  return trip;
}

export async function mockGetTripActivities(
  tripId: string,
): Promise<TripActivities> {
  await wait(300);
  return { lodging, activities: activitiesByTrip[tripId] ?? [] };
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

  trips[index] = { ...input, id };
  return trips[index];
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
