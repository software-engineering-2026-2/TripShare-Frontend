import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../services/api';

const MAX_RETRIES = 3;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Erros 4xx não mudam ao repetir; só falhas de rede e do servidor valem nova tentativa.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status < 500) {
          return false;
        }

        return failureCount < MAX_RETRIES;
      },
    },
  },
});
