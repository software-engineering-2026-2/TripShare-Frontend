import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../services/api';
import { getCurrentUserProfile } from '../services/authService';
import LoginPage from './LoginPage';

vi.mock('../services/authService', () => ({
  getCurrentUserProfile: vi.fn(),
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
}));

const getCurrentUserProfileMock = vi.mocked(getCurrentUserProfile);

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<p>Cadastro</p>} />
        <Route path="/minhas-viagens" element={<p>Minhas viagens</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('redireciona usuário cadastrado para minhas viagens', async () => {
    getCurrentUserProfileMock.mockResolvedValue({ id: 'user-1' });
    const user = userEvent.setup();

    renderLoginPage();
    await user.click(screen.getByRole('button', { name: 'Continuar com o Google' }));

    expect(await screen.findByText('Minhas viagens')).toBeInTheDocument();
    expect(getCurrentUserProfileMock).toHaveBeenCalledTimes(1);
  });

  it('redireciona usuário sem cadastro para o formulário de cadastro', async () => {
    getCurrentUserProfileMock.mockRejectedValue(new ApiError('Não encontrado', 404));
    const user = userEvent.setup();

    renderLoginPage();
    await user.click(screen.getByRole('button', { name: 'Continuar com o Google' }));

    expect(await screen.findByText('Cadastro')).toBeInTheDocument();
  });

  it('exibe erro quando não consegue consultar o perfil', async () => {
    getCurrentUserProfileMock.mockRejectedValue(new ApiError('Erro interno', 500));
    const user = userEvent.setup();

    renderLoginPage();
    await user.click(screen.getByRole('button', { name: 'Continuar com o Google' }));

    expect(
      await screen.findByText('Não foi possível entrar com o Google. Tente novamente.'),
    ).toBeInTheDocument();
  });
});
