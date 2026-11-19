export const routePatterns = {
  root: '/',
  register: '/cadastro',
  login: '/login',
  passwordRecovery: '/recuperar-senha',
  trips: '/minhas-viagens',
  trip: '/minhas-viagens/:tripId',
  tripPlaces: '/minhas-viagens/:tripId/explorar',
  legacyPlaces: '/pontos-turisticos',
  place: '/locais/:placeId',
  profile: '/perfil/:id',
  editProfile: '/perfil/:id/editar',
  notFound: '*',
} as const;

export function readPage(value: string | null): number {
  if (!value || !/^\d+$/.test(value)) return 0;
  const page = Number(value);
  return page <= 2_147_483_647 ? page : 0;
}

export function isUuid(value: string): boolean {
  return (
    value.length === 36 &&
    /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)
  );
}

function withPage(path: string, page = 0): string {
  return page > 0 ? `${path}?page=${page}` : path;
}

export const routes = {
  root: routePatterns.root,
  register: routePatterns.register,
  login: routePatterns.login,
  passwordRecovery: routePatterns.passwordRecovery,
  trips: routePatterns.trips,
  trip: (tripId: string) =>
    routePatterns.trip.replace(':tripId', encodeURIComponent(tripId)),
  tripPlaces: (tripId: string, page?: number) =>
    withPage(
      routePatterns.tripPlaces.replace(':tripId', encodeURIComponent(tripId)),
      page,
    ),
  place: (placeId: string, tripId?: string, page = 0) => {
    const path = routePatterns.place.replace(
      ':placeId',
      encodeURIComponent(placeId),
    );
    if (!tripId) return path;

    const search = new URLSearchParams({ tripId });
    if (page > 0) search.set('page', String(page));
    return `${path}?${search}`;
  },
  profile: (id: string) =>
    routePatterns.profile.replace(':id', encodeURIComponent(id)),
  editProfile: (id: string) =>
    routePatterns.editProfile.replace(':id', encodeURIComponent(id)),
};
