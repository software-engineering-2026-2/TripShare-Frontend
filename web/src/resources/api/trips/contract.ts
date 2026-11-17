import type { DayResolution } from './periodConflicts';
import type { ApiPage } from '../../client/http';

export interface Destination {
  id: string;
  city: string;
  region: string | null;
  country: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: Destination;
  startDate: string | null;
  endDate: string | null;
  durationDays: number;
}

interface TripFields {
  title: string;
  destinationId: string;
  startsOn: string | null;
  endsOn: string | null;
  durationDays: number | null;
}

export type CreateTripInput = Pick<TripFields, 'title' | 'destinationId'> &
  Partial<Pick<TripFields, 'startsOn' | 'endsOn' | 'durationDays'>>;

export type UpdateTripInput = Partial<{
  [Field in keyof TripFields]: TripFields[Field] | null;
}> & {
  resolutions?: DayResolution[] | null;
};

export interface ItineraryImpact {
  id: string;
  title: string;
  published: boolean;
  favoriteCount: number;
  inRanking: boolean;
}

export type TripDeletionPreview = ApiPage<ItineraryImpact>;

// Coordenadas do mapa ilustrativo do modo de demonstração.
export interface MapPosition {
  x: number;
  y: number;
}

export interface TripActivity {
  id: string;
  dayNumber: number;
  name: string;
  location: string;
  durationMinutes: number;
  startsAt: string | null;
  mapPosition: MapPosition;
}

export interface TripActivities {
  lodging: { name: string; mapPosition: MapPosition };
  activities: TripActivity[];
}

export interface TripResponse {
  id: string;
  userId: string;
  destinationId: string;
  destinationName: string;
  destinationRegion: string | null;
  destinationCountryCode: string;
  title: string;
  startsOn: string | null;
  endsOn: string | null;
  durationDays: number;
  createdAt: string;
  updatedAt: string;
}
