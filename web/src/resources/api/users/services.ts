import type { UserProfile } from '../auth/contract';
import { requestAuthenticated } from '../../client/tripshare';
import { apiRoutes } from '../paths';

import type { PublicUserProfile, UpdateUserInput } from './contract';

export async function getUserById(
  id: string,
  signal?: AbortSignal,
): Promise<PublicUserProfile> {
  return requestAuthenticated<PublicUserProfile>(apiRoutes.users.profile(id), {
    method: 'GET',
    signal,
  });
}

// Sempre altera o perfil do usuário autenticado, identificado pelo token.
export async function updateCurrentUser(
  input: UpdateUserInput,
): Promise<UserProfile> {
  return requestAuthenticated<UserProfile>(apiRoutes.users.me, {
    method: 'PATCH',
    body: input,
  });
}
