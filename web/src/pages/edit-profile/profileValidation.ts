const E164_PATTERN = /^\+[1-9]\d{1,14}$/;

export const PROFILE_LIMITS = {
  name: 120,
  phone: 32,
  bio: 500,
  hometown: 120,
} as const;

export function validateProfileName(value: string): string | undefined {
  const name = value.trim();

  if (!name) {
    return 'Informe seu nome de exibição.';
  }

  if (name.length > PROFILE_LIMITS.name) {
    return `Nome deve ter no máximo ${PROFILE_LIMITS.name} caracteres.`;
  }

  return undefined;
}

export function validateProfilePhone(value: string): string | undefined {
  const phone = value.trim();

  if (!phone) {
    return undefined;
  }

  if (phone.length > PROFILE_LIMITS.phone) {
    return `Telefone deve ter no máximo ${PROFILE_LIMITS.phone} caracteres.`;
  }

  if (!E164_PATTERN.test(phone)) {
    return 'Informe o telefone no formato E.164 (ex.: +5583999999999).';
  }

  return undefined;
}

export function validateProfileBio(value: string): string | undefined {
  if (value.trim().length > PROFILE_LIMITS.bio) {
    return `Biografia deve ter no máximo ${PROFILE_LIMITS.bio} caracteres.`;
  }

  return undefined;
}

export function validateProfileHometown(value: string): string | undefined {
  if (value.trim().length > PROFILE_LIMITS.hometown) {
    return `Cidade de origem deve ter no máximo ${PROFILE_LIMITS.hometown} caracteres.`;
  }

  return undefined;
}
