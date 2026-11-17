import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loginWithGoogle } from '../services/authService';
import LoginPage from './LoginPage';

vi.mock('../services/authService', () => ({
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
}));

const loginWithGoogleMock = vi.mocked(loginWithGoogle);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('exibe mensagem de erro quando o login com Google falha', async () => {
    loginWithGoogleMock.mockRejectedValue(new Error('Google indisponível'));
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Continuar com o Google' }));

    expect(
      await screen.findByText(
        'Não foi possível entrar com o Google. Tente novamente.',
      ),
    ).toHaveAttribute('role', 'alert');
  });
});
