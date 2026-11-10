import { useState } from 'react';
import type { MapPosition } from '../../../services/tripsService';
import {
  getTimeOfDay,
  TIME_OF_DAY,
  type DaySchedule,
  type TimeOfDay,
} from '../itinerary';
import RioMapBase from './RioMapBase';

const WIDTH = 1000;
const HEIGHT = 700;

interface MapPin extends MapPosition {
  id: string;
  name: string;
  number: number;
  timeOfDay: TimeOfDay;
}

interface TripMapProps {
  destination: string;
  lodging: { name: string; mapPosition: MapPosition };
  schedule: DaySchedule;
}

// Enquadra as paradas do dia (visão de ruas) ou a cidade inteira.
function computeView(points: MapPosition[], zoomedIn: boolean) {
  if (!zoomedIn) {
    const scale = 0.78;
    return {
      scale,
      x: WIDTH / 2 - 520 * scale,
      y: HEIGHT / 2 - 360 * scale,
    };
  }

  const padding = 80;
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + padding;
  const fit = Math.min(
    WIDTH / Math.max(maxX - minX, 320),
    HEIGHT / Math.max(maxY - minY, 240),
  );
  const scale = Math.min(1.7, Math.max(1, fit));

  return {
    scale,
    x: WIDTH / 2 - ((minX + maxX) / 2) * scale,
    y: HEIGHT / 2 - ((minY + maxY) / 2) * scale,
  };
}

function curvedSegment(from: MapPosition, to: MapPosition) {
  const bend = 0.18;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const control = {
    x: (from.x + to.x) / 2 - dy * bend,
    y: (from.y + to.y) / 2 + dx * bend,
  };
  const middle = {
    x: 0.25 * from.x + 0.5 * control.x + 0.25 * to.x,
    y: 0.25 * from.y + 0.5 * control.y + 0.25 * to.y,
  };

  return {
    d: `M ${from.x} ${from.y} Q ${control.x.toFixed(1)} ${control.y.toFixed(1)} ${to.x} ${to.y}`,
    middle,
    angle: (Math.atan2(dy, dx) * 180) / Math.PI,
  };
}

export default function TripMap({
  destination,
  lodging,
  schedule,
}: TripMapProps) {
  const [zoomedIn, setZoomedIn] = useState(true);

  const pins: MapPin[] = schedule.items.map((item, index) => ({
    ...item.activity.mapPosition,
    id: item.activity.id,
    name: item.activity.name,
    number: index + 1,
    timeOfDay: getTimeOfDay(item.start),
  }));

  // A rota sai da hospedagem, passa pelas paradas e volta; cada trecho tem a cor do turno de chegada.
  const stops = [lodging.mapPosition, ...pins, lodging.mapPosition];
  const segments =
    pins.length === 0
      ? []
      : stops.slice(1).map((to, index) => ({
          key: `segment-${index}`,
          timeOfDay: pins[Math.min(index, pins.length - 1)].timeOfDay,
          ...curvedSegment(stops[index], to),
        }));

  const view = computeView([...pins, lodging.mapPosition], zoomedIn);
  const project = (point: MapPosition) => ({
    x: point.x * view.scale + view.x,
    y: point.y * view.scale + view.y,
  });
  const lodgingPosition = project(lodging.mapPosition);

  return (
    <div className="trip-map">
      <svg
        className="trip-map__canvas"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Mapa ilustrativo de ${destination} com ${pins.length} paradas numeradas na ordem de visita`}
      >
        <g
          className="trip-map__moving"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          }}
        >
          <RioMapBase zoomedIn={zoomedIn} />

          {zoomedIn && (
            <g aria-hidden="true">
              {segments.map((segment) => (
                <path
                  className="trip-map__route-casing"
                  key={`${segment.key}-casing`}
                  d={segment.d}
                />
              ))}
              {segments.map((segment) => (
                <path
                  className={`trip-map__route time-of-day--${segment.timeOfDay}`}
                  key={segment.key}
                  d={segment.d}
                />
              ))}
              {segments.map((segment) => (
                <path
                  className={`trip-map__arrow time-of-day--${segment.timeOfDay}`}
                  key={`${segment.key}-arrow`}
                  d="M -6 -5.5 L 7 0 L -6 5.5 Q -3 0 -6 -5.5 Z"
                  transform={`translate(${segment.middle.x} ${segment.middle.y}) rotate(${segment.angle}) scale(${1 / view.scale})`}
                />
              ))}
            </g>
          )}
        </g>

        <g
          className="trip-map__moving"
          style={{
            transform: `translate(${lodgingPosition.x}px, ${lodgingPosition.y}px)`,
          }}
        >
          <title>{lodging.name}</title>
          <rect
            className="trip-map__lodging"
            x={-14}
            y={-14}
            width={28}
            height={28}
            rx={9}
          />
          <path
            className="trip-map__lodging-icon"
            d="M -6 1 L 0 -5 L 6 1 M -4 -1 V 6 H 4 V -1"
          />
        </g>

        {pins.map((pin) => {
          const position = project(pin);
          return (
            <g
              className={`trip-map__moving trip-map__pin time-of-day--${pin.timeOfDay}`}
              key={pin.id}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoomedIn ? 1 : 0.72})`,
              }}
            >
              <title>{`${pin.number}. ${pin.name}`}</title>
              <circle className="trip-map__pin-circle" r={15} />
              <text className="trip-map__pin-number" y={5} textAnchor="middle">
                {pin.number}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="trip-map__top">
        <p className="trip-map__badge">
          {destination}
          <span className="trip-map__badge-hint">
            {zoomedIn
              ? 'Visão de ruas · sequência e rotas'
              : 'Visão da cidade · distribuição das paradas'}
          </span>
        </p>

        <div
          className="trip-map__zoom"
          role="group"
          aria-label="Nível de zoom do mapa"
        >
          <button
            className="trip-map__zoom-button"
            type="button"
            aria-pressed={zoomedIn}
            onClick={() => setZoomedIn(true)}
          >
            Ruas
          </button>
          <button
            className="trip-map__zoom-button"
            type="button"
            aria-pressed={!zoomedIn}
            onClick={() => setZoomedIn(false)}
          >
            Cidade
          </button>
        </div>
      </div>

      {pins.length > 0 && (
        <ul className="trip-map__legend">
          {(Object.keys(TIME_OF_DAY) as TimeOfDay[]).map((timeOfDay) => (
            <li
              className={`trip-map__legend-item time-of-day--${timeOfDay}`}
              key={timeOfDay}
            >
              <span className="trip-map__legend-dot" aria-hidden="true" />
              {TIME_OF_DAY[timeOfDay].label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
