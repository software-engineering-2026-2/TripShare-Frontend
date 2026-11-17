import { ApiError, getApiMessage } from '../../client/http';

// Dia fora do novo período que já tem atividades (PATCH /trips/{id} responde 409).
export interface DayConflict {
  dayNumber: number;
  activityCount: number;
}

// Escolha para um dia em conflito, enviada em `resolutions` no PATCH /trips/{id}.
export type DayResolution =
  | { dayNumber: number; action: 'MOVE'; targetDay: number }
  | { dayNumber: number; action: 'REMOVE' };

// Mensagem do back-end para TripException.INVALID_PERIOD (o 400 também cobre corpo inválido).
const INVALID_PERIOD_MESSAGE = 'End date cannot be before start date';

export const INVALID_RESOLUTIONS_MESSAGE = 'Invalid day resolutions';

export function isPublicItineraryConflict(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 409 &&
    getApiMessage(error) ===
      'A public itinerary needs an activity with an identified location'
  );
}

function isBadRequestWithMessage(error: unknown, message: string): boolean {
  return (
    error instanceof ApiError &&
    error.status === 400 &&
    getApiMessage(error) === message
  );
}

export function getPeriodConflicts(error: unknown): DayConflict[] | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null;
  const conflicts = (error.body as { conflicts?: DayConflict[] } | null)
    ?.conflicts;
  return Array.isArray(conflicts) &&
    conflicts.length > 0 &&
    conflicts.every(
      (item) =>
        item &&
        Number.isInteger(item.dayNumber) &&
        item.dayNumber > 0 &&
        Number.isInteger(item.activityCount) &&
        item.activityCount > 0,
    )
    ? conflicts
    : null;
}

export function isInvalidPeriodError(error: unknown): boolean {
  return isBadRequestWithMessage(error, INVALID_PERIOD_MESSAGE);
}

export function isInvalidResolutionError(error: unknown): boolean {
  return isBadRequestWithMessage(error, INVALID_RESOLUTIONS_MESSAGE);
}
