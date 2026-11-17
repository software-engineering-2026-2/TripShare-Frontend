// Dados falsos para visualizar as telas sem back-end (ativados com VITE_USE_MOCKS=true)
// Vou apagar isso quando a API tiver pronta
import type { CreateTripInput, Destination, Trip } from './tripsService';

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

export async function mockSearchDestinations(
  query: string,
): Promise<Destination[]> {
  await wait(300);
  const search = query.trim().toLowerCase();
  return destinations.filter((destination) =>
    destination.city.toLowerCase().includes(search),
  );
}
