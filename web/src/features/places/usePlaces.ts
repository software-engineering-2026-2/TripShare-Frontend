import { useQuery } from '@tanstack/react-query';
import { getPlaces } from '../../services/placesService';

export function usePlaces() {
  return useQuery({
    queryKey: ['places'],
    queryFn: getPlaces,
  });
}
