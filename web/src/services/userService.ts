import { getIdToken, type UserProfile } from './authService';
import { request } from './api';

// Resposta de GET /users/{id}: só os dados públicos do perfil, sem id,
// e-mail ou telefone.
export interface PublicUserProfile {
  username: string;
  name: string;
  bio: string | null;
  hometown: string | null;
}

export type UpdateUserInput = Partial<
  Pick<UserProfile, 'name' | 'phone' | 'bio' | 'hometown'>
>;

export async function getUserById(id: string): Promise<PublicUserProfile> {
  const token = await getIdToken();

  return request<PublicUserProfile>(`/users/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Sempre altera o perfil do usuário autenticado, identificado pelo token.
export async function updateCurrentUser(
  input: UpdateUserInput,
): Promise<UserProfile> {
  const token = await getIdToken();

  return request<UserProfile>('/users/me', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}
