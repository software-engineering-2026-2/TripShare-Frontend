import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Trip } from '../../../services/tripsService';
import TripForm from './TripForm';

afterEach(cleanup);

const trip: Trip = {
  id: '1',
  title: 'Férias de verão',
  destination: {
    city: 'Rio de Janeiro',
    region: 'Rio de Janeiro',
    country: 'Brasil',
  },
  startDate: '2027-01-10',
  endDate: '2027-01-20',
};

function renderEditForm(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  const onSearchDestinations = vi.fn().mockResolvedValue({
    content: [],
    totalPages: 0,
    number: 0,
  });
  render(
    <TripForm
      trip={trip}
      onSubmit={onSubmit}
      onCancel={vi.fn()}
      onSearchDestinations={onSearchDestinations}
    />,
  );
  return { onSubmit, onSearchDestinations };
}

describe('TripForm em modo de edição', () => {
  it('abre preenchido com os dados da viagem', () => {
    renderEditForm();

    expect(screen.getByLabelText('Título')).toHaveValue('Férias de verão');
    expect(screen.getByLabelText('Destino')).toHaveValue(
      'Rio de Janeiro, Rio de Janeiro, Brasil',
    );
    expect(screen.getByLabelText('Data de início')).toHaveValue('2027-01-10');
    expect(screen.getByLabelText('Data de término')).toHaveValue('2027-01-20');
    expect(screen.getByText('Duração: 11 dias')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Salvar alterações' }),
    ).toBeInTheDocument();
  });

  it('recalcula a duração quando as datas mudam', () => {
    renderEditForm();

    fireEvent.change(screen.getByLabelText('Data de término'), {
      target: { value: '2027-01-12' },
    });
    expect(screen.getByText('Duração: 3 dias')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Data de início'), {
      target: { value: '2027-01-12' },
    });
    expect(screen.getByText('Duração: 1 dia')).toBeInTheDocument();
  });

  it('envia as alterações mantendo o destino sem nova busca', async () => {
    const user = userEvent.setup();
    const { onSubmit, onSearchDestinations } = renderEditForm();

    const titleInput = screen.getByLabelText('Título');
    await user.clear(titleInput);
    await user.type(titleInput, 'Carnaval no Rio');
    fireEvent.change(screen.getByLabelText('Data de término'), {
      target: { value: '2027-01-15' },
    });
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(onSearchDestinations).not.toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Carnaval no Rio',
      destination: trip.destination,
      startDate: '2027-01-10',
      endDate: '2027-01-15',
    });
  });

  it('busca o novo destino quando ele é alterado', async () => {
    const user = userEvent.setup();
    const { onSubmit, onSearchDestinations } = renderEditForm();
    const lisboa = { city: 'Lisboa', region: 'Lisboa', country: 'Portugal' };
    onSearchDestinations.mockResolvedValue({
      content: [lisboa],
      totalPages: 1,
      number: 0,
    });

    const destinationInput = screen.getByLabelText('Destino');
    await user.clear(destinationInput);
    await user.type(destinationInput, 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(onSearchDestinations).toHaveBeenCalledWith('Lisboa', 0);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ destination: lisboa }),
    );
  });

  it('mostra erro quando não consegue salvar', async () => {
    const user = userEvent.setup();
    renderEditForm(vi.fn().mockRejectedValue(new Error('falha')));

    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(
      await screen.findByText(
        'Não foi possível salvar as alterações. Tente novamente.',
      ),
    ).toBeInTheDocument();
  });

  it('permite trocar de página nas opções de destino', async () => {
    const user = userEvent.setup();
    const { onSearchDestinations } = renderEditForm();
    const rio = { city: 'Rio de Janeiro', region: 'RJ', country: 'Brasil' };
    const lisboa = { city: 'Lisboa', region: 'Lisboa', country: 'Portugal' };
    const recife = { city: 'Recife', region: 'PE', country: 'Brasil' };
    onSearchDestinations
      .mockResolvedValueOnce({
        content: [rio, recife],
        totalPages: 2,
        number: 0,
      })
      .mockResolvedValueOnce({
        content: [lisboa],
        totalPages: 2,
        number: 1,
      });

    const destinationInput = screen.getByLabelText('Destino');
    await user.clear(destinationInput);
    await user.type(destinationInput, 'cidade');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await user.click(screen.getByRole('button', { name: 'Próxima' }));

    expect(onSearchDestinations).toHaveBeenLastCalledWith('cidade', 1);
    expect(screen.getByText('Lisboa, Lisboa, Portugal')).toBeInTheDocument();
  });
});
