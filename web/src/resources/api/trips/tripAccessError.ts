import { ApiError, getApiMessage } from '../../client/http';

// Um destino inexistente também retorna 404. Nesse caso, a viagem continua acessível.
export function isTripAccessError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 403 ||
      (error.status === 404 &&
        getApiMessage(error) !== 'Destination not found'))
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
