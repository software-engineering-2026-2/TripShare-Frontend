import { useState } from 'react';
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

const NOT_INFORMED = 'Não informado';

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

interface InfoRowProps {
  label: string;
  value?: string | null;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="place-details__info-row">
      <dt>{label}</dt>
      <dd className={value ? undefined : 'place-details__not-informed'}>
        {value || NOT_INFORMED}
      </dd>
    </div>
  );
}

interface PlaceMapProps {
  name: string;
  coordinates?: Coordinates | null;
}

// O mapa é opcional: sem coordenadas ou com falha no carregamento,
// os detalhes em texto continuam na tela.
function PlaceMap({ name, coordinates }: PlaceMapProps) {
  // O iframe nem sempre dispara onError em falhas de rede, então também
  // tratamos o navegador sem conexão como falha do mapa.
  const [hasFailed, setHasFailed] = useState(() => !navigator.onLine);

  if (!coordinates || hasFailed) {
    return (
      <p className="place-details__map-unavailable" role="status">
        {coordinates
          ? 'Não foi possível carregar o mapa.'
          : 'Mapa indisponível: o local não tem coordenadas informadas.'}
      </p>
    );
  }

  return (
    <iframe
      className="place-details__map"
      title={`Mapa com a localização de ${name}`}
      src={getMapEmbedUrl(coordinates)}
      loading="lazy"
      onError={() => setHasFailed(true)}
    />
  );
}

export default function PlaceDetails({ place }: PlaceDetailsProps) {
  const hasOpeningHours = place.openingHours.length > 0;

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

      <section className="place-details__section">
        <h2 className="place-details__section-title">Descrição</h2>
        <p
          className={
            place.description
              ? 'place-details__text'
              : 'place-details__text place-details__not-informed'
          }
        >
          {place.description || NOT_INFORMED}
        </p>
      </section>

      <section className="place-details__section">
        <h2 className="place-details__section-title">Localização</h2>
        <dl className="place-details__info-list">
          <InfoRow label="Bairro" value={place.neighborhood} />
        </dl>
        <PlaceMap name={place.name} coordinates={place.coordinates} />
      </section>

      <section className="place-details__section">
        <h2 className="place-details__section-title">Informações</h2>
        <dl className="place-details__info-list">
          <InfoRow label="Endereço" value={place.address} />
          <InfoRow
            label="Coordenadas"
            value={place.coordinates && formatCoordinates(place.coordinates)}
          />
          <InfoRow
            label="Duração estimada da visita"
            value={
              place.estimatedDurationMinutes
                ? formatDuration(place.estimatedDurationMinutes)
                : null
            }
          />
          <InfoRow label="Custos" value={place.cost} />
        </dl>
      </section>

      <section className="place-details__section">
        <h2 className="place-details__section-title">
          Horário de funcionamento
        </h2>
        {hasOpeningHours ? (
          <dl className="place-details__info-list">
            {formatWeekHours(place.openingHours).map(({ weekday, hours }) => (
              <div className="place-details__info-row" key={weekday}>
                <dt>{weekday}</dt>
                <dd>{hours}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="place-details__text place-details__not-informed">
            {NOT_INFORMED}
          </p>
        )}
      </section>

      <footer className="place-details__footer">
        <p>Fonte das informações: {place.source || NOT_INFORMED}</p>
        <p>
          Horários e preços podem mudar. Confirme diretamente com o
          estabelecimento.
        </p>
      </footer>
    </article>
  );
}
