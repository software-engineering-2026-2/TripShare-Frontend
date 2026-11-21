import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import EmailAlreadyRegisteredNotice from '../components/EmailAlreadyRegisteredNotice';

function renderNotice() {
  return render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <Routes>
        <Route path="/cadastro" element={<EmailAlreadyRegisteredNotice />} />
        <Route path="/login" element={<p>Página de login</p>} />
        <Route
          path="/recuperar-senha"
          element={<p>Página de recuperar senha</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe('EmailAlreadyRegisteredNotice', () => {
  it('orienta o método original e oferece apenas o link de login', async () => {
    const user = userEvent.setup();
    renderNotice();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'mesmo método utilizado na criação da conta: Google ou e-mail e senha',
    );
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(
      screen.queryByRole('link', { name: /Esqueci a senha/i }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Entrar' }));
    expect(await screen.findByText('Página de login')).toBeInTheDocument();
  });
});
