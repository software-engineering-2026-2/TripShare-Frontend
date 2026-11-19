// Contratos em TripShare-Backend/docs/api e docs/openapi.yaml.
const trips = '/trips';
const trip = (id: string) => `${trips}/${encodeURIComponent(id)}`;

export const apiRoutes = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
  },
  users: {
    profile: (id: string) => `/users/${encodeURIComponent(id)}`,
    me: '/users/me',
  },
  trips: {
    create: trips,
    update: trip,
    delete: trip,
    deletePreview: (id: string) => `${trip(id)}/delete-preview`,
    places: (id: string) => `${trip(id)}/places`,
  },
} as const;
