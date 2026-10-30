import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCurrentUserProfile,
  type UserProfile,
} from '../../services/authService';
import {
  updateMyProfile,
  type PublicProfile,
  type UpdateProfileInput,
} from '../../services/usersService';

export const currentUserProfileQueryKey = ['currentUserProfile'] as const;

export function useCurrentUserProfile() {
  return useQuery({
    queryKey: currentUserProfileQueryKey,
    queryFn: getCurrentUserProfile,
  });
}

export function useUpdateCurrentUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateMyProfile(input),
    onSuccess: (profile: UserProfile) => {
      queryClient.setQueryData(currentUserProfileQueryKey, profile);

      const publicProfile: PublicProfile = {
        username: profile.username,
        name: profile.name,
        bio: profile.bio,
        hometown: profile.hometown,
      };

      queryClient.setQueryData(['publicProfile', profile.id], publicProfile);
    },
  });
}
