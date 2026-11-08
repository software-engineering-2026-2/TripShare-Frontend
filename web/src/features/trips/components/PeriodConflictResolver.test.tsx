import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DayResolution } from '../periodConflicts';
import PeriodConflictResolver from './PeriodConflictResolver';

afterEach(cleanup);

const conflicts = [
  { dayNumber: 9, activityCount: 2 },
  { dayNumber: 11, activityCount: 1 },
];

function renderResolver(
  resolutions: Partial<Record<number, DayResolution>> = {},
  onChange = vi.fn(),
) {
  render(
    <PeriodConflictResolver
      conflicts={conflicts}
      duration={7}
      resolutions={resolutions}
      onChange={onChange}
    />,
  );
  return { onChange };
}

describe('PeriodConflictResolver', () => {
  it('mostra um grupo por dia em conflito, sem opção marcada', () => {
    renderResolver();

    expect(
      screen.getByRole('group', { name: 'Dia 9: 2 atividades' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Dia 11: 1 atividade' }),
    ).toBeInTheDocument();
    screen
      .getAllByRole('radio')
      .forEach((radio) => expect(radio).not.toBeChecked());
  });

  it('só oferece os dias do novo período como destino', () => {
    renderResolver({ 9: { dayNumber: 9, action: 'MOVE', targetDay: 7 } });

    const select = screen.getByLabelText(
      'Dia de destino das atividades do dia 9',
    );
    const options = within(select).getAllByRole('option');

    expect(options.map((option) => option.textContent)).toEqual([
      'Dia 1',
      'Dia 2',
      'Dia 3',
      'Dia 4',
      'Dia 5',
      'Dia 6',
      'Dia 7',
    ]);
    expect(select).toHaveValue('7');
    expect(
      screen.getByLabelText('Dia de destino das atividades do dia 11'),
    ).toBeDisabled();
  });

  it('informa a escolha de mover para o último dia por padrão e a de remover', async () => {
    const user = userEvent.setup();
    const { onChange } = renderResolver();

    const day9 = screen.getByRole('group', { name: 'Dia 9: 2 atividades' });
    await user.click(
      within(day9).getByRole('radio', { name: 'Mover para o dia' }),
    );
    await user.click(
      screen.getByRole('radio', { name: 'Remover 1 atividade' }),
    );

    expect(onChange).toHaveBeenNthCalledWith(1, {
      dayNumber: 9,
      action: 'MOVE',
      targetDay: 7,
    });
    expect(onChange).toHaveBeenNthCalledWith(2, {
      dayNumber: 11,
      action: 'REMOVE',
    });
  });

  it('avisa que a remoção é irreversível só quando há remoção', () => {
    renderResolver({ 9: { dayNumber: 9, action: 'MOVE', targetDay: 2 } });
    expect(
      screen.queryByText(
        'As atividades removidas não poderão ser recuperadas.',
      ),
    ).not.toBeInTheDocument();

    cleanup();
    renderResolver({ 11: { dayNumber: 11, action: 'REMOVE' } });
    expect(
      screen.getByText('As atividades removidas não poderão ser recuperadas.'),
    ).toBeInTheDocument();
  });
});
