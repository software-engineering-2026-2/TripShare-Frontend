import { ApiError } from '../../services/api';

// O ErrorResponse do back não tem código (TRIP_FORBIDDEN/TRIP_NOT_FOUND): decide pelo status.
export function isTripAccessError(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 403 || error.status === 404)
  );
}

export function getTripAccessErrorMessage(
  error: unknown,
  action: 'alterar' | 'excluir',
): string | null {
  if (!isTripAccessError(error)) return null;
  return (error as ApiError).status === 403
    ? `Você não tem permissão para ${action} esta viagem.`
    : 'Esta viagem não existe mais.';
}
