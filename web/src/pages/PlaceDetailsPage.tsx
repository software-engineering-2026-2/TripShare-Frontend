import { useNavigate, useParams } from 'react-router-dom';
import PlaceDetails from '../features/places/components/PlaceDetails';
import { usePlace } from '../features/places/usePlace';
import '../css/place-details.css';

export default function PlaceDetailsPage() {
  const { placeId = '' } = useParams();
  const navigate = useNavigate();
  const { data: place, isPending, isError, refetch } = usePlace(placeId);

  return (
    <main className="place-details-page">
      <div className="place-details__container">
        <button
          className="form-button place-details__back-button"
          type="button"
          onClick={() => navigate(-1)}
        >
          Voltar
        </button>

        {isPending && (
          <p className="place-details__status">Carregando local...</p>
        )}

        {isError && (
          <div className="place-details__status" role="alert">
            <p>Não foi possível carregar os detalhes deste local.</p>
            <button
              className="form-button place-details__back-button"
              type="button"
              onClick={() => refetch()}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {place && <PlaceDetails place={place} />}
      </div>
    </main>
  );
}
