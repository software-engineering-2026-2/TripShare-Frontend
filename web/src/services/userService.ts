import { getIdToken } from './authService';
import { request } from './api';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  hometown: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export type UpdateUserInput = Partial<
  Pick<UserProfile, 'name' | 'phone' | 'bio' | 'hometown'>
>;

export async function getUserById(id: string): Promise<UserProfile> {
  return request<UserProfile>(`/users/${encodeURIComponent(id)}`);
}

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
