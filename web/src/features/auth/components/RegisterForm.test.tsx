import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import RegisterForm from './RegisterForm';

afterEach(cleanup);

describe('RegisterForm', () => {
  it('exibe erros para todos os campos obrigatórios vazios', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      screen.getByText('Informe seu nome de usuário.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Informe seu e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Informe seu telefone.')).toBeInTheDocument();
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument();
    expect(screen.getByText('Confirme sua senha.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome de usuário')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('exibe erro de e-mail inválido e o remove após a correção', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText('E-mail');
    await user.type(emailInput, 'email-invalido');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');

    await user.clear(emailInput);
    await user.type(emailInput, 'ana@example.com');

    expect(
      screen.queryByText('Informe um e-mail válido.'),
    ).not.toBeInTheDocument();
    expect(emailInput).toHaveAttribute('aria-invalid', 'false');
  });

  it('exibe erro quando as senhas são diferentes e o remove ao igualar', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Nome de usuário'), 'ana');
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.type(screen.getByLabelText('Telefone'), '(83) 99999-9999');
    await user.type(screen.getByLabelText('Senha'), 'senha');
    const confirmationInput = screen.getByLabelText('Confirmação de senha');
    await user.type(confirmationInput, 'outra');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
    expect(confirmationInput).toHaveAttribute('aria-invalid', 'true');

    await user.clear(confirmationInput);
    await user.type(confirmationInput, 'senha');

    expect(
      screen.queryByText('As senhas não coincidem.'),
    ).not.toBeInTheDocument();
    expect(confirmationInput).toHaveAttribute('aria-invalid', 'false');
  });

  it('exibe erro de telefone inválido e o remove após a correção', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const phoneInput = screen.getByLabelText('Telefone');
    await user.type(phoneInput, '(83) 9999-9999');
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      screen.getByText('Informe um telefone brasileiro válido.'),
    ).toBeInTheDocument();
    expect(phoneInput).toHaveAttribute('aria-invalid', 'true');

    await user.clear(phoneInput);
    await user.type(phoneInput, '(83) 99999-9999');

    expect(
      screen.queryByText('Informe um telefone brasileiro válido.'),
    ).not.toBeInTheDocument();
    expect(phoneInput).toHaveAttribute('aria-invalid', 'false');
  });
});
