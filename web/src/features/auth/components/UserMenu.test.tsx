import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { logout } from '../../../services/authService';
import UserMenu from './UserMenu';

vi.mock('../../../services/authService', () => ({
  logout: vi.fn(),
}));

const logoutMock = vi.mocked(logout);
const replaceMock = vi.fn();

function renderUserMenu() {
  const user = userEvent.setup();
  render(<UserMenu />);

  return { user, trigger: screen.getByRole('button', { name: 'Minha conta' }) };
}

async function openMenuAndClickLogout() {
  const { user, trigger } = renderUserMenu();

  await user.click(trigger);
  await user.click(screen.getByRole('menuitem', { name: 'Sair' }));
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  logoutMock.mockReset();
  replaceMock.mockReset();
  // jsdom não implementa navegação; o redirecionamento é verificado pelo mock.
  vi.stubGlobal('location', { ...window.location, replace: replaceMock });
});

describe('UserMenu', () => {
  it('exibe o item Sair ao abrir o menu', async () => {
    const { user, trigger } = renderUserMenu();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toBeInTheDocument();
  });

  it('chama o logout e redireciona para /login em caso de sucesso', async () => {
    logoutMock.mockResolvedValue();

    await openMenuAndClickLogout();

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith('/login');
  });

  it('redireciona para /login mesmo quando o logout falha', async () => {
    logoutMock.mockRejectedValue(new Error('Erro 401 ao chamar /auth/logout'));

    await openMenuAndClickLogout();

    expect(replaceMock).toHaveBeenCalledWith('/login');
  });

  it('desabilita o item e exibe "Saindo..." durante a requisição', async () => {
    logoutMock.mockReturnValue(new Promise(() => {}));

    await openMenuAndClickLogout();

    expect(screen.getByRole('menuitem', { name: 'Saindo...' })).toBeDisabled();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
