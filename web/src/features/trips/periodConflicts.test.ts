import { describe, expect, it } from 'vitest';
import { ApiError } from '../../services/api';
import { getPeriodConflicts, isInvalidPeriodError } from './periodConflicts';

describe('getPeriodConflicts', () => {
  const conflicts = [
    { dayNumber: 10, activityCount: 2 },
    { dayNumber: 11, activityCount: 1 },
  ];

  it('devolve os dias em conflito de um 409', () => {
    const error = new ApiError(409, { status: 409, message: '', conflicts });

    expect(getPeriodConflicts(error)).toEqual(conflicts);
  });

  it('devolve null para outros status e erros que não são da API', () => {
    expect(getPeriodConflicts(new ApiError(400, { conflicts }))).toBeNull();
    expect(getPeriodConflicts(new ApiError(409, null))).toBeNull();
    expect(getPeriodConflicts(new Error('falha de rede'))).toBeNull();
  });
});

describe('isInvalidPeriodError', () => {
  it('reconhece o 400 de período inválido', () => {
    const error = new ApiError(400, {
      status: 400,
      message: 'End date cannot be before start date',
    });

    expect(isInvalidPeriodError(error)).toBe(true);
  });

  it('ignora outros 400 e erros que não são da API', () => {
    expect(
      isInvalidPeriodError(
        new ApiError(400, { status: 400, message: 'Invalid request body' }),
      ),
    ).toBe(false);
    expect(isInvalidPeriodError(new ApiError(400, null))).toBe(false);
    expect(isInvalidPeriodError(new Error('falha'))).toBe(false);
  });
});
