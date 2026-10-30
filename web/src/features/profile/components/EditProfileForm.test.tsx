import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../../services/api';
import type { UserProfile } from '../../../services/authService';
import type { UpdateProfileInput } from '../../../services/usersService';
import EditProfileForm from './EditProfileForm';

const profile: UserProfile = {
  id: 'b3f1c0de-4a2e-4c1b-9d57-0e8f6a1c2d34',
  username: 'viajante',
  name: 'Nome Atual',
  email: 'viajante@email.com',
  phone: '+5583999999999',
  bio: 'Bio atual',
  hometown: 'Campina Grande',
  role: 'USER',
  status: 'ACTIVE',
  createdAt: '2026-10-21T14:30:00Z',
};

let onSubmit = vi.fn<(input: UpdateProfileInput) => Promise<UserProfile>>();
let onCancel = vi.fn<() => void>();

function renderForm() {
  return render(
    <EditProfileForm
      profile={profile}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />,
  );
}

function changeField(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

beforeEach(() => {
  vi.clearAllMocks();
  onSubmit = vi.fn<(input: UpdateProfileInput) => Promise<UserProfile>>();
  onCancel = vi.fn<() => void>();
});

afterEach(() => {
  cleanup();
});

describe('EditProfileForm', () => {
  it('carrega os dados atuais do usuário', () => {
    renderForm();

    expect(screen.getByLabelText('Nome de exibição')).toHaveValue('Nome Atual');
    expect(screen.getByLabelText('Telefone (opcional)')).toHaveValue(
      '+5583999999999',
    );
    expect(screen.getByLabelText('Biografia (opcional)')).toHaveValue(
      'Bio atual',
    );
    expect(screen.getByLabelText('Cidade de origem (opcional)')).toHaveValue(
      'Campina Grande',
    );
  });

  it('envia somente os campos alterados e mostra sucesso', async () => {
    const user = userEvent.setup();
    onSubmit.mockResolvedValue({
      ...profile,
      name: 'Novo Nome',
      phone: '+5511999999999',
    });
    renderForm();

    changeField('Nome de exibição', 'Novo Nome');
    changeField('Telefone (opcional)', '+5511999999999');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Novo Nome',
      phone: '+5511999999999',
    });
    expect(
      await screen.findByText('Perfil atualizado com sucesso.'),
    ).toBeInTheDocument();
  });

  it('envia apenas a biografia quando só ela muda', async () => {
    const user = userEvent.setup();
    onSubmit.mockResolvedValue({ ...profile, bio: 'Nova bio' });
    renderForm();

    changeField('Biografia (opcional)', 'Nova bio');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSubmit).toHaveBeenCalledWith({ bio: 'Nova bio' });
  });

  it('rejeita nome vazio', async () => {
    const user = userEvent.setup();
    renderForm();

    changeField('Nome de exibição', '');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('Informe seu nome de exibição.'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejeita nome composto somente por espaços', async () => {
    const user = userEvent.setup();
    renderForm();

    changeField('Nome de exibição', '    ');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('Informe seu nome de exibição.'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejeita nome acima de 120 caracteres', async () => {
    const user = userEvent.setup();
    renderForm();

    changeField('Nome de exibição', 'a'.repeat(121));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('Nome deve ter no máximo 120 caracteres.'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejeita biografia acima de 500 caracteres', async () => {
    const user = userEvent.setup();
    renderForm();

    changeField('Biografia (opcional)', 'a'.repeat(501));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('Biografia deve ter no máximo 500 caracteres.'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejeita cidade de origem acima de 120 caracteres', async () => {
    const user = userEvent.setup();
    renderForm();

    changeField('Cidade de origem (opcional)', 'a'.repeat(121));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText(
        'Cidade de origem deve ter no máximo 120 caracteres.',
      ),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejeita telefone acima de 32 caracteres', async () => {
    const user = userEvent.setup();
    renderForm();

    changeField('Telefone (opcional)', `+${'1'.repeat(32)}`);
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('Telefone deve ter no máximo 32 caracteres.'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejeita telefone fora do formato E.164', async () => {
    const user = userEvent.setup();
    renderForm();

    changeField('Telefone (opcional)', '83999999999');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText(
        'Informe o telefone no formato E.164 (ex.: +5583999999999).',
      ),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('trata erro da API e preserva os valores digitados', async () => {
    const user = userEvent.setup();
    onSubmit.mockRejectedValue(new ApiError(400, null));
    renderForm();

    changeField('Nome de exibição', 'Nome Digitado');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText(
        'Dados inválidos. Revise os campos e tente novamente.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Nome de exibição')).toHaveValue(
      'Nome Digitado',
    );
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled();
  });

  it('evita envios duplicados enquanto salva', async () => {
    const user = userEvent.setup();
    onSubmit.mockImplementation(() => new Promise<UserProfile>(() => {}));
    renderForm();

    changeField('Nome de exibição', 'Novo Nome');
    const button = screen.getByRole('button', { name: 'Salvar' });

    await user.click(button);
    await user.click(button);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled();
  });

  it('atualiza os dados exibidos após salvar', async () => {
    const user = userEvent.setup();
    onSubmit.mockResolvedValue({ ...profile, name: 'Nome do Servidor' });
    renderForm();

    changeField('Nome de exibição', 'Nome Novo');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('Perfil atualizado com sucesso.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Nome de exibição')).toHaveValue(
      'Nome do Servidor',
    );
  });

  it('não chama a API quando nada foi alterado', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      await screen.findByText('Nenhuma alteração para salvar.'),
    ).toBeInTheDocument();
  });

  it('aciona o cancelamento', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
