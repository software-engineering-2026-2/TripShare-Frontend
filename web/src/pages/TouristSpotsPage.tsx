import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import PlaceList from '../features/places/components/PlaceList';
import { usePlaces } from '../features/places/usePlaces';
import '../css/my-trips.css';
import '../css/tourist-spots.css';

export default function TouristSpotsPage() {
  const { tripId: paramTripId } = useParams<{ tripId?: string }>();
  const [searchParams] = useSearchParams();
  const tripId = paramTripId ?? searchParams.get('tripId') ?? undefined;
  const [page, setPage] = useState(0);

  const {
    data: placesPage,
    isPending,
    isError,
    refetch,
  } = usePlaces(tripId, page);

  return (
    <main className="tourist-spots-page">
      <div className="tourist-spots__container">
        <header className="tourist-spots__header">
          <h1 className="tourist-spots__title">Pontos turísticos</h1>
          <p className="tourist-spots__subtitle">
            Conheça os lugares para incluir no seu roteiro
          </p>
        </header>

        {!tripId && (
          <div className="tourist-spots__status" role="status">
            <p>
              Selecione ou crie uma viagem para explorar os locais do destino.
            </p>
            <Link className="form-button my-trips__secondary-button" to="/minhas-viagens">
              Ir para Minhas viagens
            </Link>
          </div>
        )}

        {tripId && isPending && (
          <p className="tourist-spots__status">
            Carregando pontos turísticos...
          </p>
        )}

        {tripId && isError && (
          <div className="tourist-spots__status" role="alert">
            <p>Não foi possível carregar os pontos turísticos.</p>
            <button
              className="form-button my-trips__secondary-button"
              type="button"
              onClick={() => refetch()}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {tripId && placesPage && (
          <>
            <PlaceList places={placesPage.content} />

            {placesPage.totalPages > 1 && (
              <nav
                className="tourist-spots__pagination"
                aria-label="Paginação de pontos turísticos"
              >
                <button
                  className="form-button my-trips__secondary-button"
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                >
                  Anterior
                </button>
                <span className="tourist-spots__page-info">
                  Página {placesPage.page + 1} de {placesPage.totalPages}
                </span>
                <button
                  className="form-button my-trips__secondary-button"
                  type="button"
                  disabled={placesPage.last}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Próxima
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}
