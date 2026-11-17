import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTrip,
  deleteTrip,
  getTripDeletionSummary,
  getTrips,
  updateTrip,
  type UpdateTripInput,
} from '../../services/tripsService';
import { isTripAccessError } from './tripAccessError';

// Em 403/404 a viagem não é (mais) do usuário: recarrega só a lista, sem refazer o resumo de exclusão.
function useRefreshTripsOnAccessError() {
  const queryClient = useQueryClient();

  return (error: unknown) => {
    if (isTripAccessError(error)) {
      queryClient.invalidateQueries({ queryKey: ['trips'], exact: true });
    }
  };
}

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: getTrips,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  const refreshTripsOnAccessError = useRefreshTripsOnAccessError();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTripInput }) =>
      updateTrip(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: refreshTripsOnAccessError,
  });
}

export function useTripDeletionSummary(id: string | undefined) {
  const refreshTripsOnAccessError = useRefreshTripsOnAccessError();

  return useQuery({
    queryKey: ['trips', id, 'deletion-summary'],
    queryFn: async () => {
      try {
        return await getTripDeletionSummary(id!);
      } catch (error) {
        refreshTripsOnAccessError(error);
        throw error;
      }
    },
    enabled: !!id,
    // Repetir não muda um 403/404.
    retry: (failureCount, error) =>
      !isTripAccessError(error) && failureCount < 3,
    // As contagens mudam fora desta tela; busca de novo a cada abertura da confirmação.
    staleTime: 0,
    gcTime: 0,
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  const refreshTripsOnAccessError = useRefreshTripsOnAccessError();

  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      // `exact`: sem ele o resumo da viagem excluída seria buscado de novo (e daria 404).
      queryClient.invalidateQueries({ queryKey: ['trips'], exact: true });
    },
    onError: refreshTripsOnAccessError,
  });
}
