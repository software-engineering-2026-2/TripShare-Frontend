import { ApiError } from '../../services/api';

// Dia fora do novo período que já tem atividades (PATCH /trips/{id} responde 409).
export interface DayConflict {
  dayNumber: number;
  activityCount: number;
}

// Mensagem do back-end para TripException.INVALID_PERIOD (o 400 também cobre corpo inválido).
const INVALID_PERIOD_MESSAGE = 'End date cannot be before start date';

export function getPeriodConflicts(error: unknown): DayConflict[] | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null;
  const conflicts = (error.body as { conflicts?: DayConflict[] } | null)
    ?.conflicts;
  return conflicts?.length ? conflicts : null;
}

export function isInvalidPeriodError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 400 &&
    (error.body as { message?: string } | null)?.message ===
      INVALID_PERIOD_MESSAGE
  );
}
