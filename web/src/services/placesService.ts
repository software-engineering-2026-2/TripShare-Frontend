import { request } from './api';
import { getIdToken } from './authService';
import { mockGetPlaces } from './placesMock';

// Remover junto com placesMock.ts quando o back-end estiver pronto.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Tipos baseados nas tabelas places, place_categories, place_images e place_opening_hours do back-end.
export type PlaceCategory =
  | 'BEACH'
  | 'TRAIL'
  | 'RESTAURANT'
  | 'CAFE'
  | 'MUSEUM'
  | 'LANDMARK'
  | 'WINERY';

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

export interface Place {
  id: string;
  name: string;
  categories: PlaceCategory[];
  neighborhood: string | null;
  photo: PlacePhoto | null;
  // Lista vazia significa horário desconhecido, não local fechado.
  openingHours: OpeningHours[];
}

export interface PlacesPage {
  content: Place[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

interface PlaceSummaryResponse {
  id: string;
  name: string;
  neighborhood?: string | null;
  categories?: string[] | null;
  images?: PlacePhoto[] | null;
  openingHours?: OpeningHours[] | null;
}

interface PlacesPageResponse {
  content: PlaceSummaryResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

const PLACE_CATEGORIES: readonly PlaceCategory[] = [
  'BEACH',
  'TRAIL',
  'RESTAURANT',
  'CAFE',
  'MUSEUM',
  'LANDMARK',
  'WINERY',
];

function isPlaceCategory(code: string): code is PlaceCategory {
  return (PLACE_CATEGORIES as readonly string[]).includes(code);
}

function toShortTime(time: string): string {
  return time.slice(0, 5);
}

function toPlace(item: PlaceSummaryResponse): Place {
  return {
    id: item.id,
    name: item.name,
    categories: (item.categories ?? []).filter(isPlaceCategory),
    neighborhood: item.neighborhood ?? null,
    photo: item.images?.[0] ?? null,
    openingHours: (item.openingHours ?? []).map((period) => ({
      ...period,
      opensAt: toShortTime(period.opensAt),
      closesAt: toShortTime(period.closesAt),
    })),
  };
}

// RF-09: GET /trips/{id}/places?page=0&size=20
export async function getPlaces(
  tripId: string,
  page = 0,
  size = 20,
): Promise<PlacesPage> {
  if (USE_MOCKS) return mockGetPlaces(page, size);

  const token = await getIdToken();
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  const response = await request<PlacesPageResponse>(
    `/trips/${encodeURIComponent(tripId)}/places?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return {
    ...response,
    content: response.content.map(toPlace),
  };
}
