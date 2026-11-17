import type { DayConflict, DayResolution } from '../periodConflicts';
import { formatActivityCount } from '../tripValidation';

interface PeriodConflictResolverProps {
  conflicts: DayConflict[];
  // Nova duração da viagem: os dias para onde as atividades podem ir.
  duration: number;
  resolutions: Partial<Record<number, DayResolution>>;
  onChange: (resolution: DayResolution) => void;
  error?: string;
}

export default function PeriodConflictResolver({
  conflicts,
  duration,
  resolutions,
  onChange,
  error,
}: PeriodConflictResolverProps) {
  const days = Array.from({ length: duration }, (_, index) => index + 1);
  const hasRemoval = Object.values(resolutions).some(
    (resolution) => resolution?.action === 'REMOVE',
  );

  return (
    <div className="trip-period-conflicts" role="alert">
      <p className="trip-period-conflicts__intro">
        O novo período deixa de fora dias que já têm atividades. Escolha o que
        fazer com cada um:
      </p>

      {conflicts.map(({ dayNumber, activityCount }) => {
        const resolution = resolutions[dayNumber];
        const targetDay =
          resolution?.action === 'MOVE' ? resolution.targetDay : duration;
        const name = `conflict-day-${dayNumber}`;

        return (
          <fieldset className="trip-period-conflicts__day" key={dayNumber}>
            <legend className="trip-period-conflicts__day-title">
              Dia {dayNumber}: {formatActivityCount(activityCount)}
            </legend>

            <div className="trip-period-conflicts__option">
              <label>
                <input
                  type="radio"
                  name={name}
                  checked={resolution?.action === 'MOVE'}
                  onChange={() =>
                    onChange({ dayNumber, action: 'MOVE', targetDay })
                  }
                />
                Mover para o dia
              </label>
              <select
                className="form-control trip-period-conflicts__select"
                aria-label={`Dia de destino das atividades do dia ${dayNumber}`}
                disabled={resolution?.action !== 'MOVE'}
                value={targetDay}
                onChange={(event) =>
                  onChange({
                    dayNumber,
                    action: 'MOVE',
                    targetDay: Number(event.target.value),
                  })
                }
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    Dia {day}
                  </option>
                ))}
              </select>
            </div>

            <label className="trip-period-conflicts__option">
              <input
                type="radio"
                name={name}
                checked={resolution?.action === 'REMOVE'}
                onChange={() => onChange({ dayNumber, action: 'REMOVE' })}
              />
              Remover {formatActivityCount(activityCount)}
            </label>
          </fieldset>
        );
      })}

      {hasRemoval && (
        <p className="trip-period-conflicts__warning">
          As atividades removidas não poderão ser recuperadas.
        </p>
      )}

      {error && <p className="new-trip-field__error">{error}</p>}
    </div>
  );
}
