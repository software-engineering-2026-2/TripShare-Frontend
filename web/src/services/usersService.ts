import { getIdToken, type UserProfile } from './authService';
import { request } from './api';

// Contrato público de perfil: nunca inclua dados privados (email, telefone, authId).
export interface PublicProfile {
  username: string;
  name: string;
  bio: string | null;
  hometown: string | null;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  bio?: string;
  hometown?: string;
}

export async function getPublicProfile(id: string): Promise<PublicProfile> {
  const token = await getIdToken();

  return request<PublicProfile>(`/users/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateMyProfile(
  input: UpdateProfileInput,
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
