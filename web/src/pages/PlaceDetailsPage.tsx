import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PlaceDetails from '../features/places/components/PlaceDetails';
import PlaceUnavailable, {
  type SavedActivity,
} from '../features/places/components/PlaceUnavailable';
import { isPlaceRemovedError, usePlace } from '../features/places/usePlace';
import '../css/place-details.css';

interface PlaceDetailsLocationState {
  savedActivity?: SavedActivity;
}

export default function PlaceDetailsPage() {
  const { placeId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { savedActivity } =
    (location.state as PlaceDetailsLocationState | null) ?? {};
  const { data: place, isPending, isError, error, refetch } = usePlace(placeId);
  const isRemoved = isPlaceRemovedError(error);

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

        {isRemoved && <PlaceUnavailable savedActivity={savedActivity} />}

        {isError && !isRemoved && (
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
