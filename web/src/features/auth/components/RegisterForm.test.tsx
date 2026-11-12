import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import toast from 'react-hot-toast';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../../services/api';
import { register, type UserProfile } from '../../../services/authService';
import RegisterForm from './RegisterForm';

vi.mock('../../../services/authService', () => ({
  register: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
  },
}));

const registerMock = vi.mocked(register);
const toastSuccessMock = vi.mocked(toast.success);

const userProfile: UserProfile = {
  id: 'b3f1c0de-4a2e-4c1b-9d57-0e8f6a1c2d34',
  username: 'ana',
  name: 'Ana Silva',
  email: 'ana@example.com',
  phone: null,
  bio: null,
  hometown: null,
  role: 'USER',
  status: 'ACTIVE',
  createdAt: '2026-10-21T14:30:00Z',
};

function renderRegisterForm() {
  return render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <Routes>
        <Route path="/cadastro" element={<RegisterForm />} />
        <Route path="/login" element={<p>Página de login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillValidForm(user: UserEvent) {
  await user.type(screen.getByLabelText('Nome de usuário'), 'ana');
  await user.type(screen.getByLabelText('Nome completo'), 'Ana Silva');
  await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
  await user.type(screen.getByLabelText('Telefone (opcional)'), '(83) 99999-9999');
  await user.type(screen.getByLabelText('Senha'), 'senha123!');
  await user.type(screen.getByLabelText('Confirmação de senha'), 'senha123!');
  await user.type(screen.getByLabelText('Bio (opcional)'), 'Gosto de viagens');
  await user.type(
    screen.getByLabelText('Cidade natal (opcional)'),
    'Campina Grande, PB',
  );
}

afterEach(cleanup);

beforeEach(() => {
  registerMock.mockReset();
  toastSuccessMock.mockReset();
});

describe('RegisterForm', () => {
  it('exibe erros para todos os campos obrigatórios vazios', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      screen.getByText('Informe seu nome de usuário.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Informe seu nome completo.')).toBeInTheDocument();
    expect(screen.getByText('Informe seu e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument();
    expect(screen.getByText('Confirme sua senha.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome de usuário')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.queryByText('Informe seu telefone.')).not.toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });

  it('exibe erro de nome de usuário acima de 50 caracteres', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const usernameInput = screen.getByLabelText('Nome de usuário');
    fireEvent.change(usernameInput, { target: { value: 'a'.repeat(51) } });
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      screen.getByText('Nome de usuário deve ter no máximo 50 caracteres.'),
    ).toBeInTheDocument();
  });

  it('exibe erro de nome acima de 120 caracteres', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const nameInput = screen.getByLabelText('Nome completo');
    fireEvent.change(nameInput, { target: { value: 'a'.repeat(121) } });
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      screen.getByText('Nome deve ter no máximo 120 caracteres.'),
    ).toBeInTheDocument();
  });

  it('exibe erro de e-mail inválido e o remove após a correção', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const emailInput = screen.getByLabelText('E-mail');
    await user.type(emailInput, 'email-invalido');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');

    await user.clear(emailInput);
    await user.type(emailInput, 'ana@example.com');

    expect(
      screen.queryByText('Informe um e-mail válido.'),
    ).not.toBeInTheDocument();
    expect(emailInput).toHaveAttribute('aria-invalid', 'false');
  });

  it('exibe erro quando as senhas são diferentes e o remove ao igualar', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(screen.getByLabelText('Nome de usuário'), 'ana');
    await user.type(screen.getByLabelText('Nome completo'), 'Ana Silva');
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.type(screen.getByLabelText('Senha'), 'senha');
    const confirmationInput = screen.getByLabelText('Confirmação de senha');
    await user.type(confirmationInput, 'outra');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
    expect(confirmationInput).toHaveAttribute('aria-invalid', 'true');

    await user.clear(confirmationInput);
    await user.type(confirmationInput, 'senha');

    expect(
      screen.queryByText('As senhas não coincidem.'),
    ).not.toBeInTheDocument();
    expect(confirmationInput).toHaveAttribute('aria-invalid', 'false');
  });

  it('exibe erro de telefone inválido e o remove após a correção', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const phoneInput = screen.getByLabelText('Telefone (opcional)');
    await user.type(phoneInput, '(83) 9999-9999');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      screen.getByText('Informe um telefone brasileiro válido.'),
    ).toBeInTheDocument();
    expect(phoneInput).toHaveAttribute('aria-invalid', 'true');

    await user.clear(phoneInput);
    await user.type(phoneInput, '(83) 99999-9999');

    expect(
      screen.queryByText('Informe um telefone brasileiro válido.'),
    ).not.toBeInTheDocument();
    expect(phoneInput).toHaveAttribute('aria-invalid', 'false');
  });

  it('envia o payload correto sem campos opcionais vazios, exibe a confirmação e navega para /login', async () => {
    registerMock.mockResolvedValue(userProfile);
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(screen.getByLabelText('Nome de usuário'), 'ana');
    await user.type(screen.getByLabelText('Nome completo'), 'Ana Silva');
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.type(screen.getByLabelText('Senha'), 'senha123!');
    await user.type(screen.getByLabelText('Confirmação de senha'), 'senha123!');

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(registerMock).toHaveBeenCalledWith('ana@example.com', 'senha123!', {
      username: 'ana',
      name: 'Ana Silva',
    });
    expect(toastSuccessMock).toHaveBeenCalledWith(
      'Cadastro realizado com sucesso!', 
      {duration: 5000},
    );
    expect(await screen.findByText('Página de login')).toBeInTheDocument();
  });

  it('inclui telefone, bio e hometown no payload quando preenchidos', async () => {
    registerMock.mockResolvedValue(userProfile);
    const user = userEvent.setup();
    renderRegisterForm();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(registerMock).toHaveBeenCalledWith('ana@example.com', 'senha123!', {
      username: 'ana',
      name: 'Ana Silva',
      phone: '(83) 99999-9999',
      bio: 'Gosto de viagens',
      hometown: 'Campina Grande, PB',
    });
  });

  it('exibe mensagem do backend no conflito 409 e preserva os dados', async () => {
    registerMock.mockRejectedValue(new ApiError(409, null));
    const user = userEvent.setup();
    renderRegisterForm();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      await screen.findByText(
        'Este nome de usuário já está em uso ou esta conta já foi cadastrada.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@example.com');
    expect(screen.getByLabelText('Nome de usuário')).toHaveValue('ana');
    expect(screen.getByLabelText('Bio (opcional)')).toHaveValue(
      'Gosto de viagens',
    );
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeEnabled();
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });

  it('exibe mensagem amigável para erro 400', async () => {
    registerMock.mockRejectedValue(new ApiError(400, null));
    const user = userEvent.setup();
    renderRegisterForm();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      await screen.findByText(
        'Dados inválidos. Revise os campos e tente novamente.',
      ),
    ).toBeInTheDocument();
  });

  it('exibe mensagem amigável para erro 401', async () => {
    registerMock.mockRejectedValue(new ApiError(401, null));
    const user = userEvent.setup();
    renderRegisterForm();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      await screen.findByText(
        'Não foi possível validar sua autenticação. Tente novamente.',
      ),
    ).toBeInTheDocument();
  });

  it('exibe mensagem amigável para falha de rede', async () => {
    registerMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const user = userEvent.setup();
    renderRegisterForm();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      await screen.findByText(
        'Falha de conexão. Verifique sua internet e tente novamente.',
      ),
    ).toBeInTheDocument();
  });

  it('bloqueia envios duplicados enquanto a requisição está em andamento', async () => {
    registerMock.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    renderRegisterForm();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    const submitButton = await screen.findByRole('button', {
      name: 'Cadastrando...',
    });
    expect(submitButton).toBeDisabled();

    await user.click(submitButton);

    expect(registerMock).toHaveBeenCalledTimes(1);
  });
});
