import { QueryClient } from '@tanstack/react-query';
import { ApiError, ApiTransportError } from '../../resources/client/http';

export function retryRead(failureCount: number, error: unknown) {
  if (failureCount >= 3) return false;
  if (error instanceof ApiError) return error.status >= 500;
  if (error instanceof ApiTransportError) return error.kind !== 'response';
  return error instanceof TypeError;
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: retryRead },
      mutations: { retry: false, networkMode: 'always' },
    },
  });
}
