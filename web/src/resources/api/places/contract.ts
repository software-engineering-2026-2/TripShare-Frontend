import type { ApiPage } from '../../client/http';

export type PlaceCategory =
  'BEACH' | 'TRAIL' | 'RESTAURANT' | 'CAFE' | 'MUSEUM' | 'LANDMARK' | 'WINERY';

export interface PlacePhoto {
  url: string;
  altText: string | null;
}

export interface OpeningHours {
  // 1 = segunda-feira ... 7 = domingo
  weekday: number;
  // HH:MM
  opensAt: string;
  closesAt: string;
  closesNextDay: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  categories: PlaceCategory[];
  neighborhood: string | null;
  photo: PlacePhoto | null;
  // Lista vazia significa horário desconhecido, não local fechado.
  openingHours: OpeningHours[];
  // Campos usados na tela de detalhes (RF-08); a lista de cards não depende deles.
  description?: string | null;
  coordinates?: Coordinates | null;
  address?: string | null;
  estimatedDurationMinutes?: number | null;
  // Texto livre enquanto o formato de custos não é definido com o back-end.
  cost?: string | null;
  // De onde vieram as informações do local (ex.: OpenStreetMap).
  source?: string | null;
}

export type PlacesPage = ApiPage<Place>;

// DTO de GET /trips/{id}/places. Dados extras dos mocks pertencem a Place.
export interface PlaceResponse {
  id: string;
  name: string;
  address: string | null;
  neighborhood: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  estimatedVisitMinutes: number | null;
  estimatedCost: number | null;
  currency: string | null;
}
