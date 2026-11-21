import { describe, expect, it } from 'vitest';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validateUsername,
} from '../validation';

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
    expect(validateName('')).toBe('Informe seu nome de exibição.');
  });

  it('rejeita nome com apenas espaços', () => {
    expect(validateName('   ')).toBe('Informe seu nome de exibição.');
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

it('rejeita e-mail acima do limite aceito pelo backend', () => {
  expect(validateEmail('a'.repeat(250) + '@example.com')).toBeDefined();
});
