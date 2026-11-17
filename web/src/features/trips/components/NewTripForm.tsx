import { useState } from 'react';
import type {
  CreateTripInput,
  Destination,
} from '../../../services/tripsService';
import {
  formatDayCount,
  getTripDays,
  validateDestination,
  validateEndDate,
  validateStartDate,
  validateTitle,
} from '../tripValidation';
import DestinationOptions from './DestinationOptions';

type TripField = 'title' | 'destination' | 'startDate' | 'endDate';

type TripValues = Record<TripField, string>;
type TripErrors = Partial<Record<TripField, string>>;

interface NewTripFormProps {
  onSubmit: (input: CreateTripInput) => Promise<void>;
  onCancel: () => void;
  onSearchDestinations: (query: string) => Promise<Destination[]>;
}

const initialValues: TripValues = {
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
};

function validate(values: TripValues): TripErrors {
  return {
    title: validateTitle(values.title),
    destination: validateDestination(values.destination),
    startDate: validateStartDate(values.startDate),
    endDate: validateEndDate(values.endDate, values.startDate),
  };
}

function hasErrors(errors: TripErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export default function NewTripForm({
  onSubmit,
  onCancel,
  onSearchDestinations,
}: NewTripFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<TripErrors>({});
  const [destinationOptions, setDestinationOptions] = useState<Destination[]>(
    [],
  );
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const days = getTripDays(values.startDate, values.endDate);

  function handleChange(field: TripField, value: string) {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);

    if (field === 'destination') {
      setDestinationOptions([]);
      setSelectedDestination(null);
    }

    // Só revalida campos que já estão mostrando erro.
    const nextErrors = validate(nextValues);
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

  function handleBlur(field: TripField) {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: validate(values)[field],
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

  async function handleSubmit() {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitError('');

    if (hasErrors(nextErrors)) {
      return;
    }

    setLoading(true);

    let destination: Destination | null;

    try {
      destination = await findDestination();
    } catch {
      setSubmitError('Não foi possível buscar o destino. Tente novamente.');
      setLoading(false);
      return;
    }

    if (!destination) {
      setLoading(false);
      return;
    }

    try {
      await onSubmit({
        title: values.title.trim(),
        destination,
        startDate: values.startDate,
        endDate: values.endDate,
      });
    } catch {
      setSubmitError('Não foi possível criar a viagem. Tente novamente.');
    } finally {
      setLoading(false);
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
          placeholder="Ex.: Rio de Janeiro"
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
            onChange={(event) => handleChange('startDate', event.target.value)}
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

      <p className="new-trip-form__duration" aria-live="polite">
        {days > 0
          ? `Duração: ${formatDayCount(days)}`
          : 'Escolha as datas para ver a duração.'}
      </p>

      {submitError && (
        <p className="new-trip-field__error" role="alert">
          {submitError}
        </p>
      )}

      <div className="new-trip-form__actions">
        <button
          className="form-button my-trips__secondary-button"
          type="button"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          className="form-button my-trips__primary-button"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Criando...' : 'Criar viagem'}
        </button>
      </div>
    </form>
  );
}
