import { Link } from 'react-router-dom';
import type { Place } from '../../../services/placesService';
import { CATEGORY_LABELS, formatTodayHours } from '../placeFormat';

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  return (
    <article className="place-card">
      {place.photo ? (
        <img
          className="place-card__photo"
          src={place.photo.url}
          alt={place.photo.altText ?? place.name}
          loading="lazy"
        />
      ) : (
        <div className="place-card__photo place-card__photo--empty">
          Sem foto
        </div>
      )}

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
          <Link className="place-card__link" to={`/locais/${place.id}`}>
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
