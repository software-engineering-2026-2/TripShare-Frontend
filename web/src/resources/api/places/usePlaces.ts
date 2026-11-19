import { useQuery } from '@tanstack/react-query';
import { useSession } from '../../../providers/session';
import { getPlaces } from './services';
import { tripQueryKeys } from '../trips/tripQueryKeys';

export function usePlaces(tripId: string | undefined, page = 0, size = 20) {
  const { uid } = useSession();
  return useQuery({
    queryKey: [...tripQueryKeys.detail(uid, tripId), 'places', page, size],
    queryFn: ({ signal }) => {
      if (!tripId) throw new Error('Viagem não selecionada.');
      return getPlaces(tripId, page, size, signal);
    },
    enabled: Boolean(tripId),
  });
}
