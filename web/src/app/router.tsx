import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import MyTripsPage from '../pages/MyTripsPage';
import RegisterPage from '../pages/RegisterPage';
import TripDetailPage from '../pages/TripDetailPage';

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
    path: '/minhas-viagens/:tripId',
    element: <TripDetailPage />,
  },
]);
