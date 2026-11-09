import { describe, expect, it } from 'vitest';
import { ApiError } from '../../services/api';
import {
  getTripAccessErrorMessage,
  isTripAccessError,
} from './tripAccessError';

const forbidden = new ApiError(403, {
  status: 403,
  message: 'You do not own this trip',
});
const notFound = new ApiError(404, { status: 404, message: 'Trip not found' });

describe('isTripAccessError', () => {
  it('reconhece 403 e 404 da API', () => {
    expect(isTripAccessError(forbidden)).toBe(true);
    expect(isTripAccessError(notFound)).toBe(true);
  });

  it('ignora outros status e erros que não são da API', () => {
    expect(isTripAccessError(new ApiError(409, null))).toBe(false);
    expect(isTripAccessError(new ApiError(500, null))).toBe(false);
    expect(isTripAccessError(new Error('rede'))).toBe(false);
  });
});

describe('getTripAccessErrorMessage', () => {
  it('no 403 diz que a viagem é de outro usuário, conforme a ação', () => {
    expect(getTripAccessErrorMessage(forbidden, 'alterar')).toBe(
      'Você não tem permissão para alterar esta viagem.',
    );
    expect(getTripAccessErrorMessage(forbidden, 'excluir')).toBe(
      'Você não tem permissão para excluir esta viagem.',
    );
  });

  it('no 404 diz que a viagem não existe mais', () => {
    expect(getTripAccessErrorMessage(notFound, 'excluir')).toBe(
      'Esta viagem não existe mais.',
    );
  });

  it('devolve null para os demais erros', () => {
    expect(getTripAccessErrorMessage(new ApiError(500, null), 'alterar')).toBe(
      null,
    );
  });
});
