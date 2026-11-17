import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import EmailAlreadyRegisteredNotice from './EmailAlreadyRegisteredNotice';

function renderNotice() {
  return render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <Routes>
        <Route path="/cadastro" element={<EmailAlreadyRegisteredNotice />} />
        <Route path="/login" element={<p>Página de login</p>} />
        <Route path="/recuperar-senha" element={<p>Página de recuperar senha</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe('EmailAlreadyRegisteredNotice', () => {
  it.each([
    ['Entrar', 'Página de login'],
    ['Esqueci a senha', 'Página de recuperar senha'],
  ])(
    'o link "%s" navega sem recarregar a página',
    async (linkName, destination) => {
      const user = userEvent.setup();
      renderNotice();

      await user.click(screen.getByRole('link', { name: linkName }));

      expect(await screen.findByText(destination)).toBeInTheDocument();
    },
  );
});
