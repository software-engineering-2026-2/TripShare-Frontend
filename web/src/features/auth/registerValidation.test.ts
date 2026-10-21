import { describe, expect, it } from 'vitest';
import {
  validateEmail,
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

  it('aceita nome preenchido', () => {
    expect(validateUsername('ana')).toBeUndefined();
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

  it('exige mensagem específica para telefone vazio', () => {
    expect(validatePhone('')).toBe('Informe seu telefone.');
    expect(validatePhone('   ')).toBe('Informe seu telefone.');
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
