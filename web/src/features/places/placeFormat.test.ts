import { describe, expect, it } from 'vitest';
import type { OpeningHours } from '../../services/placesService';
import { formatTodayHours } from './placeFormat';

const MONDAY = new Date(2027, 0, 11);
const SUNDAY = new Date(2027, 0, 10);

function period(
  weekday: number,
  opensAt: string,
  closesAt: string,
  closesNextDay = false,
): OpeningHours {
  return { weekday, opensAt, closesAt, closesNextDay };
}

describe('formatTodayHours', () => {
  it('mostra o horário do dia da semana atual', () => {
    const hours = [period(1, '09:00', '18:00'), period(7, '10:00', '14:00')];

    expect(formatTodayHours(hours, MONDAY)).toBe('Hoje: 09:00 – 18:00');
    expect(formatTodayHours(hours, SUNDAY)).toBe('Hoje: 10:00 – 14:00');
  });

  it('lista os turnos do dia em ordem de abertura', () => {
    const hours = [
      period(1, '19:00', '00:30', true),
      period(1, '12:00', '16:00'),
    ];

    expect(formatTodayHours(hours, MONDAY)).toBe(
      'Hoje: 12:00 – 16:00, 19:00 – 00:30',
    );
  });

  it('ignora os segundos enviados pelo back-end', () => {
    expect(formatTodayHours([period(1, '09:00:00', '18:00:00')], MONDAY)).toBe(
      'Hoje: 09:00 – 18:00',
    );
  });

  it('avisa quando o lugar não abre no dia', () => {
    expect(formatTodayHours([period(2, '09:00', '18:00')], MONDAY)).toBe(
      'Fechado hoje',
    );
  });

  it('avisa quando o lugar fica aberto o dia todo', () => {
    expect(formatTodayHours([period(1, '00:00', '00:00', true)], MONDAY)).toBe(
      'Aberto 24 horas',
    );
  });

  it('trata lista vazia como horário desconhecido', () => {
    expect(formatTodayHours([], MONDAY)).toBe('Horário não informado');
  });
});
