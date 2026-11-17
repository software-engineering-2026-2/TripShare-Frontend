import { tripQueryKeys } from '../../../resources/api/trips/tripQueryKeys';
import { useMutation } from '@tanstack/react-query';
import ActionButton from '../../../components/action-button/ActionButton';
import { ErrorState } from '../../../components/request-state/RequestState';
import { useState } from 'react';
import { isUuid } from '../../../routes/paths';
import { USE_MOCKS } from '../../../commons/config/env';
import { ApiError, getApiMessage } from '../../../resources/client/http';
import type {
  CreateTripInput,
  Destination,
  Trip,
  UpdateTripInput,
} from '../../../resources/api/trips/contract';
import {
  getPeriodConflicts,
  isInvalidPeriodError,
  isInvalidResolutionError,
  isPublicItineraryConflict,
  type DayConflict,
  type DayResolution,
} from '../../../resources/api/trips/periodConflicts';
import { getTripAccessErrorMessage } from '../../../resources/api/trips/tripAccessError';
import {
  END_BEFORE_START_MESSAGE,
  formatDayCount,
  formatDestination,
  getTripDays,
  validateDestination,
  validateEndDate,
  validateStartDate,
  validateTitle,
} from '../../../resources/api/trips/tripValidation';
import DestinationOptions from './DestinationOptions';
import PeriodConflictResolver from './PeriodConflictResolver';

type TripField = 'title' | 'destination' | 'startDate' | 'endDate' | 'duration';
type ScheduleMode = 'dates' | 'duration';

type TripValues = Record<TripField, string>;
type TripErrors = Partial<Record<TripField, string>>;

type TripFormProps = {
  onCancel: () => void;
  onSearchDestinations: (query: string) => Promise<Destination[]>;
} & (
  | { trip?: undefined; onSubmit: (input: CreateTripInput) => Promise<void> }
  | { trip: Trip; onSubmit: (input: UpdateTripInput) => Promise<void> }
);

function getInitialValues(trip?: Trip): TripValues {
  if (!trip)
    return {
      title: '',
      destination: '',
      startDate: '',
      endDate: '',
      duration: '',
    };

  return {
    title: trip.title,
    destination: USE_MOCKS
      ? formatDestination(trip.destination)
      : trip.destination.id,
    startDate: trip.startDate ?? '',
    endDate: trip.endDate ?? '',
    duration: String(trip.durationDays),
  };
}

function validate(
  values: TripValues,
  mode: ScheduleMode,
  isEditing: boolean,
): TripErrors {
  const duration = Number(values.duration);
  return {
    title:
      validateTitle(values.title) ??
      (isEditing && values.title.trim().length > 120
        ? 'O título deve ter no máximo 120 caracteres.'
        : undefined),
    destination: USE_MOCKS
      ? validateDestination(values.destination)
      : !isUuid(values.destination.trim())
        ? 'Informe um UUID de destino válido.'
        : undefined,
    startDate:
      mode === 'dates' ? validateStartDate(values.startDate) : undefined,
    endDate:
      mode === 'dates'
        ? validateEndDate(values.endDate, values.startDate)
        : undefined,
    duration:
      mode === 'duration' &&
      (!Number.isInteger(duration) || duration < 1 || duration > 2_147_483_647)
        ? 'Informe uma duração inteira e positiva.'
        : undefined,
  };
}

