import { useQuery } from '@tanstack/react-query';
import { getPlace } from '../../services/placesService';

export function usePlace(id: string) {
  return useQuery({
    queryKey: ['places', id],
    queryFn: () => getPlace(id),
  });
}
