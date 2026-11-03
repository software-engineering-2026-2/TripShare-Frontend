import { describe, expect, it } from 'vitest';

import { buildUpdate } from './profileUpdate';

const baseline = {
  name: ' Ana ',
  phone: '+5583999999999',
  bio: 'Viajante',
  hometown: ' Recife ',
};

describe('buildUpdate', () => {
  it('omits fields that are unchanged after trimming', () => {
    expect(buildUpdate({ ...baseline, name: 'Ana' }, baseline)).toStrictEqual(
      {},
    );
  });

  it('includes only changed fields with trimmed values', () => {
    expect(
      buildUpdate(
        { ...baseline, name: ' Bia ', phone: ' +5583988888888 ' },
        baseline,
      ),
    ).toStrictEqual({ name: 'Bia', phone: '+5583988888888' });
  });

  it('includes empty strings when clearing the bio and hometown', () => {
    expect(
      buildUpdate({ ...baseline, bio: '', hometown: '  ' }, baseline),
    ).toStrictEqual({ bio: '', hometown: '' });
  });
});
