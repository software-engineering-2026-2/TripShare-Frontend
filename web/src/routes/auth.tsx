import { type RouteObject } from 'react-router-dom';
import LoginPage from '../pages/login';
import RegisterPage from '../pages/register';
import UnavailablePage from '../pages/unavailable';
import AuthEntry from './AuthEntry';
import { routePatterns, routes } from './paths';

export const authRoutes: RouteObject[] = [
  {
    path: routePatterns.register,
    element: (
      <AuthEntry key="register" registration>
        {(user) => <RegisterPage user={user} />}
      </AuthEntry>
    ),
  },
  {
    path: routePatterns.login,
    element: <AuthEntry key="login">{() => <LoginPage />}</AuthEntry>,
  },
  // TODO(backend): o fluxo de recuperação de senha ainda não foi integrado.
  {
    path: routePatterns.passwordRecovery,
    element: (
      <UnavailablePage
        title="Recuperação de senha indisponível"
        backTo={routes.login}
        backLabel="Voltar ao login"
      />
    ),
  },
];
