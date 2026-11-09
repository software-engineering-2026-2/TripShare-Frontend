import { createBrowserRouter, Navigate } from 'react-router-dom';
import EditProfilePage from '../pages/EditProfilePage';
import LoginPage from '../pages/LoginPage';
import MyTripsPage from '../pages/MyTripsPage';
import PublicProfilePage from '../pages/PublicProfilePage';
import RegisterPage from '../pages/RegisterPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/cadastro" replace />,
  },
  {
    path: '/cadastro',
    element: <RegisterPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/minhas-viagens',
    element: <MyTripsPage />,
  },
  {
    path: '/perfil/:id/editar',
    element: <EditProfilePage />,
  },
  {
    path: '/perfil/:id',
    element: <PublicProfilePage />,
  },
]);
