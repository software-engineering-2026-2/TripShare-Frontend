import { describe, expect, it } from 'vitest';
import {
  formatDayCount,
  formatDestination,
  formatTripPeriod,
  getTripDays,
  validateDestination,
  validateEndDate,
  validateStartDate,
  validateTitle,
} from './tripValidation';

describe('getTripDays', () => {
  it('conta o primeiro e o último dia', () => {
    expect(getTripDays('2026-11-10', '2026-11-12')).toBe(3);
  });

  it('retorna 1 quando início e término são no mesmo dia', () => {
    expect(getTripDays('2026-11-10', '2026-11-10')).toBe(1);
  });

  it('conta dias entre meses diferentes', () => {
    expect(getTripDays('2026-01-30', '2026-02-02')).toBe(4);
  });

  it('retorna 0 quando falta alguma data', () => {
    expect(getTripDays('', '2026-11-12')).toBe(0);
    expect(getTripDays('2026-11-10', '')).toBe(0);
  });

  it('retorna 0 quando o término é antes do início', () => {
    expect(getTripDays('2026-11-12', '2026-11-10')).toBe(0);
  });
});

describe('formatTripPeriod', () => {
  it('formata o período no padrão brasileiro', () => {
    expect(formatTripPeriod('2026-11-10', '2026-11-12')).toBe(
      '10/11/2026 – 12/11/2026',
    );
  });

  it('mostra uma única data quando a viagem tem um dia', () => {
    expect(formatTripPeriod('2026-11-10', '2026-11-10')).toBe('10/11/2026');
  });
});

describe('formatDayCount', () => {
  it('usa singular e plural', () => {
    expect(formatDayCount(1)).toBe('1 dia');
    expect(formatDayCount(4)).toBe('4 dias');
  });
});

describe('formatDestination', () => {
  it('junta cidade, região e país', () => {
    expect(
      formatDestination({
        city: 'Paris',
        region: 'Île-de-France',
        country: 'França',
      }),
    ).toBe('Paris, Île-de-France, França');
  });

  it('ignora partes vazias', () => {
    expect(
      formatDestination({
        city: 'Singapura',
        region: '',
        country: 'Singapura',
      }),
    ).toBe('Singapura, Singapura');
  });
});

describe('validateTitle', () => {
  it('rejeita título vazio ou só com espaços', () => {
    expect(validateTitle('')).toBe('Informe o título da viagem.');
    expect(validateTitle('   ')).toBe('Informe o título da viagem.');
  });

  it('aceita título preenchido', () => {
    expect(validateTitle('Férias em família')).toBeUndefined();
  });
});

describe('validateDestination', () => {
  it('rejeita destino vazio', () => {
    expect(validateDestination(' ')).toBe('Informe o destino.');
  });

  it('aceita destino preenchido', () => {
    expect(validateDestination('Rio de Janeiro')).toBeUndefined();
  });
});

describe('validateStartDate', () => {
  it('rejeita data vazia', () => {
    expect(validateStartDate('')).toBe('Informe a data de início.');
  });

  it('aceita data preenchida', () => {
    expect(validateStartDate('2026-11-10')).toBeUndefined();
  });
});

describe('validateEndDate', () => {
  it('rejeita data vazia', () => {
    expect(validateEndDate('', '2026-11-10')).toBe(
      'Informe a data de término.',
    );
  });

  it('rejeita término antes do início', () => {
    expect(validateEndDate('2026-11-09', '2026-11-10')).toBe(
      'A data de término não pode ser antes da data de início.',
    );
  });

  it('aceita término igual ou depois do início', () => {
    expect(validateEndDate('2026-11-10', '2026-11-10')).toBeUndefined();
    expect(validateEndDate('2026-11-12', '2026-11-10')).toBeUndefined();
  });
});
