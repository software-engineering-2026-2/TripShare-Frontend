import { request } from './api';
import { mockGetPlace, mockGetPlaces } from './placesMock';

// Remover junto com placesMock.ts quando o back-end estiver pronto.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Tipos provisórios, baseados nas tabelas places, place_categories, place_images e
// place_opening_hours do back-end; devem ser substituídos pelos gerados a partir do OpenAPI.
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
}

// Endpoint ainda não confirmado com o back-end.
export function getPlaces(): Promise<Place[]> {
  if (USE_MOCKS) return mockGetPlaces();
  return request<Place[]>('/places');
}

// Endpoint previsto no back-end (RF-08): GET /places/{id}
export function getPlace(id: string): Promise<Place> {
  if (USE_MOCKS) return mockGetPlace(id);
  return request<Place>(`/places/${encodeURIComponent(id)}`);
}
