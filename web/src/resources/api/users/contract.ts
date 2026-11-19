// Resposta de GET /users/{id}: só os dados públicos do perfil, sem id,
// e-mail ou telefone.
export interface PublicUserProfile {
  username: string;
  name: string;
  bio: string | null;
  hometown: string | null;
}

export type UpdateUserInput = Partial<
  Record<'name' | 'phone' | 'bio' | 'hometown', string | null>
>;
