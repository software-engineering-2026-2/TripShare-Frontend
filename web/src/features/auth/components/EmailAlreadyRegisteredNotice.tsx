import { Link } from 'react-router-dom';

export default function EmailAlreadyRegisteredNotice() {
  return (
    <div className="register-field__error" id="email-error" role="alert">
      <p>Este e-mail já está cadastrado.</p>
      <p>
        <Link to="/login">Entrar</Link> ou{' '}
        <Link to="/recuperar-senha">Esqueci a senha</Link>
      </p>
    </div>
  );
}