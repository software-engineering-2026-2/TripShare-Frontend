const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARACTERS_PATTERN = /^\+?[\d\s()-]+$/;

const VALID_DDDS = new Set([
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '21',
  '22',
  '24',
  '27',
  '28',
  '31',
  '32',
  '33',
  '34',
  '35',
  '37',
  '38',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '51',
  '53',
  '54',
  '55',
  '61',
  '62',
  '63',
  '64',
  '65',
  '66',
  '67',
  '68',
  '69',
  '71',
  '73',
  '74',
  '75',
  '77',
  '79',
  '81',
  '82',
  '83',
  '84',
  '85',
  '86',
  '87',
  '88',
  '89',
  '91',
  '92',
  '93',
  '94',
  '95',
  '96',
  '97',
  '98',
  '99',
]);

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
    return 'Informe seu nome completo.';
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

  if (!EMAIL_PATTERN.test(email)) {
    return 'Informe um e-mail válido.';
  }

  return undefined;
}

export function validatePhone(value: string): string | undefined {
  const phone = value.trim();

  if (!phone) {
    return undefined;
  }

  if (phone.length > 32) {
    return 'Telefone deve ter no máximo 32 caracteres.';
  }

  if (!PHONE_CHARACTERS_PATTERN.test(phone)) {
    return 'Informe um telefone brasileiro válido.';
  }

  const nationalPhone = normalizePhone(phone.replace(/\D/g, ''));

  if (!nationalPhone) {
    return 'Informe um telefone brasileiro válido.';
  }

  const ddd = nationalPhone.slice(0, 2);
  const number = nationalPhone.slice(2);

  if (!VALID_DDDS.has(ddd)) {
    return 'Informe um telefone brasileiro válido.';
  }

  if (nationalPhone.length === 11 && /^9\d{8}$/.test(number)) {
    return undefined;
  }

  if (nationalPhone.length === 10 && /^[2-5]\d{7}$/.test(number)) {
    return undefined;
  }

  return 'Informe um telefone brasileiro válido.';
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

function normalizePhone(digits: string): string | undefined {
  if (
    (digits.length === 12 || digits.length === 13) &&
    digits.startsWith('55')
  ) {
    return digits.slice(2);
  }

  if (digits.length === 10 || digits.length === 11) {
    return digits;
  }

  return undefined;
}
