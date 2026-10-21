import type { Destination } from '../../services/tripsService';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Datas chegam como AAAA-MM-DD; convertemos em UTC para não sofrer com fuso horário.
function toUtcTime(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function formatDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

export function getTripDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) {
    return 0;
  }

  const difference = toUtcTime(endDate) - toUtcTime(startDate);

  if (difference < 0) {
    return 0;
  }

  return Math.round(difference / DAY_IN_MS) + 1;
}

export function formatTripPeriod(startDate: string, endDate: string): string {
  if (startDate === endDate) {
    return formatDate(startDate);
  }

  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export function formatDayCount(days: number): string {
  return days === 1 ? '1 dia' : `${days} dias`;
}

export function formatDestination(destination: Destination): string {
  return [destination.city, destination.region, destination.country]
    .filter(Boolean)
    .join(', ');
}

export function validateTitle(value: string): string | undefined {
  if (!value.trim()) {
    return 'Informe o título da viagem.';
  }

  return undefined;
}

export function validateDestination(value: string): string | undefined {
  if (!value.trim()) {
    return 'Informe o destino.';
  }

  return undefined;
}

export function validateStartDate(value: string): string | undefined {
  if (!value) {
    return 'Informe a data de início.';
  }

  return undefined;
}

export function validateEndDate(
  value: string,
  startDate: string,
): string | undefined {
  if (!value) {
    return 'Informe a data de término.';
  }

  if (startDate && value < startDate) {
    return 'A data de término não pode ser antes da data de início.';
  }

  return undefined;
}
