import type { Coordinates, Place } from '../../../services/placesService';
import { CATEGORY_LABELS } from '../placeFormat';

interface PlaceDetailsProps {
  place: Place;
}

// Área pequena em volta do ponto para o mapa incorporado do OpenStreetMap.
const MAP_MARGIN = 0.004;

function getMapEmbedUrl({ latitude, longitude }: Coordinates): string {
  const bbox = [
    longitude - MAP_MARGIN,
    latitude - MAP_MARGIN,
    longitude + MAP_MARGIN,
    latitude + MAP_MARGIN,
  ].join(',');

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
}

export default function PlaceDetails({ place }: PlaceDetailsProps) {
  return (
    <article className="place-details" aria-labelledby="place-name">
      <header className="place-details__header">
        <ul className="place-details__categories" aria-label="Categorias">
          {place.categories.map((category) => (
            <li className="place-details__category" key={category}>
              {CATEGORY_LABELS[category]}
            </li>
          ))}
        </ul>
        <h1 className="place-details__name" id="place-name">
          {place.name}
        </h1>
      </header>

      {place.description && (
        <section className="place-details__section">
          <h2 className="place-details__section-title">Descrição</h2>
          <p className="place-details__text">{place.description}</p>
        </section>
      )}

      <section className="place-details__section">
        <h2 className="place-details__section-title">Localização</h2>
        {place.neighborhood && (
          <p className="place-details__text">{place.neighborhood}</p>
        )}
        {place.coordinates && (
          <iframe
            className="place-details__map"
            title={`Mapa com a localização de ${place.name}`}
            src={getMapEmbedUrl(place.coordinates)}
            loading="lazy"
          />
        )}
      </section>
    </article>
  );
}
