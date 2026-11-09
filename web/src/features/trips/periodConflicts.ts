import { ApiError } from '../../services/api';

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

// Mensagem de TripException.INVALID_DURATION, que o back também usa para `resolutions` inválidas.
export const INVALID_DURATION_MESSAGE =
  'Trip must specify a valid date range or a positive duration in days';

function isBadRequestWithMessage(error: unknown, message: string): boolean {
  return (
    error instanceof ApiError &&
    error.status === 400 &&
    (error.body as { message?: string } | null)?.message === message
  );
}

export function getPeriodConflicts(error: unknown): DayConflict[] | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null;
  const conflicts = (error.body as { conflicts?: DayConflict[] } | null)
    ?.conflicts;
  return conflicts?.length ? conflicts : null;
}

export function isInvalidPeriodError(error: unknown): boolean {
  return isBadRequestWithMessage(error, INVALID_PERIOD_MESSAGE);
}

export function isInvalidResolutionError(error: unknown): boolean {
  return isBadRequestWithMessage(error, INVALID_DURATION_MESSAGE);
}
