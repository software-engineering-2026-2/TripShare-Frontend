// Tipos locais de apresentação do perfil. Não representam o contrato da API.
export interface PublicProfile {
  id: string;
  username: string;
  name: string;
  bio: string | null;
  hometown: string | null;
}

export interface EditableProfile {
  id: string;
  name: string;
  phone: string | null;
  bio: string | null;
  hometown: string | null;
}

export type UpdateProfileInput = Partial<
  Pick<EditableProfile, 'name' | 'phone' | 'bio' | 'hometown'>
>;
