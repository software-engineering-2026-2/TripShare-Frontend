import { useQuery } from '@tanstack/react-query';
import { getPlaces } from '../../services/placesService';

export function usePlaces(tripId: string | undefined, page = 0, size = 20) {
  return useQuery({
    queryKey: ['places', tripId, page, size],
    queryFn: () => getPlaces(tripId!, page, size),
    enabled: Boolean(tripId),
  });
}
