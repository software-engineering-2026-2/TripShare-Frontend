import { type RouteObject } from 'react-router-dom';
import LoginPage from '../pages/login';
import RegisterPage from '../pages/register';
import PasswordRecoveryPage from '../pages/password-recovery';
import AuthEntry from './AuthEntry';
import { routePatterns } from './paths';

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
  {
    path: routePatterns.passwordRecovery,
    element: <PasswordRecoveryPage />,
  },
];
