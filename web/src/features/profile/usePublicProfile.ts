import { useQuery } from '@tanstack/react-query';
import { getPublicProfile } from '../../services/usersService';

export function usePublicProfile(id: string) {
  return useQuery({
    queryKey: ['publicProfile', id],
    queryFn: () => getPublicProfile(id),
    enabled: Boolean(id),
  });
}
