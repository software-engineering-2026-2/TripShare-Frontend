import { describe, expect, it } from 'vitest';

import { ApiError } from '../services/api';
import { queryClient } from './queryClient';

type RetryFn = (failureCount: number, error: Error) => boolean;

const retry = queryClient.getDefaultOptions().queries?.retry as RetryFn;

describe('queryClient', () => {
  it.each([400, 401, 403, 404, 409])(
    'não repete a consulta quando a API responde %i',
    (status) => {
      expect(retry(0, new ApiError(status, null))).toBe(false);
    },
  );

  it('repete erros do servidor até 3 vezes', () => {
    const error = new ApiError(500, null);

    expect(retry(0, error)).toBe(true);
    expect(retry(2, error)).toBe(true);
    expect(retry(3, error)).toBe(false);
  });

  it('repete falhas de rede até 3 vezes', () => {
    const error = new TypeError('Failed to fetch');

    expect(retry(0, error)).toBe(true);
    expect(retry(3, error)).toBe(false);
  });
});
