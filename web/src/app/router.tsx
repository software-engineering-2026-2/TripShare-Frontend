import { createBrowserRouter, Navigate } from 'react-router-dom';
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
]);
