import PlacePhoto from '../../../components/place-photo/PlacePhoto';
import JourneyArt from '../../../components/journey-art/JourneyArt';
import { routes } from '../../../routes/paths';
import { Link } from 'react-router-dom';
import type { Place } from '../../../resources/api/places/contract';
import {
  CATEGORY_LABELS,
  formatTodayHours,
} from '../../../resources/api/places/placeFormat';

interface PlaceCardProps {
  place: Place;
  tripId?: string;
  page?: number;
}

export default function PlaceCard({ place, tripId, page }: PlaceCardProps) {
  return (
    <article className="place-card card-surface">
      <div className="place-card__media">
        <PlacePhoto
          photo={place.photo}
          altFallback={place.name}
          className="place-card__photo"
          fallback={
            <div className="place-card__photo place-card__photo--empty">
              <JourneyArt />
              <span>Sem foto</span>
            </div>
          }
        />
        <span className="place-card__open" aria-hidden="true">
          ↗
        </span>
      </div>

      <div className="place-card__body">
        <ul className="place-card__categories" aria-label="Categorias">
          {place.categories.map((category) => (
            <li className="place-card__category" key={category}>
              {CATEGORY_LABELS[category]}
            </li>
          ))}
        </ul>

        <h2 className="place-card__name">
          {/* O link se estende pelo card todo (ver .place-card__link::after). */}
          <Link
            className="place-card__link"
            to={routes.place(place.id, tripId, page)}
          >
            {place.name}
          </Link>
        </h2>

        <p className="place-card__info">
          <span className="place-card__label">Bairro</span>
          {place.neighborhood ?? 'Não informado'}
        </p>
        <p className="place-card__info">
          <span className="place-card__label">Horário</span>
          {formatTodayHours(place.openingHours)}
        </p>
      </div>
    </article>
  );
}
