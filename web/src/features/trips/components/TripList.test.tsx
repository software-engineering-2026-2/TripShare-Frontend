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

function renderTripList({
  list = trips,
  onNewTrip = vi.fn(),
  onEditTrip = vi.fn(),
  onDeleteTrip = vi.fn(),
}: {
  list?: Trip[];
  onNewTrip?: () => void;
  onEditTrip?: (trip: Trip) => void;
  onDeleteTrip?: (trip: Trip) => void;
} = {}) {
  render(
    <MemoryRouter>
      <TripList
        trips={list}
        onNewTrip={onNewTrip}
        onEditTrip={onEditTrip}
        onDeleteTrip={onDeleteTrip}
      />
    </MemoryRouter>,
  );
}

describe('TripList', () => {
  it('mostra o estado vazio e abre o formulário pelo botão', async () => {
    const user = userEvent.setup();
    const onNewTrip = vi.fn();
    renderTripList({ list: [], onNewTrip });

    expect(screen.getByText('Você ainda não tem viagens')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Criar nova viagem' }));

    expect(onNewTrip).toHaveBeenCalledTimes(1);
  });

  it('lista as viagens com destino, período e duração', () => {
    renderTripList();

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

  it('abre a edição da viagem escolhida pelo botão do card', async () => {
    const user = userEvent.setup();
    const onEditTrip = vi.fn();
    renderTripList({ onEditTrip });

    await user.click(
      screen.getByRole('button', { name: 'Editar viagem Bate e volta' }),
    );

    expect(onEditTrip).toHaveBeenCalledWith(trips[1]);
  });

  it('chama onDeleteTrip com a viagem do card clicado', async () => {
    const user = userEvent.setup();
    const onDeleteTrip = vi.fn();
    renderTripList({ onDeleteTrip });

    await user.click(
      screen.getByRole('button', { name: 'Excluir viagem Bate e volta' }),
    );

    expect(onDeleteTrip).toHaveBeenCalledWith(trips[1]);
  });

  it('leva para a tela da viagem pelo botão Explorar viagem', () => {
    renderTripList();

    expect(
      screen.getByRole('link', { name: 'Explorar viagem Férias de verão' }),
    ).toHaveAttribute('href', '/minhas-viagens/1');
  });
});
