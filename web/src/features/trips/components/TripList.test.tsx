import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TripList from './TripList';

afterEach(cleanup);

const trips = [
  {
    id: '1',
    title: 'Férias de verão',
    destination: {
      id: 'd1',
      city: 'Rio de Janeiro',
      region: 'Rio de Janeiro',
      country: 'Brasil',
    },
    startDate: '2027-01-10',
    endDate: '2027-01-20',
  },
  {
    id: '2',
    title: 'Bate e volta',
    destination: { id: 'd2', city: 'Lisboa', region: '', country: 'Portugal' },
    startDate: '2027-07-01',
    endDate: '2027-07-01',
  },
];

describe('TripList', () => {
  it('mostra o estado vazio e abre o formulário pelo botão', async () => {
    const user = userEvent.setup();
    const onNewTrip = vi.fn();
    render(<TripList trips={[]} onNewTrip={onNewTrip} />);

    expect(screen.getByText('Você ainda não tem viagens')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Criar nova viagem' }));

    expect(onNewTrip).toHaveBeenCalledTimes(1);
  });

  it('lista as viagens com destino, período e duração', () => {
    render(<TripList trips={trips} onNewTrip={vi.fn()} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);

    expect(
      screen.getByRole('heading', { name: 'Férias de verão' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Rio de Janeiro, Rio de Janeiro, Brasil'),
    ).toBeInTheDocument();
    expect(screen.getByText('10/01/2027 – 20/01/2027')).toBeInTheDocument();
    expect(screen.getByText('11 dias')).toBeInTheDocument();

    expect(screen.getByText('Lisboa, Portugal')).toBeInTheDocument();
    expect(screen.getByText('01/07/2027')).toBeInTheDocument();
    expect(screen.getByText('1 dia')).toBeInTheDocument();
    expect(
      screen.queryByText('Você ainda não tem viagens'),
    ).not.toBeInTheDocument();
  });
});
