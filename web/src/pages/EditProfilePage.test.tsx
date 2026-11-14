import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUserById, updateCurrentUser } from '../services/userService';
import EditProfilePage from './EditProfilePage';

vi.mock('../services/userService', () => ({
  getUserById: vi.fn(),
  updateCurrentUser: vi.fn(),
}));

const getUserByIdMock = vi.mocked(getUserById);
const updateCurrentUserMock = vi.mocked(updateCurrentUser);

const user = {
  id: 'user-1',
  username: 'ana',
  name: 'Ana Souza',
  email: 'ana@example.com',
  phone: null,
  bio: 'Viajante',
  hometown: 'Recife',
  role: 'USER',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/perfil/user-1/editar']}>
      <Routes>
        <Route path="/perfil/:id/editar" element={<EditProfilePage />} />
        <Route path="/perfil/:id" element={<p>Perfil</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getUserByIdMock.mockResolvedValue(user);
});

describe('EditProfilePage', () => {
  it('carrega o formulário e envia alterações para o endpoint PATCH', async () => {
    updateCurrentUserMock.mockResolvedValue({
      ...user,
      name: 'Ana Atualizada',
    });
    const userEventInstance = userEvent.setup();

    renderPage();

    const nameInput = await screen.findByLabelText('Nome de exibição');
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
});
