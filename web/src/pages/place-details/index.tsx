import { ContentPage } from '../../templates/ContentPage';
import {
  ErrorState,
  LoadingState,
} from '../../components/request-state/RequestState';
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { isUuid, readPage, routes } from '../../routes/paths';
import { USE_MOCKS } from '../../commons/config/env';
import PlaceDetails from './components/PlaceDetails';
import PlaceUnavailable, {
  type SavedActivity,
} from './components/PlaceUnavailable';
import {
  isPlaceRemovedError,
  usePlace,
} from '../../resources/api/places/usePlace';
import { usePlaces } from '../../resources/api/places/usePlaces';
import './styles.css';

interface PlaceDetailsLocationState {
  savedActivity?: SavedActivity;
}

export default function PlaceDetailsPage() {
  const { placeId = '' } = useParams();
  const location = useLocation();
  const [search] = useSearchParams();
  const tripId = search.get('tripId');
  const page = readPage(search.get('page'));
  const { savedActivity } =
    (location.state as PlaceDetailsLocationState | null) ?? {};

  // TODO(backend): GET /places/{id} para abrir detalhes fora do contexto de uma viagem.
  const catalogTripId =
    tripId && isUuid(tripId) && isUuid(placeId) ? tripId : undefined;
  const catalog = usePlaces(USE_MOCKS ? undefined : catalogTripId, page);
  const demo = usePlace(placeId);
  const query = USE_MOCKS ? demo : catalog;
  const canLoad = USE_MOCKS || Boolean(catalogTripId);
  const place = USE_MOCKS
    ? demo.data
    : catalog.data?.content.find(({ id }) => id === placeId);
  const isRemoved = USE_MOCKS && isPlaceRemovedError(demo.error);
  const isUnavailable = !canLoad || isRemoved || (query.isSuccess && !place);
  const back =
    tripId && (USE_MOCKS || isUuid(tripId))
      ? routes.tripPlaces(tripId, page)
      : routes.trips;

  return (
    <ContentPage className="place-details-page" wide>
      <Link
        className="form-button button-secondary place-details__back-button"
        to={back}
      >
        Voltar
      </Link>

      {canLoad && query.isLoading && (
        <LoadingState>Carregando local...</LoadingState>
      )}

      {isUnavailable && (
        <PlaceUnavailable
          savedActivity={savedActivity}
          message={
            isRemoved
              ? undefined
              : !canLoad
                ? 'Abra o local pelo catálogo de uma viagem para ver os detalhes.'
                : 'O local não está nesta página do catálogo. Volte à lista para encontrá-lo.'
          }
        />
      )}

      {canLoad && query.isError && !isRemoved && (
        <ErrorState onRetry={() => void query.refetch()}>
          Não foi possível carregar os detalhes deste local.
        </ErrorState>
      )}

      {place && <PlaceDetails place={place} />}
    </ContentPage>
  );
}
