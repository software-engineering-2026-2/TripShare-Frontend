import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../services/api';
import type { Trip } from '../../../services/tripsService';
import TripForm from './TripForm';

afterEach(cleanup);

function periodConflictError(
  conflicts: { dayNumber: number; activityCount: number }[],
) {
  return new ApiError(409, {
    status: 409,
    message: 'Cannot shorten trip',
    conflicts,
  });
}

const trip: Trip = {
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
};

function renderEditForm(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  const onSearchDestinations = vi.fn().mockResolvedValue([]);
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
    onSearchDestinations.mockResolvedValue([lisboa]);

    const destinationInput = screen.getByLabelText('Destino');
    await user.clear(destinationInput);
    await user.type(destinationInput, 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(onSearchDestinations).toHaveBeenCalledWith('Lisboa');
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

  it('lista os dias em conflito quando o back-end recusa a redução do período', async () => {
    const user = userEvent.setup();
    renderEditForm(
      vi.fn().mockRejectedValue(
        periodConflictError([
          { dayNumber: 9, activityCount: 2 },
          { dayNumber: 11, activityCount: 1 },
        ]),
      ),
    );

    fireEvent.change(screen.getByLabelText('Data de término'), {
      target: { value: '2027-01-15' },
    });
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(
      await screen.findByText(
        'O novo período deixa de fora dias que já têm atividades:',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Dia 9: 2 atividades')).toBeInTheDocument();
    expect(screen.getByText('Dia 11: 1 atividade')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'Não foi possível salvar as alterações. Tente novamente.',
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Salvar alterações' }),
    ).toBeEnabled();
  });

  it('esconde os conflitos quando as datas são alteradas', async () => {
    const user = userEvent.setup();
    renderEditForm(
      vi
        .fn()
        .mockRejectedValue(
          periodConflictError([{ dayNumber: 11, activityCount: 1 }]),
        ),
    );

    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(await screen.findByText('Dia 11: 1 atividade')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Data de término'), {
      target: { value: '2027-01-21' },
    });

    expect(screen.queryByText('Dia 11: 1 atividade')).not.toBeInTheDocument();
  });

  it('mostra o erro de período no campo de término quando o back-end responde 400', async () => {
    const user = userEvent.setup();
    renderEditForm(
      vi.fn().mockRejectedValue(
        new ApiError(400, {
          status: 400,
          message: 'End date cannot be before start date',
        }),
      ),
    );

    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(
      await screen.findByText(
        'A data de término não pode ser antes da data de início.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Data de término')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});
