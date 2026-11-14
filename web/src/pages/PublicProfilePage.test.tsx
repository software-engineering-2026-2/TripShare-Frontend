import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../services/api';
import { getCurrentUserProfile } from '../services/authService';
import { getUserById } from '../services/userService';
import PublicProfilePage from './PublicProfilePage';

vi.mock('../services/userService', () => ({
  getUserById: vi.fn(),
}));
vi.mock('../services/authService', () => ({
  getCurrentUserProfile: vi.fn(),
}));

const getUserByIdMock = vi.mocked(getUserById);
const getCurrentUserProfileMock = vi.mocked(getCurrentUserProfile);

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
    <MemoryRouter initialEntries={['/perfil/user-1']}>
      <Routes>
        <Route path="/perfil/:id" element={<PublicProfilePage />} />
        <Route path="/perfil/:id/editar" element={<p>Editar</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getCurrentUserProfileMock.mockRejectedValue(new Error('visitante'));
});

describe('PublicProfilePage', () => {
  it('carrega e exibe o perfil retornado pela API', async () => {
    getUserByIdMock.mockResolvedValue(user);

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Ana Souza' })).toBeInTheDocument();
    expect(screen.getByText('@ana')).toBeInTheDocument();
    expect(screen.getByText('Viajante')).toBeInTheDocument();
    expect(getUserByIdMock).toHaveBeenCalledWith('user-1');
  });

  it('exibe o link de edição somente para o próprio perfil', async () => {
    getUserByIdMock.mockResolvedValue(user);
    getCurrentUserProfileMock.mockResolvedValue(user);

    renderPage();

    expect(await screen.findByRole('link', { name: /Editar perfil/ })).toHaveAttribute(
      'href',
      '/perfil/user-1/editar',
    );
  });

  it('exibe estado de perfil não encontrado quando a API responde 404', async () => {
    getUserByIdMock.mockRejectedValue(new ApiError(404, null));

    renderPage();

    expect(
      await screen.findByText('Este perfil não foi encontrado.'),
    ).toBeInTheDocument();
  });
});
