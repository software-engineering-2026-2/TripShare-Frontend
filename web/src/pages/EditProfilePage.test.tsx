import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../services/api';
import {
  getCurrentUserProfile,
  type UserProfile,
} from '../services/authService';
import { updateMyProfile } from '../services/usersService';
import EditProfilePage from './EditProfilePage';

vi.mock('../services/authService', () => ({
  getCurrentUserProfile: vi.fn(),
}));

vi.mock('../services/usersService', () => ({
  updateMyProfile: vi.fn(),
}));

const getCurrentUserProfileMock = vi.mocked(getCurrentUserProfile);
const updateMyProfileMock = vi.mocked(updateMyProfile);

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

const outroProfileId = 'outro-usuario-id';

function PublicProfileStub() {
  const { id } = useParams<{ id: string }>();
  return <p>Perfil público {id}</p>;
}

function renderPage(routeId: string = profile.id) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/perfil/${routeId}/editar`]}>
        <Routes>
          <Route path="/perfil/:id/editar" element={<EditProfilePage />} />
          <Route path="/perfil/:id" element={<PublicProfileStub />} />
          <Route path="/login" element={<p>Página de login</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('EditProfilePage', () => {
  it('permite acessar a edição do próprio perfil', async () => {
    getCurrentUserProfileMock.mockResolvedValue(profile);

    renderPage();

    expect(await screen.findByDisplayValue('Nome Atual')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bio atual')).toBeInTheDocument();
  });

  it('atualiza os dados exibidos após salvar', async () => {
    const user = userEvent.setup();
    getCurrentUserProfileMock.mockResolvedValue(profile);
    updateMyProfileMock.mockResolvedValue({
      ...profile,
      name: 'Nome Atualizado',
    });

    renderPage();

    const nameInput = await screen.findByLabelText('Nome de exibição');
    fireEvent.change(nameInput, { target: { value: 'Nome Atualizado' } });
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('Perfil atualizado com sucesso.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Nome de exibição')).toHaveValue(
      'Nome Atualizado',
    );
    expect(updateMyProfileMock).toHaveBeenCalledWith({
      name: 'Nome Atualizado',
    });
  });

  it('nega a edição de outro perfil e redireciona para o próprio perfil', async () => {
    getCurrentUserProfileMock.mockResolvedValue(profile);

    renderPage(outroProfileId);

    expect(
      await screen.findByText(`Perfil público ${profile.id}`),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Nome de exibição')).not.toBeInTheDocument();
  });

  it('redireciona usuário não autenticado para o login', async () => {
    getCurrentUserProfileMock.mockRejectedValue(
      new Error('Usuário não autenticado.'),
    );

    renderPage();

    expect(await screen.findByText('Página de login')).toBeInTheDocument();
  });

  it('não redireciona antes da autenticação terminar de carregar', () => {
    getCurrentUserProfileMock.mockImplementation(
      () => new Promise<UserProfile>(() => {}),
    );

    renderPage();

    expect(screen.getByText('Carregando perfil...')).toBeInTheDocument();
    expect(screen.queryByText('Página de login')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nome de exibição')).not.toBeInTheDocument();
  });

  it('mostra erro ao falhar o carregamento', async () => {
    getCurrentUserProfileMock.mockRejectedValue(new ApiError(500, null));

    renderPage();

    expect(
      await screen.findByText('Não foi possível carregar seu perfil.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    ).toBeInTheDocument();
  });

  it('navega para o próprio perfil público ao cancelar', async () => {
    const user = userEvent.setup();
    getCurrentUserProfileMock.mockResolvedValue(profile);

    renderPage();

    await screen.findByDisplayValue('Nome Atual');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(
      await screen.findByText(`Perfil público ${profile.id}`),
    ).toBeInTheDocument();
  });
});
