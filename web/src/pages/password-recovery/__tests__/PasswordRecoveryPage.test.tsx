import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { render } from '../../../test/render';
import { requestPasswordReset } from '../../../resources/auth/passwordRecovery';
import PasswordRecoveryPage from '..';
vi.mock('../../../resources/auth/passwordRecovery', () => ({
  requestPasswordReset: vi.fn(),
}));
const send = vi.mocked(requestPasswordReset);
beforeEach(() => {
  send.mockReset();
});
afterEach(cleanup);
function show() {
  render(
    <MemoryRouter>
      <PasswordRecoveryPage />
    </MemoryRouter>,
  );
}
async function submit(email = 'ana@example.com') {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('E-mail'), email);
  await user.click(screen.getByRole('button', { name: 'Enviar instruções' }));
  return user;
}
it.each(['ana@example.com', 'unknown@example.com'])(
  'confirma sem revelar existência de %s',
  async (email) => {
    send.mockResolvedValue();
    show();
    await submit(email);
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Se houver uma conta com senha para este e-mail',
    );
    expect(send).toHaveBeenCalledWith(email, expect.any(Object));
    expect(screen.getByText(/apenas com o Google/)).toBeInTheDocument();
  },
);
it('valida e-mail antes de enviar', async () => {
  show();
  await submit('invalid');
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Informe um e-mail válido.',
  );
  expect(send).not.toHaveBeenCalled();
});
it('evita envio duplicado enquanto aguarda o Firebase', async () => {
  send.mockReturnValue(new Promise(() => {}));
  show();
  const user = await submit();
  const button = screen.getByRole('button', { name: 'Enviando...' });
  expect(button).toBeDisabled();
  await user.click(button);
  expect(send).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
it('informa falha sem detalhes da conta e permite repetir', async () => {
  send.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce();
  show();
  const user = await submit();
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Não foi possível enviar a solicitação.',
  );
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Enviar instruções' }));
  expect(await screen.findByRole('status')).toBeInTheDocument();
});
