import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../services/api';
import {
  getCurrentUserProfile,
  type UserProfile,
} from '../services/authService';
import { getPublicProfile, type PublicProfile } from '../services/usersService';
import PublicProfilePage from './PublicProfilePage';

vi.mock('../services/authService', () => ({
  getCurrentUserProfile: vi.fn(),
}));

vi.mock('../services/usersService', () => ({
  getPublicProfile: vi.fn(),
  updateMyProfile: vi.fn(),
}));

const getPublicProfileMock = vi.mocked(getPublicProfile);
const getCurrentUserProfileMock = vi.mocked(getCurrentUserProfile);

const profileId = 'b3f1c0de-4a2e-4c1b-9d57-0e8f6a1c2d34';

const profile: PublicProfile = {
  username: 'viajante',
  name: 'Nome do usuário',
  bio: 'Gosto de viajar',
  hometown: 'Campina Grande',
};

const otherUser: UserProfile = {
  id: 'outro-usuario-id',
  username: 'outro',
  name: 'Outro Usuário',
  email: 'outro@email.com',
  phone: null,
  bio: null,
  hometown: null,
  role: 'USER',
  status: 'ACTIVE',
  createdAt: '2026-10-21T14:30:00Z',
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/perfil/${profileId}`]}>
        <Routes>
          <Route path="/perfil/:id" element={<PublicProfilePage />} />
          <Route path="/perfil/:id/editar" element={<p>Edição de perfil</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getCurrentUserProfileMock.mockResolvedValue(otherUser);
});

afterEach(() => {
  cleanup();
});

describe('PublicProfilePage', () => {
  it('renderiza o nome de exibição', async () => {
    getPublicProfileMock.mockResolvedValue(profile);

    renderPage();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Nome do usuário' }),
    ).toBeInTheDocument();
    expect(getPublicProfileMock).toHaveBeenCalledWith(profileId);
  });

  it('exibe biografia e cidade de origem', async () => {
    getPublicProfileMock.mockResolvedValue(profile);

    renderPage();

    expect(await screen.findByText('Gosto de viajar')).toBeInTheDocument();
    expect(screen.getByText(/Campina Grande/)).toBeInTheDocument();
  });

  it('não exibe e-mail na interface', async () => {
    getPublicProfileMock.mockResolvedValue(profile);

    renderPage();

    await screen.findByRole('heading', { level: 1, name: 'Nome do usuário' });
    expect(document.body.textContent).not.toMatch(/\S+@\S+\.\S+/);
  });

  it('exibe o estado de carregamento', () => {
    getPublicProfileMock.mockImplementation(
      () => new Promise<PublicProfile>(() => {}),
    );

    renderPage();

    expect(screen.getByText('Carregando perfil...')).toBeInTheDocument();
  });

  it('trata perfil inexistente (404) sem botão de repetir', async () => {
    getPublicProfileMock.mockRejectedValue(new ApiError(404, null));

    renderPage();

    expect(
      await screen.findByText('Este perfil não foi encontrado.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Tentar novamente' }),
    ).not.toBeInTheDocument();
  });

  it('trata perfil suspenso (403) sem botão de repetir', async () => {
    getPublicProfileMock.mockRejectedValue(new ApiError(403, null));

    renderPage();

    expect(
      await screen.findByText('Este perfil está suspenso.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Tentar novamente' }),
    ).not.toBeInTheDocument();
  });

  it('mostra o estado de perfil sem publicações', async () => {
    getPublicProfileMock.mockResolvedValue(profile);

    renderPage();

    expect(
      await screen.findByText('Este usuário ainda não possui publicações.'),
    ).toBeInTheDocument();
  });

  it('exibe a ação de editar apenas no próprio perfil', async () => {
    getPublicProfileMock.mockResolvedValue(profile);
    getCurrentUserProfileMock.mockResolvedValue({
      ...otherUser,
      id: profileId,
    });

    renderPage();

    const editLink = await screen.findByRole('link', {
      name: 'Editar perfil',
    });
    expect(editLink).toHaveAttribute('href', `/perfil/${profileId}/editar`);
  });

  it('oculta a ação de editar no perfil de outra pessoa', async () => {
    getPublicProfileMock.mockResolvedValue(profile);

    renderPage();

    await screen.findByRole('heading', { level: 1, name: 'Nome do usuário' });
    expect(
      screen.queryByRole('link', { name: 'Editar perfil' }),
    ).not.toBeInTheDocument();
  });

  it('não exibe a ação enquanto a autenticação carrega', async () => {
    getPublicProfileMock.mockResolvedValue(profile);
    getCurrentUserProfileMock.mockImplementation(
      () => new Promise<UserProfile>(() => {}),
    );

    renderPage();

    await screen.findByRole('heading', { level: 1, name: 'Nome do usuário' });
    expect(
      screen.queryByRole('link', { name: 'Editar perfil' }),
    ).not.toBeInTheDocument();
  });
});
