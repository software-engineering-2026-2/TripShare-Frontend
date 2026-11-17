import { cleanup, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { login } from '../services/authService';
import LoginPage from './LoginPage';

vi.mock('../services/authService', () => ({
  login: vi.fn(),
}));

const loginMock = vi.mocked(login);

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/" element={<p>Página inicial</p>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<p>Página de cadastro</p>} />
        <Route path="/recuperar-senha" element={<p>Página de recuperar senha</p>} />
        <Route path="/minhas-viagens" element={<p>Página Minhas Viagens</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillCredentials(user: UserEvent) {
  await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
  await user.type(screen.getByLabelText('Senha'), 'senha123!');
}

afterEach(cleanup);

beforeEach(() => {
  loginMock.mockReset();
});

describe('LoginPage', () => {
  it('navega para /minhas-viagens depois de entrar', async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({} as Awaited<ReturnType<typeof login>>);
    renderLoginPage();

    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(loginMock).toHaveBeenCalledWith('ana@example.com', 'senha123!');
    expect(await screen.findByText('Página Minhas Viagens')).toBeInTheDocument();
  });

  it('continua no login e mostra o erro quando as credenciais falham', async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValue(new Error('auth/invalid-credential'));
    renderLoginPage();

    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(
      await screen.findByText(
        'Não foi possível entrar. Verifique suas credenciais.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('Página Minhas Viagens')).not.toBeInTheDocument();
  });

  it.each([
    ['tripshare', 'Página inicial'],
    ['Esqueceu?', 'Página de recuperar senha'],
    ['Criar conta gratuita', 'Página de cadastro'],
  ])(
    'o link "%s" navega sem recarregar a página',
    async (linkName, destination) => {
      const user = userEvent.setup();
      renderLoginPage();

      await user.click(screen.getByRole('link', { name: linkName }));

      expect(await screen.findByText(destination)).toBeInTheDocument();
    },
  );
});