function hasErrors(errors: TripErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export default function TripForm(props: TripFormProps) {
  const { onCancel, onSearchDestinations, trip } = props;
  const isEditing = Boolean(trip);
  const [mode, setMode] = useState<ScheduleMode>(
    trip && !trip.startDate ? 'duration' : 'dates',
  );
  const [values, setValues] = useState(() => getInitialValues(trip));
  const [errors, setErrors] = useState<TripErrors>({});
  const [destinationOptions, setDestinationOptions] = useState<Destination[]>(
    [],
  );
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(trip?.destination ?? null);
  const [submitError, setSubmitError] = useState('');
  const [periodConflicts, setPeriodConflicts] = useState<DayConflict[]>([]);
  const [resolutions, setResolutions] = useState<
    Partial<Record<number, DayResolution>>
  >({});
  const [resolutionError, setResolutionError] = useState('');
  const submit = useMutation({
    mutationKey: tripQueryKeys.save,
    mutationFn: saveTrip,
  });
  const loading = submit.isPending;
  // 403/404 no PATCH: a viagem não é do usuário ou foi excluída, então salvar de novo não adianta.
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  const days =
    mode === 'dates'
      ? getTripDays(values.startDate, values.endDate)
      : Number(values.duration) || 0;
  const submitLabel = isEditing ? 'Salvar alterações' : 'Criar viagem';
  const loadingLabel = isEditing ? 'Salvando...' : 'Criando...';

  function handleChange(field: TripField, value: string) {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);

    if (field === 'destination') {
      setDestinationOptions([]);
      setSelectedDestination(null);
    }

    // Os conflitos se referem ao período enviado; mudar as datas os invalida.
    if (field === 'startDate' || field === 'endDate' || field === 'duration') {
      clearPeriodConflicts();
    }

    // Só revalida campos que já estão mostrando erro.
    const nextErrors = validate(nextValues, mode, isEditing);
    setErrors((currentErrors) => {
      const updatedErrors = { ...currentErrors };

      (Object.keys(currentErrors) as TripField[]).forEach((key) => {
        if (currentErrors[key]) {
          updatedErrors[key] = nextErrors[key];
        }
      });

      return updatedErrors;
    });
  }

  function clearPeriodConflicts() {
    setPeriodConflicts([]);
    setResolutions({});
    setResolutionError('');
  }

  function handleResolutionChange(resolution: DayResolution) {
    setResolutions((current) => ({
      ...current,
      [resolution.dayNumber]: resolution,
    }));
    setResolutionError('');
  }

  // Escolhas de todos os dias em conflito, ou null se algum ainda estiver sem escolha.
  function getChosenResolutions(): DayResolution[] | null {
    const chosen = periodConflicts.map(
      (conflict) => resolutions[conflict.dayNumber],
    );
    return chosen.every(Boolean) ? (chosen as DayResolution[]) : null;
  }

  function handleBlur(field: TripField) {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: validate(values, mode, isEditing)[field],
    }));
  }

  function handleSelectDestination(destination: Destination) {
    setSelectedDestination(destination);
    setErrors((currentErrors) => ({
      ...currentErrors,
      destination: undefined,
    }));
  }

  async function findDestination(): Promise<Destination | null> {
    if (selectedDestination) {
      return selectedDestination;
    }

    if (destinationOptions.length > 0) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        destination: 'Escolha uma das opções de destino.',
      }));
      return null;
    }

    const results = await onSearchDestinations(values.destination.trim());

    if (results.length === 0) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        destination: 'Destino não encontrado.',
      }));
      return null;
    }

    if (results.length > 1) {
      setDestinationOptions(results);
      return null;
    }

    setSelectedDestination(results[0]);
    return results[0];
  }

  function handleSubmit() {
    if (loading) return;
    const nextErrors = validate(values, mode, isEditing);
    setErrors(nextErrors);
    setSubmitError('');

    if (hasErrors(nextErrors)) {
      return;
    }

    const chosenResolutions =
      periodConflicts.length > 0 ? getChosenResolutions() : undefined;

    if (chosenResolutions === null) {
      setResolutionError('Escolha o que fazer com as atividades de cada dia.');
      return;
    }

    submit.mutate(chosenResolutions);
  }

  async function saveTrip(chosenResolutions: DayResolution[] | undefined) {
    let destinationId = values.destination.trim();

    if (USE_MOCKS) {
      try {
        const destination = await findDestination();
        if (!destination) {
          return;
        }
        destinationId = destination.id;
      } catch {
        setSubmitError('Não foi possível buscar o destino. Tente novamente.');
        return;
      }
    }

    try {
      const title = values.title.trim();
      if (props.trip) {
        const previous = props.trip;
        await props.onSubmit({
          ...(title !== previous.title && { title }),
          ...(destinationId !== previous.destination.id && { destinationId }),
          ...(mode === 'dates' &&
            values.startDate !== previous.startDate && {
              startsOn: values.startDate,
            }),
          ...(mode === 'dates' &&
            values.endDate !== previous.endDate && { endsOn: values.endDate }),
          ...(mode === 'duration' &&
            days !== previous.durationDays && { durationDays: days }),
          ...(chosenResolutions && { resolutions: chosenResolutions }),
        });
      } else {
        await props.onSubmit({
          title,
          destinationId,
          ...(mode === 'dates'
            ? { startsOn: values.startDate, endsOn: values.endDate }
            : { durationDays: days }),
        });
      }
    } catch (error) {
      const conflicts = getPeriodConflicts(error);

      if (conflicts) {
        setPeriodConflicts(conflicts);
        setResolutions({});
        return;
      }

      // O back recusou as escolhas: os conflitos mudaram desde o 409.
      if (chosenResolutions && isInvalidResolutionError(error)) {
        clearPeriodConflicts();
        setSubmitError(
          'Os dias em conflito mudaram. Salve novamente para ver a lista atualizada.',
        );
        return;
      }

      if (isPublicItineraryConflict(error)) {
        setResolutionError(
          'Um roteiro público precisa manter uma atividade com local identificado. Mova a atividade para um dia da viagem.',
        );
        return;
      }

      if (
        error instanceof ApiError &&
        error.status === 404 &&
        getApiMessage(error) === 'Destination not found'
      ) {
        setErrors((current) => ({
          ...current,
          destination: 'Destino não encontrado.',
        }));
        return;
      }

      const accessErrorMessage =
        isEditing && getTripAccessErrorMessage(error, 'alterar');

      if (accessErrorMessage) {
        setIsAccessDenied(true);
        setSubmitError(accessErrorMessage);
        return;
      }

      if (isInvalidPeriodError(error)) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          endDate: END_BEFORE_START_MESSAGE,
        }));
        return;
      }

      setSubmitError(
        isEditing
          ? 'Não foi possível salvar as alterações. Tente novamente.'
          : 'Não foi possível criar a viagem. Tente novamente.',
      );
    }
  }

  return (
    <form
      className="new-trip-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <div className="new-trip-field">
        <label className="new-trip-field__label" htmlFor="trip-title">
          Título
        </label>
        <input
          className="form-control new-trip-field__input"
          id="trip-title"
          name="title"
          type="text"
          autoComplete="off"
          placeholder="Ex.: Férias com os amigos"
          required
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'trip-title-error' : undefined}
          value={values.title}
          onChange={(event) => handleChange('title', event.target.value)}
          onBlur={() => handleBlur('title')}
        />
        {errors.title && (
          <p
            className="new-trip-field__error"
            id="trip-title-error"
            role="alert"
          >
            {errors.title}
          </p>
        )}
      </div>

      <div className="new-trip-field">
        <label className="new-trip-field__label" htmlFor="trip-destination">
          Destino
        </label>
        <input
          className="form-control new-trip-field__input"
          id="trip-destination"
          name="destination"
          type="text"
          autoComplete="off"
          placeholder={
            USE_MOCKS ? 'Ex.: Rio de Janeiro' : 'UUID do destino cadastrado'
          }
          required
          aria-invalid={Boolean(errors.destination)}
          aria-describedby={
            errors.destination ? 'trip-destination-error' : undefined
          }
          value={values.destination}
          onChange={(event) => handleChange('destination', event.target.value)}
          onBlur={() => handleBlur('destination')}
        />
        {errors.destination && (
          <p
            className="new-trip-field__error"
            id="trip-destination-error"
            role="alert"
          >
            {errors.destination}
          </p>
        )}
      </div>

      {destinationOptions.length > 0 && (
        <DestinationOptions
          options={destinationOptions}
          selected={selectedDestination}
          onSelect={handleSelectDestination}
        />
      )}

      {!trip?.startDate && (
        <div className="new-trip-field">
          <label className="new-trip-field__label" htmlFor="trip-schedule">
            Planejamento
          </label>
          <select
            className="form-control new-trip-field__input"
            id="trip-schedule"
            value={mode}
            onChange={(event) => {
              setMode(event.target.value === 'duration' ? 'duration' : 'dates');
              setErrors({});
              setSubmitError('');
              clearPeriodConflicts();
            }}
          >
            <option value="dates">Com datas</option>
            <option value="duration">Somente duração</option>
          </select>
        </div>
      )}

      {mode === 'dates' ? (
        <div className="new-trip-form__dates">
          <div className="new-trip-field">
            <label className="new-trip-field__label" htmlFor="trip-start-date">
              Data de início
            </label>
            <input
              className="form-control new-trip-field__input"
              id="trip-start-date"
              name="startDate"
              type="date"
              required
              aria-invalid={Boolean(errors.startDate)}
              aria-describedby={
                errors.startDate ? 'trip-start-date-error' : undefined
              }
              value={values.startDate}
              onChange={(event) =>
                handleChange('startDate', event.target.value)
              }
              onBlur={() => handleBlur('startDate')}
            />
            {errors.startDate && (
              <p
                className="new-trip-field__error"
                id="trip-start-date-error"
                role="alert"
              >
                {errors.startDate}
              </p>
            )}
          </div>

          <div className="new-trip-field">
            <label className="new-trip-field__label" htmlFor="trip-end-date">
              Data de término
            </label>
            <input
              className="form-control new-trip-field__input"
              id="trip-end-date"
              name="endDate"
              type="date"
              required
              min={values.startDate || undefined}
              aria-invalid={Boolean(errors.endDate)}
              aria-describedby={
                errors.endDate ? 'trip-end-date-error' : undefined
              }
              value={values.endDate}
              onChange={(event) => handleChange('endDate', event.target.value)}
              onBlur={() => handleBlur('endDate')}
            />
            {errors.endDate && (
              <p
                className="new-trip-field__error"
                id="trip-end-date-error"
                role="alert"
              >
                {errors.endDate}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="new-trip-field">
          <label className="new-trip-field__label" htmlFor="trip-duration">
            Duração em dias
          </label>
          <input
            className="form-control new-trip-field__input"
            id="trip-duration"
            name="duration"
            type="number"
            min="1"
            step="1"
            required
            aria-invalid={Boolean(errors.duration)}
            aria-describedby={
              errors.duration ? 'trip-duration-error' : undefined
            }
            value={values.duration}
            onChange={(event) => handleChange('duration', event.target.value)}
            onBlur={() => handleBlur('duration')}
          />
          {errors.duration && (
            <p
              id="trip-duration-error"
              className="new-trip-field__error"
              role="alert"
            >
              {errors.duration}
            </p>
          )}
        </div>
      )}

      <p className="new-trip-form__duration" aria-live="polite">
        {days > 0
          ? `Duração: ${formatDayCount(days)}`
          : mode === 'dates'
            ? 'Escolha as datas para ver a duração.'
            : 'Informe a duração da viagem.'}
      </p>

      {periodConflicts.length > 0 && (
        <PeriodConflictResolver
          conflicts={periodConflicts}
          duration={days}
          resolutions={resolutions}
          onChange={handleResolutionChange}
          error={resolutionError}
        />
      )}

      {submitError && <ErrorState>{submitError}</ErrorState>}

      <div className="new-trip-form__actions">
        <button
          className="form-button button-secondary"
          type="button"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <ActionButton
          className="form-button button-primary"
          type="submit"
          pending={loading}
          pendingLabel={loadingLabel}
          disabled={isAccessDenied}
        >
          {submitLabel}
        </ActionButton>
      </div>
    </form>
  );
}
