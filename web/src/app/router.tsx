import { createBrowserRouter, Navigate } from 'react-router-dom';
import EditProfilePage from '../pages/EditProfilePage';
import LoginPage from '../pages/LoginPage';
import MyTripsPage from '../pages/MyTripsPage';
import PlaceDetailsPage from '../pages/PlaceDetailsPage';
import PublicProfilePage from '../pages/PublicProfilePage';
import RegisterPage from '../pages/RegisterPage';
import TouristSpotsPage from '../pages/TouristSpotsPage';
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
  {
    path: '/minhas-viagens/:tripId/explorar',
    element: <TouristSpotsPage />,
  },
  {
    path: '/pontos-turisticos',
    element: <TouristSpotsPage />,
  },
  {
    path: '/locais/:placeId',
    element: <PlaceDetailsPage />,
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
