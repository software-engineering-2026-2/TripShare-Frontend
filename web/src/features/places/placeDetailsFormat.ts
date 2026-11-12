import type { Coordinates, OpeningHours } from '../../services/placesService';
import { formatTime } from './placeFormat';

const WEEKDAY_NAMES = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

export interface WeekdayHours {
  weekday: string;
  hours: string;
}

// Horário da semana inteira, de segunda (1) a domingo (7), no formato do back-end.
export function formatWeekHours(openingHours: OpeningHours[]): WeekdayHours[] {
  return WEEKDAY_NAMES.map((weekday, index) => {
    const periods = openingHours
      .filter((period) => period.weekday === index + 1)
      .sort((a, b) => a.opensAt.localeCompare(b.opensAt));

    if (periods.length === 0) return { weekday, hours: 'Fechado' };

    const isOpenAllDay = periods.some(
      (period) => period.closesNextDay && period.opensAt === period.closesAt,
    );
    if (isOpenAllDay) return { weekday, hours: 'Aberto 24 horas' };

    const ranges = periods.map(
      (period) =>
        `${formatTime(period.opensAt)} – ${formatTime(period.closesAt)}`,
    );
    return { weekday, hours: ranges.join(', ') };
  });
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h${String(rest).padStart(2, '0')}`;
}

export function formatCoordinates({
  latitude,
  longitude,
}: Coordinates): string {
  return `${latitude}, ${longitude}`;
}
