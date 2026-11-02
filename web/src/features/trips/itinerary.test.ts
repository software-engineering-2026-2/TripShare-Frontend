import { describe, expect, it } from 'vitest';
import type { TripActivity } from '../../services/tripsService';
import {
  formatDayLabel,
  formatDuration,
  formatTime,
  getTimeOfDay,
  optimizeOrder,
  scheduleInOrder,
  toMinutes,
  travelMinutes,
} from './itinerary';

const lodging = { x: 0, y: 0 };

function activity(
  name: string,
  x: number,
  durationMinutes = 60,
  startsAt: string | null = null,
): TripActivity {
  return {
    id: name,
    dayNumber: 1,
    name,
    location: 'Centro',
    durationMinutes,
    startsAt,
    mapPosition: { x, y: 0 },
  };
}

describe('formatação de horários', () => {
  it('converte e formata horários', () => {
    expect(toMinutes('08:30')).toBe(510);
    expect(formatTime(510)).toBe('08:30');
  });

  it('volta para 00:00 depois da meia-noite', () => {
    expect(formatTime(24 * 60 + 15)).toBe('00:15');
  });

  it('formata durações em horas e minutos', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(120)).toBe('2 h');
    expect(formatDuration(105)).toBe('1 h 45 min');
  });

  it('identifica o turno do horário', () => {
    expect(getTimeOfDay(toMinutes('09:00'))).toBe('morning');
    expect(getTimeOfDay(toMinutes('13:00'))).toBe('afternoon');
    expect(getTimeOfDay(toMinutes('19:00'))).toBe('evening');
    expect(getTimeOfDay(24 * 60 + 30)).toBe('night');
  });

  it('monta o rótulo do dia a partir da data de início', () => {
    expect(formatDayLabel('2027-01-31', 1)).toBe('Dia 1 · 31/01');
    expect(formatDayLabel('2027-01-31', 2)).toBe('Dia 2 · 01/02');
  });
});

describe('travelMinutes', () => {
  it('estima o deslocamento pela distância no mapa', () => {
    expect(travelMinutes({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(6);
    expect(travelMinutes({ x: 0, y: 0 }, { x: 180, y: 0 })).toBe(16);
  });
});

describe('scheduleInOrder', () => {
  it('calcula horários a partir da saída da hospedagem', () => {
    const schedule = scheduleInOrder(
      [activity('A', 180, 60), activity('B', 360, 30)],
      lodging,
      '08:00',
    );

    expect(schedule.items.map((item) => [item.start, item.end])).toEqual([
      [toMinutes('08:16'), toMinutes('09:16')],
      [toMinutes('09:32'), toMinutes('10:02')],
    ]);
    expect(schedule.returnTravelMinutes).toBe(26);
    expect(schedule.returnArrival).toBe(toMinutes('10:28'));
  });

  it('espera pelo horário fixo e marca atraso quando chega depois', () => {
    const schedule = scheduleInOrder(
      [activity('Cedo', 0, 30, '10:00'), activity('Tarde', 0, 60, '10:15')],
      lodging,
      '08:00',
    );

    expect(schedule.items[0].start).toBe(toMinutes('10:00'));
    expect(schedule.items[0].waitMinutes).toBe(114);
    expect(schedule.items[0].late).toBe(false);
    expect(schedule.items[1].late).toBe(true);
  });
});

describe('optimizeOrder', () => {
  it('visita primeiro os lugares mais próximos', () => {
    const ordered = optimizeOrder(
      [activity('Longe', 900), activity('Perto', 100), activity('Meio', 500)],
      lodging,
    );

    expect(ordered.map((item) => item.name)).toEqual([
      'Perto',
      'Meio',
      'Longe',
    ]);
  });

  it('respeita horários fixos mesmo quando o lugar é mais longe', () => {
    const ordered = optimizeOrder(
      [activity('Perto', 50, 120), activity('Show', 900, 60, '09:00')],
      lodging,
      '08:00',
    );

    expect(ordered.map((item) => item.name)).toEqual(['Show', 'Perto']);
  });

  it('deixa para a madrugada os horários antes da saída', () => {
    const ordered = optimizeOrder(
      [activity('Samba', 10, 90, '00:15'), activity('Museu', 900, 60)],
      lodging,
      '08:00',
    );

    expect(ordered.map((item) => item.name)).toEqual(['Museu', 'Samba']);
  });
});
