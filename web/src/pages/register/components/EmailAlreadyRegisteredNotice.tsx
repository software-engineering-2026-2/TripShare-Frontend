import { routes } from '../../../routes/paths';
import { Link } from 'react-router-dom';

export default function EmailAlreadyRegisteredNotice() {
  return (
    <div className="register-field__error" id="email-error" role="alert">
      <p>
        Este e-mail já está cadastrado. Entre usando o mesmo método utilizado na
        criação da conta: Google ou e-mail e senha.
      </p>
      <p>
        <Link to={routes.login}>Entrar</Link>
      </p>
    </div>
  );
}
