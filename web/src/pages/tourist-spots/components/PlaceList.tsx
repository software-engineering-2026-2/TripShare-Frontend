import type { Place } from '../../../resources/api/places/contract';
import PlaceCard from './PlaceCard';

interface PlaceListProps {
  places: Place[];
  tripId?: string;
  page?: number;
}

export default function PlaceList({ places, tripId, page }: PlaceListProps) {
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
          <PlaceCard place={place} tripId={tripId} page={page} />
        </li>
      ))}
    </ul>
  );
}
