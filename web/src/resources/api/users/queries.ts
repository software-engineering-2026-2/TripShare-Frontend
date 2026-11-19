import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../../../providers/session';
import { getCurrentUserProfile } from '../../auth/flow';
import { getUserById } from './services';
import type { UserProfile } from '../auth/contract';

const profileKeys = {
  current: (uid: string | null) => ['users', uid, 'current'] as const,
  public: (uid: string | null, id: string) =>
    ['users', uid, 'public', id] as const,
};

export function useCurrentProfile(enabled: boolean) {
  const { uid } = useSession();
  return useQuery({
    queryKey: profileKeys.current(uid),
    queryFn: ({ signal }) => getCurrentUserProfile(signal),
    enabled,
  });
}

export function usePublicProfile(id: string, enabled: boolean) {
  const { uid } = useSession();
  return useQuery({
    queryKey: profileKeys.public(uid, id),
    queryFn: ({ signal }) => getUserById(id, signal),
    enabled,
  });
}

export function useRefreshProfile() {
  const client = useQueryClient();
  const { uid } = useSession();

  return (profile: UserProfile) => {
    client.setQueryData(profileKeys.current(uid), profile);
    void client.invalidateQueries({
      queryKey: profileKeys.public(uid, profile.id),
      exact: true,
    });
  };
}
