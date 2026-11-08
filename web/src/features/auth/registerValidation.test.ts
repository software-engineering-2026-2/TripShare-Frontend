import { describe, expect, it } from 'vitest';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validatePhone,
  validateUsername,
} from './registerValidation';

describe('validateUsername', () => {
  it('rejeita nome vazio', () => {
    expect(validateUsername('')).toBe('Informe seu nome de usuário.');
  });

  it('rejeita nome com apenas espaços', () => {
    expect(validateUsername('   ')).toBe('Informe seu nome de usuário.');
  });

  it('rejeita nome com mais de 50 caracteres', () => {
    expect(validateUsername('a'.repeat(51))).toBe(
      'Nome de usuário deve ter no máximo 50 caracteres.',
    );
  });

  it('aceita nome com até 50 caracteres', () => {
    expect(validateUsername('a'.repeat(50))).toBeUndefined();
  });

  it('aceita nome preenchido', () => {
    expect(validateUsername('ana')).toBeUndefined();
  });
});

describe('validateName', () => {
  it('rejeita nome vazio', () => {
    expect(validateName('')).toBe('Informe seu nome completo.');
  });

  it('rejeita nome com apenas espaços', () => {
    expect(validateName('   ')).toBe('Informe seu nome completo.');
  });

  it('rejeita nome com mais de 120 caracteres', () => {
    expect(validateName('a'.repeat(121))).toBe(
      'Nome deve ter no máximo 120 caracteres.',
    );
  });

  it('aceita nome com até 120 caracteres', () => {
    expect(validateName('a'.repeat(120))).toBeUndefined();
  });

  it('aceita nome preenchido', () => {
    expect(validateName('Ana Silva')).toBeUndefined();
  });
});

describe('validateEmail', () => {
  it('rejeita e-mail vazio', () => {
    expect(validateEmail('')).toBe('Informe seu e-mail.');
  });

  it('rejeita e-mail inválido', () => {
    expect(validateEmail('ana')).toBe('Informe um e-mail válido.');
    expect(validateEmail('ana@')).toBe('Informe um e-mail válido.');
    expect(validateEmail('@example.com')).toBe('Informe um e-mail válido.');
    expect(validateEmail('ana@example')).toBe('Informe um e-mail válido.');
    expect(validateEmail('ana @example.com')).toBe('Informe um e-mail válido.');
  });

  it('aceita e-mail válido', () => {
    expect(validateEmail('ana@example.com')).toBeUndefined();
    expect(validateEmail('ana.silva+viagem@example.com.br')).toBeUndefined();
  });
});

describe('validatePhone', () => {
  it.each([
    '(83) 99999-9999',
    '83999999999',
    '83 99999 9999',
    '(83) 3333-3333',
    '8333333333',
    '+55 (83) 99999-9999',
    '+55 83 3333-3333',
    '+55 (55) 99999-9999',
    '55999999999',
    '(11) 3333-3333',
    '(11) 99999-9999',
  ])('aceita telefone válido %s', (phone) => {
    expect(validatePhone(phone)).toBeUndefined();
  });

  it.each([
    '(20) 99999-9999',
    '(23) 99999-9999',
    '(83) 9999-9999',
    '8399999999',
    '(83) 33333-3333',
    '(83) 29999-9999',
    '(83) 6333-3333',
    '(83) 9999-999',
    '(83) 99999-99999',
    'telefone',
    '+55 (20) 99999-9999',
    '+55 83 9999-9999',
  ])('rejeita telefone inválido %s', (phone) => {
    expect(validatePhone(phone)).toBe('Informe um telefone brasileiro válido.');
  });

  it('aceita telefone vazio, pois o campo é opcional', () => {
    expect(validatePhone('')).toBeUndefined();
    expect(validatePhone('   ')).toBeUndefined();
  });

  it('rejeita telefone com mais de 32 caracteres', () => {
    expect(validatePhone('1'.repeat(33))).toBe(
      'Telefone deve ter no máximo 32 caracteres.',
    );
  });
});

describe('validatePassword', () => {
  it('rejeita senha vazia', () => {
    expect(validatePassword('')).toBe('Informe sua senha.');
  });

  it('aceita qualquer senha preenchida', () => {
    expect(validatePassword('senha')).toBeUndefined();
  });
});

describe('validatePasswordConfirmation', () => {
  it('rejeita confirmação vazia', () => {
    expect(validatePasswordConfirmation('', 'senha')).toBe(
      'Confirme sua senha.',
    );
  });

  it('rejeita senhas diferentes', () => {
    expect(validatePasswordConfirmation('outra', 'senha')).toBe(
      'As senhas não coincidem.',
    );
  });

  it('aceita senhas iguais', () => {
    expect(validatePasswordConfirmation('senha', 'senha')).toBeUndefined();
  });
});
