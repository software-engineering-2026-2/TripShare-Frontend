import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getCurrentUserProfile } from '../services/authService';
import { updateCurrentUser } from '../services/userService';
import EditProfilePage from './EditProfilePage';

vi.mock('../services/authService', () => ({
  getCurrentUserProfile: vi.fn(),
}));
vi.mock('../services/userService', () => ({
  updateCurrentUser: vi.fn(),
}));

const getCurrentUserProfileMock = vi.mocked(getCurrentUserProfile);
const updateCurrentUserMock = vi.mocked(updateCurrentUser);

// Formato de POST /auth/login e PATCH /users/me no README do back-end.
const user = {
  id: 'user-1',
  authId: 'auth-1',
  uuid: 'firebase-uid',
  username: 'ana',
  name: 'Ana Souza',
  email: 'ana@example.com',
  phone: '+5583999999999',
  bio: 'Viajante',
  hometown: 'Recife',
  role: 'USER',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderPage(path = '/perfil/user-1/editar') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/perfil/:id/editar" element={<EditProfilePage />} />
        <Route path="/perfil/:id" element={<p>Perfil</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

// Sem globals no Vitest, a Testing Library não limpa a tela sozinha entre os testes.
afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  getCurrentUserProfileMock.mockResolvedValue(user);
});

describe('EditProfilePage', () => {
  it('carrega o perfil do usuário logado e envia alterações para o endpoint PATCH', async () => {
    updateCurrentUserMock.mockResolvedValue({
      ...user,
      name: 'Ana Atualizada',
    });
    const userEventInstance = userEvent.setup();

    renderPage();

    const nameInput = await screen.findByLabelText('Nome de exibição');
    expect(nameInput).toHaveValue('Ana Souza');
    await userEventInstance.clear(nameInput);
    await userEventInstance.type(nameInput, 'Ana Atualizada');
    await userEventInstance.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(updateCurrentUserMock).toHaveBeenCalledWith({
      name: 'Ana Atualizada',
    });
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Perfil atualizado com sucesso.',
    );
  });

  it('não permite editar o perfil de outra pessoa', async () => {
    renderPage('/perfil/user-2/editar');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Você só pode editar o seu próprio perfil.',
    );
    expect(screen.queryByLabelText('Nome de exibição')).not.toBeInTheDocument();
    expect(updateCurrentUserMock).not.toHaveBeenCalled();
  });

  it('exibe erro quando não consegue carregar o perfil do usuário logado', async () => {
    getCurrentUserProfileMock.mockRejectedValue(new Error('sem sessão'));

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar este perfil.',
    );
  });
});
