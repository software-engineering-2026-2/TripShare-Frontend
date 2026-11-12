import type { Coordinates, Place } from '../../../services/placesService';
import { CATEGORY_LABELS } from '../placeFormat';
import {
  formatCoordinates,
  formatDuration,
  formatWeekHours,
} from '../placeDetailsFormat';

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
  const hasOpeningHours = place.openingHours.length > 0;
  const hasInfo = Boolean(
    place.address ||
    place.coordinates ||
    place.estimatedDurationMinutes ||
    place.cost,
  );

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

      {hasInfo && (
        <section className="place-details__section">
          <h2 className="place-details__section-title">Informações</h2>
          <dl className="place-details__info-list">
            {place.address && (
              <div className="place-details__info-row">
                <dt>Endereço</dt>
                <dd>{place.address}</dd>
              </div>
            )}
            {place.coordinates && (
              <div className="place-details__info-row">
                <dt>Coordenadas</dt>
                <dd>{formatCoordinates(place.coordinates)}</dd>
              </div>
            )}
            {!!place.estimatedDurationMinutes && (
              <div className="place-details__info-row">
                <dt>Duração estimada da visita</dt>
                <dd>{formatDuration(place.estimatedDurationMinutes)}</dd>
              </div>
            )}
            {place.cost && (
              <div className="place-details__info-row">
                <dt>Custos</dt>
                <dd>{place.cost}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {hasOpeningHours && (
        <section className="place-details__section">
          <h2 className="place-details__section-title">
            Horário de funcionamento
          </h2>
          <dl className="place-details__info-list">
            {formatWeekHours(place.openingHours).map(({ weekday, hours }) => (
              <div className="place-details__info-row" key={weekday}>
                <dt>{weekday}</dt>
                <dd>{hours}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {(hasOpeningHours || place.cost || place.source) && (
        <footer className="place-details__footer">
          {place.source && <p>Fonte das informações: {place.source}</p>}
          {(hasOpeningHours || place.cost) && (
            <p>
              Horários e preços podem mudar. Confirme diretamente com o
              estabelecimento.
            </p>
          )}
        </footer>
      )}
    </article>
  );
}
