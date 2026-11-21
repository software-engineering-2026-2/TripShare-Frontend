const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function validateUsername(value: string): string | undefined {
  if (!value.trim()) {
    return 'Informe seu nome de usuário.';
  }

  if (value.trim().length > 50) {
    return 'Nome de usuário deve ter no máximo 50 caracteres.';
  }

  return undefined;
}

export function validateName(value: string): string | undefined {
  if (!value.trim()) {
    return 'Informe seu nome de exibição.';
  }

  if (value.trim().length > 120) {
    return 'Nome deve ter no máximo 120 caracteres.';
  }

  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const email = value.trim();

  if (!email) {
    return 'Informe seu e-mail.';
  }

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return 'Informe um e-mail válido.';
  }

  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) {
    return 'Informe sua senha.';
  }

  return undefined;
}

export function validatePasswordConfirmation(
  value: string,
  password: string,
): string | undefined {
  if (!value) {
    return 'Confirme sua senha.';
  }

  if (value !== password) {
    return 'As senhas não coincidem.';
  }

  return undefined;
}
