import { describe, expect, it } from 'vitest';

import {
  validateProfileBio,
  validateProfileHometown,
  validateProfileName,
  validateProfilePhone,
} from './profileValidation';

describe('validateProfileName', () => {
  it('rejeita nome vazio', () => {
    expect(validateProfileName('')).toBe('Informe seu nome de exibição.');
  });

  it('rejeita nome composto somente por espaços', () => {
    expect(validateProfileName('   ')).toBe('Informe seu nome de exibição.');
  });

  it('rejeita nome acima de 120 caracteres', () => {
    expect(validateProfileName('a'.repeat(121))).toBe(
      'Nome deve ter no máximo 120 caracteres.',
    );
  });

  it('aceita nome válido', () => {
    expect(validateProfileName('  Nome Válido  ')).toBeUndefined();
  });
});

describe('validateProfilePhone', () => {
  it('aceita telefone vazio por ser opcional', () => {
    expect(validateProfilePhone('')).toBeUndefined();
  });

  it('rejeita telefone acima de 32 caracteres', () => {
    expect(validateProfilePhone(`+${'1'.repeat(32)}`)).toBe(
      'Telefone deve ter no máximo 32 caracteres.',
    );
  });

  it('rejeita telefone fora do formato E.164', () => {
    expect(validateProfilePhone('83999999999')).toBe(
      'Informe o telefone no formato E.164 (ex.: +5583999999999).',
    );
  });

  it('aceita telefone no formato E.164', () => {
    expect(validateProfilePhone('+5583999999999')).toBeUndefined();
  });
});

describe('validateProfileBio', () => {
  it('rejeita biografia acima de 500 caracteres', () => {
    expect(validateProfileBio('a'.repeat(501))).toBe(
      'Biografia deve ter no máximo 500 caracteres.',
    );
  });

  it('aceita biografia vazia', () => {
    expect(validateProfileBio('')).toBeUndefined();
  });
});

describe('validateProfileHometown', () => {
  it('rejeita cidade acima de 120 caracteres', () => {
    expect(validateProfileHometown('a'.repeat(121))).toBe(
      'Cidade de origem deve ter no máximo 120 caracteres.',
    );
  });

  it('aceita cidade vazia', () => {
    expect(validateProfileHometown('')).toBeUndefined();
  });
});
