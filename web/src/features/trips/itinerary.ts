import type { MapPosition, TripActivity } from '../../services/tripsService';

const MINUTES_IN_DAY = 24 * 60;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Horário em que o dia começa, saindo da hospedagem.
export const DAY_START = '08:00';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export const TIME_OF_DAY: Record<TimeOfDay, { label: string; range: string }> =
  {
    morning: { label: 'Manhã', range: '06:00 – 12:00' },
    afternoon: { label: 'Tarde', range: '12:00 – 18:00' },
    evening: { label: 'Noite', range: '18:00 – 00:00' },
    night: { label: 'Madrugada', range: '00:00 – 06:00' },
  };

export interface ScheduledActivity {
  activity: TripActivity;
  // Minutos desde a meia-noite do dia; passa de 1440 quando entra na madrugada seguinte.
  start: number;
  end: number;
  travelMinutes: number;
  waitMinutes: number;
  // Chegada depois do horário fixo de início
  late: boolean;
}

export interface DaySchedule {
  items: ScheduledActivity[];
  departure: number;
  returnTravelMinutes: number;
  returnArrival: number;
}

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatTime(totalMinutes: number): string {
  const minutes =
    ((Math.round(totalMinutes) % MINUTES_IN_DAY) + MINUTES_IN_DAY) %
    MINUTES_IN_DAY;
  const hours = Math.floor(minutes / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

export function getTimeOfDay(totalMinutes: number): TimeOfDay {
  const minutes =
    ((totalMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;

  if (minutes < 6 * 60) return 'night';
  if (minutes < 12 * 60) return 'morning';
  if (minutes < 18 * 60) return 'afternoon';
  return 'evening';
}

// "Dia 2 · 11/01"
export function formatDayLabel(startDate: string, dayNumber: number): string {
  const [year, month, day] = startDate.split('-').map(Number);
  const date = new Date(
    Date.UTC(year, month - 1, day) + (dayNumber - 1) * DAY_IN_MS,
  );
  const dayOfMonth = String(date.getUTCDate()).padStart(2, '0');
  const monthOfYear = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `Dia ${dayNumber} · ${dayOfMonth}/${monthOfYear}`;
}

// Estimativa provisória pela distância no mapa ilustrativo; o tempo real deve vir do back-end.
export function travelMinutes(from: MapPosition, to: MapPosition): number {
  const distance = Math.hypot(from.x - to.x, from.y - to.y);
  return Math.round(distance / 18 + 6);
}

// Horários antes da saída pertencem à madrugada seguinte.
function fixedStart(activity: TripActivity, departure: number): number | null {
  if (!activity.startsAt) return null;
  const start = toMinutes(activity.startsAt);
  return start < departure ? start + MINUTES_IN_DAY : start;
}

export function scheduleInOrder(
  activities: TripActivity[],
  lodging: MapPosition,
  dayStart = DAY_START,
): DaySchedule {
  const departure = toMinutes(dayStart);
  let now = departure;
  let position = lodging;

  const items = activities.map((activity) => {
    const travel = travelMinutes(position, activity.mapPosition);
    const arrival = now + travel;
    const fixed = fixedStart(activity, departure);
    const start = fixed === null ? arrival : Math.max(arrival, fixed);
    const end = start + activity.durationMinutes;

    now = end;
    position = activity.mapPosition;

    return {
      activity,
      start,
      end,
      travelMinutes: travel,
      waitMinutes: start - arrival,
      late: fixed !== null && arrival > fixed,
    };
  });

  const returnTravelMinutes = travelMinutes(position, lodging);

  return {
    items,
    departure,
    returnTravelMinutes,
    returnArrival: now + returnTravelMinutes,
  };
}

// Escolhe sempre a próxima parada mais próxima, sem perder nenhum horário fixo.
export function optimizeOrder(
  activities: TripActivity[],
  lodging: MapPosition,
  dayStart = DAY_START,
): TripActivity[] {
  const departure = toMinutes(dayStart);
  const remaining = [...activities];
  const ordered: TripActivity[] = [];
  let now = departure;
  let position = lodging;

  while (remaining.length > 0) {
    let best: { activity: TripActivity; score: number } | null = null;

    for (const candidate of remaining) {
      const travel = travelMinutes(position, candidate.mapPosition);
      const arrival = now + travel;
      const fixed = fixedStart(candidate, departure);

      if (fixed !== null && arrival > fixed) continue;

      const end = (fixed ?? arrival) + candidate.durationMinutes;
      const keepsOthersOnTime = remaining.every((other) => {
        const otherFixed = fixedStart(other, departure);
        return (
          other === candidate ||
          otherFixed === null ||
          end + travelMinutes(candidate.mapPosition, other.mapPosition) <=
            otherFixed
        );
      });

      if (!keepsOthersOnTime) continue;

      const score = (fixed ?? arrival) + travel * 0.6;
      if (!best || score < best.score) {
        best = { activity: candidate, score };
      }
    }

    // Sem opção que respeite todos os horários, segue pelo horário fixo mais cedo.
    const chosen =
      best?.activity ??
      [...remaining].sort(
        (a, b) =>
          (fixedStart(a, departure) ?? Infinity) -
          (fixedStart(b, departure) ?? Infinity),
      )[0];

    const arrival = now + travelMinutes(position, chosen.mapPosition);
    const fixed = fixedStart(chosen, departure);
    now = Math.max(arrival, fixed ?? arrival) + chosen.durationMinutes;
    position = chosen.mapPosition;
    ordered.push(chosen);
    remaining.splice(remaining.indexOf(chosen), 1);
  }

  return ordered;
}
