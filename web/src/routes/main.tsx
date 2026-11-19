import { Navigate, type RouteObject } from 'react-router-dom';
import UnavailablePage from '../pages/unavailable';
import { routePatterns, routes } from './paths';

export const mainRoutes: RouteObject[] = [
  {
    path: routePatterns.root,
    element: <Navigate to={routes.register} replace />,
  },
  {
    path: routePatterns.notFound,
    element: (
      <UnavailablePage
        title="Página não encontrada"
        backTo={routes.root}
        backLabel="Voltar ao início"
      />
    ),
  },
];
