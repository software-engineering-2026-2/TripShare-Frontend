import PlaceList from '../features/places/components/PlaceList';
import { usePlaces } from '../features/places/usePlaces';
import '../css/my-trips.css';
import '../css/tourist-spots.css';

export default function TouristSpotsPage() {
  const { data: places, isPending, isError, refetch } = usePlaces();

  return (
    <main className="tourist-spots-page">
      <div className="tourist-spots__container">
        <header className="tourist-spots__header">
          <h1 className="tourist-spots__title">Pontos turísticos</h1>
          <p className="tourist-spots__subtitle">
            Conheça os lugares para incluir no seu roteiro
          </p>
        </header>

        {isPending && (
          <p className="tourist-spots__status">
            Carregando pontos turísticos...
          </p>
        )}

        {isError && (
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

        {places && <PlaceList places={places} />}
      </div>
    </main>
  );
}
