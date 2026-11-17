import { request } from './api';
import { getIdToken } from './authService';
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
  address?: string | null;
  estimatedDurationMinutes?: number | null;
  // Texto livre enquanto o formato de custos não é definido com o back-end.
  cost?: string | null;
  // De onde vieram as informações do local (ex.: OpenStreetMap).
  source?: string | null;
}

// Endpoint ainda não confirmado com o back-end.
export function getPlaces(): Promise<Place[]> {
  if (USE_MOCKS) return mockGetPlaces();
  return request<Place[]>('/places');
}

// Resposta do GET /places/{id}. Os campos principais seguem o PlaceResponse do
// back-end; categorias, imagens, horários e fonte ainda precisam ser expostos
// por ele e, enquanto isso, chegam ausentes e aparecem como "Não informado".
export interface PlaceDetailsResponse {
  id: string;
  name: string;
  address: string | null;
  neighborhood: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  estimatedVisitMinutes: number | null;
  estimatedCost: number | null;
  // Código ISO 4217 (ex.: BRL)
  currency: string | null;
  categories?: string[] | null;
  images?: PlacePhoto[] | null;
  openingHours?: OpeningHours[] | null;
  source?: string | null;
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

export function formatCost(
  value: number | null,
  currency: string | null,
): string | null {
  if (value === null || value === undefined) return null;
  if (value === 0) return 'Gratuito';

  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency ?? 'BRL',
    }).format(value);
  } catch {
    // Código de moeda inválido: mostra o valor sem formatar a moeda.
    return `${value} ${currency}`;
  }
}

// O back-end pode enviar horários como HH:MM:SS; a tela usa HH:MM.
function toShortTime(time: string): string {
  return time.slice(0, 5);
}

export function toPlace(response: PlaceDetailsResponse): Place {
  const hasCoordinates =
    response.latitude !== null &&
    response.latitude !== undefined &&
    response.longitude !== null &&
    response.longitude !== undefined;

  return {
    id: response.id,
    name: response.name,
    categories: (response.categories ?? []).filter(isPlaceCategory),
    neighborhood: response.neighborhood ?? null,
    photo: response.images?.[0] ?? null,
    openingHours: (response.openingHours ?? []).map((period) => ({
      ...period,
      opensAt: toShortTime(period.opensAt),
      closesAt: toShortTime(period.closesAt),
    })),
    description: response.description ?? null,
    coordinates: hasCoordinates
      ? {
          latitude: Number(response.latitude),
          longitude: Number(response.longitude),
        }
      : null,
    address: response.address ?? null,
    estimatedDurationMinutes: response.estimatedVisitMinutes ?? null,
    cost: formatCost(response.estimatedCost, response.currency),
    source: response.source ?? null,
  };
}

// RF-08: GET /places/{id}. Responde 404 (ou 410) quando o local saiu do catálogo.
export async function getPlace(id: string): Promise<Place> {
  if (USE_MOCKS) return mockGetPlace(id);

  // Todas as rotas do back-end exigem o token do Firebase.
  const token = await getIdToken();
  const response = await request<PlaceDetailsResponse>(
    `/places/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return toPlace(response);
}
