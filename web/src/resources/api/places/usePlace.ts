import { retryRead } from '../../../commons/react-query/queryClient';
import { USE_MOCKS } from '../../../commons/config/env';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../../client/http';
import { getPlace } from './services';
import { useSession } from '../../../providers/session';

// 404 (não encontrado) ou 410 (removido): o local saiu do catálogo.
export function isPlaceRemovedError(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 404 || error.status === 410)
  );
}

export function usePlace(id: string) {
  const { uid } = useSession();
  return useQuery({
    queryKey: ['places', uid, id],
    queryFn: () => getPlace(id),
    enabled: USE_MOCKS && Boolean(id),
    retry: retryRead,
  });
}
