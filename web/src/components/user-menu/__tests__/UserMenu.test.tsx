import { render } from '../../../test/render';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { logout } from '../../../resources/auth/flow';
import UserMenu from '../UserMenu';

vi.mock('../../../resources/auth/flow', () => ({
  logout: vi.fn(),
}));

const logoutMock = vi.mocked(logout);

function renderUserMenu() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<UserMenu />} />
        <Route path="/login" element={<h1>Login</h1>} />
      </Routes>
    </MemoryRouter>,
  );

  return { user, trigger: screen.getByRole('button', { name: 'Minha conta' }) };
}

async function openMenuAndClickLogout() {
  const { user, trigger } = renderUserMenu();

  await user.click(trigger);
  await user.click(screen.getByRole('menuitem', { name: 'Sair' }));
}

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  logoutMock.mockReset();
});

describe('UserMenu', () => {
  it('exibe o item Sair ao abrir o menu', async () => {
    const { user, trigger } = renderUserMenu();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toBeInTheDocument();
  });

  it('foca a ação ao abrir e devolve o foco ao fechar com Escape', async () => {
    const { user, trigger } = renderUserMenu();
    await user.click(trigger);
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('fecha quando o teclado sai do menu', async () => {
    const { user, trigger } = renderUserMenu();
    await user.click(trigger);
    await user.tab();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('chama o logout e redireciona para /login em caso de sucesso', async () => {
    logoutMock.mockResolvedValue();

    await openMenuAndClickLogout();

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByRole('heading', { name: 'Login' }),
    ).toBeInTheDocument();
  });

  it('mantém o menu disponível quando o Firebase não encerra a sessão', async () => {
    logoutMock.mockRejectedValue(new Error('Falha no Firebase'));

    await openMenuAndClickLogout();

    expect(await screen.findByRole('menuitem', { name: 'Sair' })).toBeEnabled();
  });

  it('desabilita o item e exibe "Saindo..." durante a requisição', async () => {
    logoutMock.mockReturnValue(new Promise(() => {}));

    await openMenuAndClickLogout();

    expect(screen.getByRole('menuitem', { name: 'Saindo...' })).toBeDisabled();
    expect(
      screen.queryByRole('heading', { name: 'Login' }),
    ).not.toBeInTheDocument();
  });
});
