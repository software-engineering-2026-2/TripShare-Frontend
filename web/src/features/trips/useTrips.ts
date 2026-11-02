import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTrip,
  getTrip,
  getTripActivities,
  getTrips,
  updateTrip,
  type UpdateTripInput,
} from '../../services/tripsService';

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: getTrips,
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: () => getTrip(id),
  });
}

export function useTripActivities(tripId: string) {
  return useQuery({
    queryKey: ['trips', tripId, 'activities'],
    queryFn: () => getTripActivities(tripId),
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

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTripInput }) =>
      updateTrip(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
