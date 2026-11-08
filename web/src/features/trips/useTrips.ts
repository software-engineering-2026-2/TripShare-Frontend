import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTrip,
  deleteTrip,
  getTripDeletionSummary,
  getTrips,
} from '../../services/tripsService';

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

export function useTripDeletionSummary(id: string | undefined) {
  return useQuery({
    queryKey: ['trips', id, 'deletion-summary'],
    queryFn: () => getTripDeletionSummary(id!),
    enabled: !!id,
    // As contagens mudam fora desta tela; busca de novo a cada abertura da confirmação.
    staleTime: 0,
    gcTime: 0,
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
