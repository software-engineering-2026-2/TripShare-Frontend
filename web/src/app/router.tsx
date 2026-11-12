import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import MyTripsPage from '../pages/MyTripsPage';
import PlaceDetailsPage from '../pages/PlaceDetailsPage';
import RegisterPage from '../pages/RegisterPage';
import TouristSpotsPage from '../pages/TouristSpotsPage';

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
    path: '/pontos-turisticos',
    element: <TouristSpotsPage />,
  },
  {
    path: '/locais/:placeId',
    element: <PlaceDetailsPage />,
  },
]);
