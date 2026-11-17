import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../../services/api';
import { getPlace } from '../../services/placesService';

const MAX_RETRIES = 3;

// 404 (não encontrado) ou 410 (removido): o local saiu do catálogo.
export function isPlaceRemovedError(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 404 || error.status === 410)
  );
}

export function usePlace(id: string) {
  return useQuery({
    queryKey: ['places', id],
    queryFn: () => getPlace(id),
    // Tentar de novo não traz de volta um local removido do catálogo.
    retry: (failureCount, error) =>
      !isPlaceRemovedError(error) && failureCount < MAX_RETRIES,
  });
}
