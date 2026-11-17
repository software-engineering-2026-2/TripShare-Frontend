import { type RouteObject } from 'react-router-dom';
import EditProfilePage from '../pages/edit-profile';
import MyTripsPage from '../pages/my-trips';
import PlaceDetailsPage from '../pages/place-details';
import PublicProfilePage from '../pages/public-profile';
import TouristSpotsPage from '../pages/tourist-spots';
import TripDetailPage from '../pages/trip-detail';
import RequireSession from './RequireSession';
import { routePatterns } from './paths';

export const privateRoutes: RouteObject[] = [
  {
    element: <RequireSession allowDemo />,
    children: [
      { path: routePatterns.trips, element: <MyTripsPage /> },
      { path: routePatterns.trip, element: <TripDetailPage /> },
      { path: routePatterns.tripPlaces, element: <TouristSpotsPage /> },
      { path: routePatterns.legacyPlaces, element: <TouristSpotsPage /> },
      { path: routePatterns.place, element: <PlaceDetailsPage /> },
    ],
  },
  {
    element: <RequireSession />,
    children: [
      { path: routePatterns.editProfile, element: <EditProfilePage /> },
      { path: routePatterns.profile, element: <PublicProfilePage /> },
    ],
  },
];
