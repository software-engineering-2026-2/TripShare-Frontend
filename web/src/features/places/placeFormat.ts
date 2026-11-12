import type { OpeningHours, PlaceCategory } from '../../services/placesService';

export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  BEACH: 'Praia',
  TRAIL: 'Trilha',
  RESTAURANT: 'Restaurante',
  CAFE: 'Café',
  MUSEUM: 'Museu',
  LANDMARK: 'Ponto turístico',
  WINERY: 'Vinícola',
};

// O back-end pode enviar HH:MM:SS.
export function formatTime(time: string): string {
  return time.slice(0, 5);
}

// Date.getDay() começa no domingo (0); o back-end usa 1 = segunda ... 7 = domingo.
function toWeekday(date: Date): number {
  return ((date.getDay() + 6) % 7) + 1;
}

export function formatTodayHours(
  openingHours: OpeningHours[],
  today = new Date(),
): string {
  if (openingHours.length === 0) return 'Horário não informado';

  const weekday = toWeekday(today);
  const periods = openingHours
    .filter((period) => period.weekday === weekday)
    .sort((a, b) => a.opensAt.localeCompare(b.opensAt));

  if (periods.length === 0) return 'Fechado hoje';

  const isOpenAllDay = periods.some(
    (period) => period.closesNextDay && period.opensAt === period.closesAt,
  );
  if (isOpenAllDay) return 'Aberto 24 horas';

  const ranges = periods.map(
    (period) =>
      `${formatTime(period.opensAt)} – ${formatTime(period.closesAt)}`,
  );
  return `Hoje: ${ranges.join(', ')}`;
}
