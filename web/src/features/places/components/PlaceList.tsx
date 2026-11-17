import type { Place } from '../../../services/placesService';
import PlaceCard from './PlaceCard';

interface PlaceListProps {
  places: Place[];
}

export default function PlaceList({ places }: PlaceListProps) {
  if (places.length === 0) {
    return (
      <div className="place-list__empty">
        <p className="place-list__empty-title">
          Nenhum ponto turístico encontrado
        </p>
        <p className="place-list__empty-text">
          Ainda não há lugares cadastrados para este destino.
        </p>
      </div>
    );
  }

  return (
    <ul className="place-list">
      {places.map((place) => (
        <li key={place.id}>
          <PlaceCard place={place} />
        </li>
      ))}
    </ul>
  );
}
