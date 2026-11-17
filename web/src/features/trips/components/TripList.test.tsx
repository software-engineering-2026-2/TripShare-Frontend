import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Trip } from '../../../services/tripsService';
import TripList from './TripList';

afterEach(cleanup);

const trips: Trip[] = [
  {
    id: '1',
    title: 'Férias de verão',
    destination: { city: 'Rio de Janeiro', region: 'RJ', country: 'Brasil' },
    startDate: '2027-01-10',
    endDate: '2027-01-20',
  },
  {
    id: '2',
    title: 'Mochilão na Europa',
    destination: { city: 'Lisboa', region: 'Lisboa', country: 'Portugal' },
    startDate: '2027-07-01',
    endDate: '2027-07-15',
  },
];

function renderTripList(onEditTrip = vi.fn()) {
  render(
    <MemoryRouter>
      <TripList trips={trips} onNewTrip={vi.fn()} onEditTrip={onEditTrip} />
    </MemoryRouter>,
  );
}

describe('TripList', () => {
  it('abre a edição da viagem escolhida pelo botão do card', async () => {
    const user = userEvent.setup();
    const onEditTrip = vi.fn();
    renderTripList(onEditTrip);

    await user.click(
      screen.getByRole('button', { name: 'Editar viagem Mochilão na Europa' }),
    );

    expect(onEditTrip).toHaveBeenCalledWith(trips[1]);
  });

  it('leva para a tela da viagem pelo botão Explorar viagem', () => {
    renderTripList();

    expect(
      screen.getByRole('link', { name: 'Explorar viagem Férias de verão' }),
    ).toHaveAttribute('href', '/minhas-viagens/1');
  });
});
