import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../services/api';
import DeleteTripDialog from './DeleteTripDialog';

afterEach(cleanup);

const trip = {
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

const forbidden = new ApiError(403, {
  status: 403,
  message: 'You do not own this trip',
});
const notFound = new ApiError(404, { status: 404, message: 'Trip not found' });

const summary = {
  itineraryCount: 3,
  publishedItineraryCount: 1,
  favoriteCount: 4,
};

function renderDialog(
  props: Partial<ComponentProps<typeof DeleteTripDialog>> = {},
) {
  const allProps = {
    trip,
    summary,
    isLoadingSummary: false,
    summaryError: null,
    onRetrySummary: vi.fn(),
    onConfirm: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
    ...props,
  };
  render(<DeleteTripDialog {...allProps} />);
  return { user: userEvent.setup(), props: allProps };
}

function confirmButton() {
  return screen.getByRole('button', { name: /Excluir viagem|Excluindo/ });
}

describe('DeleteTripDialog', () => {
  it('mostra o carregamento e não deixa excluir antes do resumo', () => {
    renderDialog({ summary: undefined, isLoadingSummary: true });

    expect(
      screen.getByRole('alertdialog', { name: 'Excluir Férias de verão?' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Verificando o que será removido...'),
    ).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
  });

  it('lista roteiros, publicações e favoritos e avisa que é irreversível', () => {
    renderDialog({
      summary: {
        itineraryCount: 1,
        publishedItineraryCount: 2,
        favoriteCount: 4,
      },
    });

    expect(screen.getByText('1 roteiro')).toBeInTheDocument();
    expect(screen.getByText('2 publicações')).toBeInTheDocument();
    expect(screen.getByText('4 favoritos')).toBeInTheDocument();
    expect(
      screen.getByText('Esta ação não pode ser desfeita.'),
    ).toBeInTheDocument();
    expect(confirmButton()).toBeEnabled();
  });

  it('informa quando não há nada além da viagem para remover', () => {
    renderDialog({
      summary: {
        itineraryCount: 0,
        publishedItineraryCount: 0,
        favoriteCount: 0,
      },
    });

    expect(
      screen.getByText(
        'Esta viagem não tem roteiros, publicações nem favoritos.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(
      screen.getByText('Esta ação não pode ser desfeita.'),
    ).toBeInTheDocument();
  });

  it('mostra erro do resumo, permite tentar de novo e não deixa excluir', async () => {
    const { user, props } = renderDialog({
      summary: undefined,
      summaryError: new Error('rede'),
    });

    expect(
      screen.getByText('Não foi possível verificar o que será removido.'),
    ).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(props.onRetrySummary).toHaveBeenCalledTimes(1);
  });

  it('começa com o foco em Cancelar e cancela sem excluir', async () => {
    const { user, props } = renderDialog();

    const cancel = screen.getByRole('button', { name: 'Cancelar' });
    expect(cancel).toHaveFocus();

    await user.click(cancel);

    expect(props.onCancel).toHaveBeenCalledTimes(1);
    expect(props.onConfirm).not.toHaveBeenCalled();
  });

  it('desabilita os botões enquanto exclui', async () => {
    const { user } = renderDialog({
      onConfirm: vi.fn(() => new Promise<void>(() => {})),
    });

    await user.click(confirmButton());

    expect(screen.getByRole('button', { name: 'Excluindo...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });

  it('mantém o diálogo aberto e mostra erro quando a exclusão falha', async () => {
    const { user, props } = renderDialog({
      onConfirm: vi.fn().mockRejectedValue(new Error('falhou')),
    });

    await user.click(confirmButton());

    expect(
      await screen.findByText(
        'Não foi possível excluir a viagem. Tente novamente.',
      ),
    ).toBeInTheDocument();
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(confirmButton()).toBeEnabled();
  });

  it.each([
    [forbidden, 'Você não tem permissão para excluir esta viagem.'],
    [notFound, 'Esta viagem não existe mais.'],
  ])(
    'no resumo com %s mostra o motivo, sem tentar de novo nem excluir',
    (summaryError, message) => {
      renderDialog({ summary: undefined, summaryError });

      expect(screen.getByRole('alert')).toHaveTextContent(message);
      expect(
        screen.queryByRole('button', { name: 'Tentar novamente' }),
      ).not.toBeInTheDocument();
      expect(confirmButton()).toBeDisabled();
    },
  );

  it.each([
    [forbidden, 'Você não tem permissão para excluir esta viagem.'],
    [notFound, 'Esta viagem não existe mais.'],
  ])(
    'na exclusão com %s mostra o motivo e não deixa excluir de novo',
    async (error, message) => {
      const { user } = renderDialog({
        onConfirm: vi.fn().mockRejectedValue(error),
      });

      await user.click(confirmButton());

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(confirmButton()).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled();
    },
  );
});
