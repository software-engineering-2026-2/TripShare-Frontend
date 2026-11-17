import { ContentPage, PageHeader } from '../../templates/ContentPage';
import {
  ErrorState,
  LoadingState,
} from '../../components/request-state/RequestState';
import { isUuid, readPage, routes } from '../../routes/paths';
import { USE_MOCKS } from '../../commons/config/env';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import PlaceList from './components/PlaceList';
import { usePlaces } from '../../resources/api/places/usePlaces';
import './styles.css';

export default function TouristSpotsPage() {
  const { tripId: paramTripId } = useParams<{ tripId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const legacyTripId = !paramTripId ? searchParams.get('tripId') : null;
  const validTripId = (id: string) => USE_MOCKS || isUuid(id);
  const tripId =
    paramTripId && validTripId(paramTripId) ? paramTripId : undefined;
  const page = readPage(searchParams.get('page'));

  function setPage(nextPage: number) {
    setSearchParams(nextPage > 0 ? { page: String(nextPage) } : {});
  }

  const {
    data: placesPage,
    isLoading,
    isError,
    refetch,
  } = usePlaces(tripId, page);

  if (legacyTripId && validTripId(legacyTripId)) {
    return <Navigate to={routes.tripPlaces(legacyTripId, page)} replace />;
  }

  return (
    <ContentPage className="tourist-spots-page" wide>
      {tripId && (
        <Link className="catalog-back" to={routes.trip(tripId)}>
          ← Voltar para a viagem
        </Link>
      )}
      <div className="tourist-spots__intro">
        <PageHeader
          title="Pontos turísticos"
          description="Conheça os lugares para incluir no seu roteiro"
        />
        <div className="tourist-spots__compass" aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="43" stroke="currentColor" />
            <circle
              cx="50"
              cy="50"
              r="34"
              stroke="currentColor"
              strokeDasharray="1 8"
              strokeWidth="3"
            />
            <path d="m64 28-7 29-29 15 15-29Z" fill="currentColor" />
            <circle cx="50" cy="50" r="4" fill="var(--color-sun)" />
          </svg>
        </div>
      </div>

      {!tripId && (
        <div className="tourist-spots__status" role="status">
          <p>
            Selecione ou crie uma viagem para explorar os locais do destino.
          </p>
          <Link className="form-button button-secondary" to={routes.trips}>
            Ir para Minhas viagens
          </Link>
        </div>
      )}

      {tripId && isLoading && (
        <LoadingState>Carregando pontos turísticos...</LoadingState>
      )}
      {tripId && isError && (
        <ErrorState onRetry={() => void refetch()}>
          Não foi possível carregar os pontos turísticos.
        </ErrorState>
      )}

      {tripId && placesPage && (
        <>
          <div className="catalog-summary">
            <h2>Lugares para descobrir</h2>
            <span>
              {placesPage.totalElements}{' '}
              {placesPage.totalElements === 1 ? 'lugar' : 'lugares'}
            </span>
          </div>
          <PlaceList places={placesPage.content} tripId={tripId} page={page} />

          {placesPage.totalPages > 1 && (
            <nav
              className="tourist-spots__pagination"
              aria-label="Paginação de pontos turísticos"
            >
              <button
                className="form-button button-secondary"
                type="button"
                disabled={page === 0}
                onClick={() => setPage(Math.max(0, page - 1))}
              >
                Anterior
              </button>
              <span className="tourist-spots__page-info">
                Página {placesPage.page + 1} de {placesPage.totalPages}
              </span>
              <button
                className="form-button button-secondary"
                type="button"
                disabled={placesPage.last}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </button>
            </nav>
          )}
        </>
      )}
    </ContentPage>
  );
}
