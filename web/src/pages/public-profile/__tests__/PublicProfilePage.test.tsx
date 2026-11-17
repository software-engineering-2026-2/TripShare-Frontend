import { render } from '../../../test/render';
import { cleanup, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../../resources/client/http';
import { getCurrentUserProfile } from '../../../resources/auth/flow';
import { getUserById } from '../../../resources/api/users/services';
import PublicProfilePage from '..';

vi.mock('../../../resources/api/users/services', () => ({
  getUserById: vi.fn(),
}));
vi.mock('../../../resources/auth/flow', () => ({
  getCurrentUserProfile: vi.fn(),
}));

const getUserByIdMock = vi.mocked(getUserById);
const getCurrentUserProfileMock = vi.mocked(getCurrentUserProfile);

// GET /users/{id} retorna só os dados públicos, sem id.
const user = {
  username: 'ana',
  name: 'Ana Souza',
  bio: 'Viajante',
  hometown: 'Recife',
};

function currentUser(id: string) {
  return {
    id,
    authId: 'auth-1',
    uuid: 'firebase-uid',
    username: 'ana',
    name: 'Ana Souza',
    email: 'ana@example.com',
    phone: null,
    bio: 'Viajante',
    hometown: 'Recife',
    role: 'USER' as const,
    status: 'ACTIVE' as const,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

function renderPage() {
  return render(
    <MemoryRouter
      initialEntries={['/perfil/10000000-0000-0000-0000-000000000001']}
    >
      <Routes>
        <Route path="/perfil/:id" element={<PublicProfilePage />} />
        <Route path="/perfil/:id/editar" element={<p>Editar</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

// Sem globals no Vitest, a Testing Library não limpa a tela sozinha entre os testes.
afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  getCurrentUserProfileMock.mockRejectedValue(new Error('visitante'));
});

describe('PublicProfilePage', () => {
  it('carrega e exibe o perfil retornado pela API', async () => {
    getUserByIdMock.mockResolvedValue(user);

    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Ana Souza' }),
    ).toBeInTheDocument();
    expect(screen.getByText('@ana')).toBeInTheDocument();
    expect(screen.getByText('Viajante')).toBeInTheDocument();
    expect(getUserByIdMock).toHaveBeenCalledWith(
      '10000000-0000-0000-0000-000000000001',
      expect.any(AbortSignal),
    );
  });

  it('exibe o link de edição somente para o próprio perfil', async () => {
    getUserByIdMock.mockResolvedValue(user);
    getCurrentUserProfileMock.mockResolvedValue(
      currentUser('10000000-0000-0000-0000-000000000001'),
    );

    renderPage();

    expect(
      await screen.findByRole('link', { name: /Editar perfil/ }),
    ).toHaveAttribute(
      'href',
      '/perfil/10000000-0000-0000-0000-000000000001/editar',
    );
  });

  it('não exibe o link de edição no perfil de outra pessoa', async () => {
    getUserByIdMock.mockResolvedValue(user);
    getCurrentUserProfileMock.mockResolvedValue(
      currentUser('10000000-0000-0000-0000-000000000002'),
    );

    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Ana Souza' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Editar perfil/ }),
    ).not.toBeInTheDocument();
  });

  it('exibe estado de perfil não encontrado quando a API responde 404', async () => {
    getUserByIdMock.mockRejectedValue(new ApiError(404, null));

    renderPage();

    expect(
      await screen.findByText('Este perfil não foi encontrado.'),
    ).toBeInTheDocument();
  });
});
