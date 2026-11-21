import { render } from '../../../test/render';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import toast from 'react-hot-toast';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../../resources/client/http';
import type { User } from 'firebase/auth';
import { completeRegistration, register } from '../../../resources/auth/flow';
import type { UserProfile } from '../../../resources/api/auth/contract';
import RegisterForm from '../components/RegisterForm';

vi.mock('../../../resources/auth/flow', () => ({
  AuthFlowError: class extends Error {},
  register: vi.fn(),
  completeRegistration: vi.fn(),
  logout: vi.fn(),
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
  authId: '7c2e9a10-1b3d-4f5e-8a6b-9c0d1e2f3a4b',
  uuid: 'firebase-uid',
  username: 'ana',
  name: 'Ana Silva',
  email: 'ana@example.com',
  phone: null,
  bio: null,
  hometown: null,
  role: 'USER',
  status: 'ACTIVE',
  createdAt: '2026-10-21T14:30:00Z',
  updatedAt: '2026-10-21T14:30:00Z',
};

function renderRegisterForm(user: User | null = null) {
  return render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <Routes>
        <Route path="/cadastro" element={<RegisterForm user={user} />} />
        <Route path="/login" element={<p>Página de login</p>} />
        <Route path="/minhas-viagens" element={<p>Página Minhas Viagens</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillValidForm(user: UserEvent) {
  await user.type(screen.getByLabelText('Nome de usuário'), 'ana');
  await user.type(screen.getByLabelText('Nome de exibição'), 'Ana Silva');
  await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
  await user.type(screen.getByLabelText('Senha'), 'senha123!');
  await user.type(screen.getByLabelText('Confirmação de senha'), 'senha123!');
}

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

beforeEach(() => {
  vi.stubEnv('VITE_TERMS_OF_USE_URL', 'https://example.com/terms');
  vi.stubEnv('VITE_PRIVACY_POLICY_URL', 'https://example.com/privacy');
  registerMock.mockReset();
  vi.mocked(completeRegistration).mockReset();
  toastSuccessMock.mockReset();
});

describe('RegisterForm', () => {
  it('conclui o perfil da conta conectada sem exigir senha nem alterar o e-mail', async () => {
    vi.mocked(completeRegistration).mockResolvedValue(userProfile);
    const user = userEvent.setup();
    renderRegisterForm({
      uid: 'firebase-uid',
      email: 'ana@example.com',
      displayName: 'Ana Silva',
    } as User);

    expect(screen.queryByLabelText(/telefone/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/bio/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/cidade natal/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Senha')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Confirmação de senha'),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Nome de exibição')).toHaveValue('Ana Silva');
    await user.type(screen.getByLabelText('Nome de usuário'), 'ana');
    if (!(screen.getByRole('checkbox') as HTMLInputElement).checked)
      fireEvent.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(completeRegistration).toHaveBeenCalledWith('firebase-uid', {
      username: 'ana',
      name: 'Ana Silva',
    });
    expect(registerMock).not.toHaveBeenCalled();
    expect(
      await screen.findByText('Página Minhas Viagens'),
    ).toBeInTheDocument();
  });
  it('desabilita o cadastro com Google enquanto não há integração', () => {
    renderRegisterForm();

    expect(
      screen.getByRole('button', { name: 'Continuar com o Google' }),
    ).toBeDisabled();
  });

  it('exibe erros para todos os campos obrigatórios vazios', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    if (!(screen.getByRole('checkbox') as HTMLInputElement).checked)
      fireEvent.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      screen.getByText('Informe seu nome de usuário.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Informe seu nome de exibição.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Informe seu e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument();
    expect(screen.getByText('Confirme sua senha.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome de usuário')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(registerMock).not.toHaveBeenCalled();
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });

  it('exibe erro de nome de usuário acima de 50 caracteres', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const usernameInput = screen.getByLabelText('Nome de usuário');
    fireEvent.change(usernameInput, { target: { value: 'a'.repeat(51) } });
    if (!(screen.getByRole('checkbox') as HTMLInputElement).checked)
      fireEvent.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      screen.getByText('Nome de usuário deve ter no máximo 50 caracteres.'),
    ).toBeInTheDocument();
  });

  it('exibe erro de nome acima de 120 caracteres', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    const nameInput = screen.getByLabelText('Nome de exibição');
    fireEvent.change(nameInput, { target: { value: 'a'.repeat(121) } });
    if (!(screen.getByRole('checkbox') as HTMLInputElement).checked)
      fireEvent.click(screen.getByRole('checkbox'));
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
    if (!(screen.getByRole('checkbox') as HTMLInputElement).checked)
      fireEvent.click(screen.getByRole('checkbox'));
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
    await user.type(screen.getByLabelText('Nome de exibição'), 'Ana Silva');
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.type(screen.getByLabelText('Senha'), 'senha');
    const confirmationInput = screen.getByLabelText('Confirmação de senha');
    await user.type(confirmationInput, 'outra');
    if (!(screen.getByRole('checkbox') as HTMLInputElement).checked)
      fireEvent.click(screen.getByRole('checkbox'));
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

  it('envia o perfil e vai direto para minhas viagens, sem voltar ao login', async () => {
    registerMock.mockResolvedValue(userProfile);
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(screen.getByLabelText('Nome de usuário'), 'ana');
    await user.type(screen.getByLabelText('Nome de exibição'), 'Ana Silva');
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.type(screen.getByLabelText('Senha'), 'senha123!');
    await user.type(screen.getByLabelText('Confirmação de senha'), 'senha123!');

    if (!(screen.getByRole('checkbox') as HTMLInputElement).checked)
      fireEvent.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(registerMock).toHaveBeenCalledWith('ana@example.com', 'senha123!', {
      username: 'ana',
      name: 'Ana Silva',
    });
    expect(toastSuccessMock).toHaveBeenCalledWith(
      'Cadastro realizado com sucesso!',
      { duration: 5000 },
    );
    expect(
      await screen.findByText('Página Minhas Viagens'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Página de login')).not.toBeInTheDocument();
  });

  it('solicita e envia apenas os dados mínimos do perfil', async () => {
    registerMock.mockResolvedValue(userProfile);
    const user = userEvent.setup();
    renderRegisterForm();

    expect(screen.queryByLabelText(/telefone/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/bio/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/cidade natal/i)).not.toBeInTheDocument();
    await fillValidForm(user);
    if (!(screen.getByRole('checkbox') as HTMLInputElement).checked)
      fireEvent.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(registerMock).toHaveBeenCalledWith('ana@example.com', 'senha123!', {
      username: 'ana',
      name: 'Ana Silva',
    });
  });

  it('exibe mensagem do backend no conflito 409 e preserva os dados', async () => {
    registerMock.mockRejectedValue(new ApiError(409, null));
    const user = userEvent.setup();
    renderRegisterForm();

    await fillValidForm(user);
    if (!(screen.getByRole('checkbox') as HTMLInputElement).checked)
      fireEvent.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      await screen.findByText(
        'Este nome de usuário já está em uso ou esta conta já foi cadastrada.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@example.com');
    expect(screen.getByLabelText('Nome de usuário')).toHaveValue('ana');
    expect(screen.getByLabelText('Nome de exibição')).toHaveValue('Ana Silva');
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeEnabled();
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });

  it('exibe mensagem amigável para erro 400', async () => {
    registerMock.mockRejectedValue(new ApiError(400, null));
    const user = userEvent.setup();
    renderRegisterForm();

    await fillValidForm(user);
    if (!(screen.getByRole('checkbox') as HTMLInputElement).checked)
      fireEvent.click(screen.getByRole('checkbox'));
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
    if (!(screen.getByRole('checkbox') as HTMLInputElement).checked)
      fireEvent.click(screen.getByRole('checkbox'));
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
    if (!(screen.getByRole('checkbox') as HTMLInputElement).checked)
      fireEvent.click(screen.getByRole('checkbox'));
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
    if (!(screen.getByRole('checkbox') as HTMLInputElement).checked)
      fireEvent.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    const submitButton = await screen.findByRole('button', {
      name: 'Cadastrando...',
    });
    expect(submitButton).toBeDisabled();

    await user.click(submitButton);

    expect(registerMock).toHaveBeenCalledTimes(1);
  });
});

it.each([
  null,
  {
    uid: 'firebase-uid',
    email: 'ana@example.com',
    displayName: 'Ana Silva',
  } as User,
])('bloqueia cadastro sem aceite para conta %j', async (connectedUser) => {
  const user = userEvent.setup();
  renderRegisterForm(connectedUser);
  if (connectedUser) {
    await user.type(screen.getByLabelText('Nome de usuário'), 'ana');
  } else {
    await fillValidForm(user);
  }
  expect(screen.getByRole('checkbox')).not.toBeChecked();
  await user.click(screen.getByRole('button', { name: 'Cadastrar' }));
  expect(
    screen.getByText(
      'Aceite os Termos de Uso e a Política de Privacidade para continuar.',
    ),
  ).toBeInTheDocument();
  expect(registerMock).not.toHaveBeenCalled();
  expect(completeRegistration).not.toHaveBeenCalled();
});

it('disponibiliza os dois documentos sem abandonar o formulário', () => {
  renderRegisterForm();
  expect(screen.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute(
    'href',
    'https://example.com/terms',
  );
  expect(
    screen.getByRole('link', { name: 'Política de Privacidade' }),
  ).toHaveAttribute('href', 'https://example.com/privacy');
  expect(screen.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute(
    'target',
    '_blank',
  );
});

it('impede cadastro quando os links legais não estão configurados', async () => {
  vi.stubEnv('VITE_TERMS_OF_USE_URL', '');
  renderRegisterForm();
  await fillValidForm(userEvent.setup());
  await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
  expect(screen.getByRole('checkbox')).toBeDisabled();
  expect(
    screen.getByText(
      'Os documentos legais estão indisponíveis. Tente novamente mais tarde.',
    ),
  ).toBeInTheDocument();
  expect(registerMock).not.toHaveBeenCalled();
});
