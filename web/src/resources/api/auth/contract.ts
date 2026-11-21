export interface RegisterProfileInput {
  username: string;
  name: string;
}

// Perfil completo do usuário autenticado, retornado por /auth/register,
// /auth/login e PATCH /users/me.
export interface UserProfile {
  id: string;
  authId: string;
  // UID do Firebase
  uuid: string;
  username: string;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  hometown: string | null;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}
