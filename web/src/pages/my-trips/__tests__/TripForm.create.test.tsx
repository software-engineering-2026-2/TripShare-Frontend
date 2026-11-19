import { render } from '../../../test/render';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../resources/client/http';
import type { Destination } from '../../../resources/api/trips/contract';
import TripForm from '../components/TripForm';

afterEach(cleanup);

const lisboa: Destination = {
  id: 'd-lisboa',
  city: 'Lisboa',
  region: 'Lisboa',
  country: 'Portugal',
};
const parisFr: Destination = {
  id: 'd-paris-fr',
  city: 'Paris',
  region: 'Île-de-France',
  country: 'França',
};
const parisTx: Destination = {
  id: 'd-paris-tx',
  city: 'Paris',
  region: 'Texas',
  country: 'Estados Unidos',
};

function renderForm(overrides: Partial<Parameters<typeof TripForm>[0]> = {}) {
  const props = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
    onSearchDestinations: vi.fn().mockResolvedValue([lisboa]),
    ...overrides,
  };
  render(<TripForm {...props} />);
  return { user: userEvent.setup(), props };
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  destination = 'Lisboa',
) {
  await user.type(screen.getByLabelText('Título'), '  Mochilão  ');
  await user.type(screen.getByLabelText('Destino'), destination);
  await user.type(screen.getByLabelText('Data de início'), '2027-07-01');
  await user.type(screen.getByLabelText('Data de término'), '2027-07-15');
}

function submit(user: ReturnType<typeof userEvent.setup>) {
  return user.click(screen.getByRole('button', { name: 'Criar viagem' }));
}

describe('TripForm em modo de criação', () => {
  it('exibe erros para todos os campos vazios e não envia', async () => {
    const { user, props } = renderForm();

    await submit(user);

    expect(screen.getByText('Informe o título da viagem.')).toBeInTheDocument();
    expect(screen.getByText('Informe o destino.')).toBeInTheDocument();
    expect(screen.getByText('Informe a data de início.')).toBeInTheDocument();
    expect(screen.getByText('Informe a data de término.')).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(props.onSearchDestinations).not.toHaveBeenCalled();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('rejeita data de término antes do início', async () => {
    const { user, props } = renderForm();

    await user.type(screen.getByLabelText('Data de início'), '2027-07-10');
    await user.type(screen.getByLabelText('Data de término'), '2027-07-01');
    await submit(user);

    expect(
      screen.getByText(
        'A data de término não pode ser antes da data de início.',
      ),
    ).toBeInTheDocument();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('mostra a duração da viagem conforme as datas', async () => {
    const { user } = renderForm();

    expect(
      screen.getByText('Escolha as datas para ver a duração.'),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText('Data de início'), '2027-07-01');
    await user.type(screen.getByLabelText('Data de término'), '2027-07-15');

    expect(screen.getByText('Duração: 15 dias')).toBeInTheDocument();
  });

  it('envia a viagem com o destino encontrado e o título sem espaços', async () => {
    const { user, props } = renderForm();

    await fillForm(user);
    await submit(user);

    expect(props.onSearchDestinations).toHaveBeenCalledWith('Lisboa');
    expect(props.onSubmit).toHaveBeenCalledWith({
      title: 'Mochilão',
      destinationId: lisboa.id,
      startsOn: '2027-07-01',
      endsOn: '2027-07-15',
    });
  });

  it('pede para escolher quando há mais de um destino e envia o escolhido', async () => {
    const { user, props } = renderForm({
      onSearchDestinations: vi.fn().mockResolvedValue([parisFr, parisTx]),
    });

    await fillForm(user, 'Paris');
    await submit(user);

    expect(
      screen.getByRole('group', { name: 'Qual destino você quis dizer?' }),
    ).toBeInTheDocument();
    expect(props.onSubmit).not.toHaveBeenCalled();

    await submit(user);
    expect(
      screen.getByText('Escolha uma das opções de destino.'),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('radio', { name: 'Paris, Texas, Estados Unidos' }),
    );
    await submit(user);

    expect(props.onSearchDestinations).toHaveBeenCalledTimes(1);
    expect(props.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ destinationId: parisTx.id }),
    );
  });

  it('avisa quando o destino não é encontrado', async () => {
    const { user, props } = renderForm({
      onSearchDestinations: vi.fn().mockResolvedValue([]),
    });

    await fillForm(user, 'Atlântida');
    await submit(user);

    expect(screen.getByText('Destino não encontrado.')).toBeInTheDocument();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('avisa quando a busca de destino falha', async () => {
    const { user, props } = renderForm({
      onSearchDestinations: vi.fn().mockRejectedValue(new Error('offline')),
    });

    await fillForm(user);
    await submit(user);

    expect(
      screen.getByText('Não foi possível buscar o destino. Tente novamente.'),
    ).toBeInTheDocument();
    expect(props.onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Criar viagem' })).toBeEnabled();
  });

  it('mostra o erro de destino inexistente no campo e permite corrigir', async () => {
    const { user } = renderForm({
      onSubmit: vi
        .fn()
        .mockRejectedValue(
          new ApiError(404, { status: 404, message: 'Destination not found' }),
        ),
    });

    await fillForm(user);
    await submit(user);

    expect(
      await screen.findByText('Destino não encontrado.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar viagem' })).toBeEnabled();
  });

  it('avisa quando a criação falha e permite tentar de novo', async () => {
    const { user, props } = renderForm({
      onSubmit: vi.fn().mockRejectedValue(new Error('500')),
    });

    await fillForm(user);
    await submit(user);

    expect(
      screen.getByText('Não foi possível criar a viagem. Tente novamente.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar viagem' })).toBeEnabled();
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('desabilita os botões enquanto cria a viagem', async () => {
    let finish: () => void = () => {};
    const { user, props } = renderForm({
      onSubmit: vi.fn(() => new Promise<void>((resolve) => (finish = resolve))),
    });

    await fillForm(user);
    await submit(user);

    expect(screen.getByRole('button', { name: 'Criando...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Criando...' }));
    expect(props.onSubmit).toHaveBeenCalledTimes(1);

    finish();
    expect(
      await screen.findByRole('button', { name: 'Criar viagem' }),
    ).toBeEnabled();
  });

  it('chama onCancel ao cancelar', async () => {
    const { user, props } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });
});

vi.mock('../../../commons/config/env', () => ({ USE_MOCKS: true }));
