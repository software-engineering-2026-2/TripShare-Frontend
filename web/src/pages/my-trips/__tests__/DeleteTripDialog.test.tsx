import { render } from '../../../test/render';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../resources/client/http';
import DeleteTripDialog from '../components/DeleteTripDialog';

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
  durationDays: 11,
};

const forbidden = new ApiError(403, {
  status: 403,
  message: 'You do not own this trip',
});
const notFound = new ApiError(404, { status: 404, message: 'Trip not found' });

const preview = {
  content: [
    {
      id: 'it-1',
      title: 'Primeiro roteiro',
      published: true,
      favoriteCount: 4,
      inRanking: true,
    },
  ],
  page: 0,
  size: 1,
  totalElements: 3,
  totalPages: 3,
  last: false,
};

function renderDialog(
  props: Partial<ComponentProps<typeof DeleteTripDialog>> = {},
) {
  const allProps = {
    trip,
    preview,
    isLoadingPreview: false,
    previewError: null,
    onRetryPreview: vi.fn(),
    onPageChange: vi.fn(),
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
    renderDialog({ preview: undefined, isLoadingPreview: true });

    expect(
      screen.getByRole('alertdialog', { name: 'Excluir Férias de verão?' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Verificando o que será removido...'),
    ).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
  });

  it('mostra o total e os dados da página e permite avançar', async () => {
    const { user, props } = renderDialog();

    expect(
      screen.getByText('Serão removidos 3 roteiros e seus vínculos.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Primeiro roteiro · Público · 4 favoritos · Visível no ranking/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Esta ação não pode ser desfeita.'),
    ).toBeInTheDocument();
    expect(confirmButton()).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Próxima' }));
    expect(props.onPageChange).toHaveBeenCalledWith(1);
  });

  it('informa quando não há nada além da viagem para remover', () => {
    renderDialog({
      preview: {
        ...preview,
        content: [],
        totalElements: 0,
        totalPages: 0,
        last: true,
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
      preview: undefined,
      previewError: new Error('rede'),
    });

    expect(
      screen.getByText('Não foi possível verificar o que será removido.'),
    ).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(props.onRetryPreview).toHaveBeenCalledTimes(1);
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
    (previewError, message) => {
      renderDialog({ preview: undefined, previewError });

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
