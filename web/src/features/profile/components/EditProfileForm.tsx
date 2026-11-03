import { useState, type ChangeEvent, type FormEvent } from 'react';

import type { EditableProfile, UpdateProfileInput } from '../profileTypes';
import {
  PROFILE_LIMITS,
  validateProfileBio,
  validateProfileHometown,
  validateProfileName,
  validateProfilePhone,
} from '../profileValidation';

import {
  buildUpdate,
  type ProfileFieldName,
  type ProfileValues,
} from '../profileUpdate';
type ProfileErrors = Partial<Record<ProfileFieldName, string>>;

interface EditProfileFormProps {
  profile: EditableProfile;
  onSubmit: (input: UpdateProfileInput) => Promise<EditableProfile>;
  onCancel: () => void;
}

const SUBMIT_ERROR_MESSAGE =
  'Não foi possível salvar o perfil. Tente novamente.';

function toValues(profile: EditableProfile): ProfileValues {
  return {
    name: profile.name ?? '',
    phone: profile.phone ?? '',
    bio: profile.bio ?? '',
    hometown: profile.hometown ?? '',
  };
}

const VALIDATORS: Record<
  ProfileFieldName,
  (value: string, baselineValue: string) => string | undefined
> = {
  name: validateProfileName,
  phone: (value, baselineValue) =>
    baselineValue.trim() && !value.trim()
      ? 'O telefone cadastrado só pode ser substituído por outro número.'
      : validateProfilePhone(value),
  bio: validateProfileBio,
  hometown: validateProfileHometown,
};

function validate(
  values: ProfileValues,
  baseline: ProfileValues,
): ProfileErrors {
  const errors: ProfileErrors = {};

  for (const field of Object.keys(VALIDATORS) as ProfileFieldName[]) {
    errors[field] = VALIDATORS[field](values[field], baseline[field]);
  }

  return errors;
}

function hasErrors(errors: ProfileErrors): boolean {
  return Object.values(errors).some(Boolean);
}

interface ProfileFieldProps {
  field: ProfileFieldName;
  label: string;
  placeholder: string;
  autoComplete: string;
  type?: 'text' | 'tel';
  required?: boolean;
  hint?: string;
  multiline?: boolean;
  value: string;
  error?: string;
  onChange: (field: ProfileFieldName, value: string) => void;
  onBlur: (field: ProfileFieldName) => void;
}

function ProfileField({
  field,
  label,
  placeholder,
  autoComplete,
  type = 'text',
  required,
  hint,
  multiline,
  value,
  error,
  onChange,
  onBlur,
}: ProfileFieldProps) {
  const id = `profile-${field}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId]
    .filter(Boolean)
    .join(' ');
  const controlProps = {
    id,
    name: field,
    maxLength: PROFILE_LIMITS[field],
    autoComplete,
    placeholder,
    required,
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy || undefined,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(field, event.target.value),
    onBlur: () => onBlur(field),
  };

  return (
    <div className="profile-edit__field">
      <label className="profile-edit__label" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea
          {...controlProps}
          className="form-control profile-edit__input profile-edit__textarea"
          rows={4}
        />
      ) : (
        <input
          {...controlProps}
          className="form-control profile-edit__input"
          type={type}
        />
      )}
      {hint && (
        <span className="profile-edit__hint" id={hintId}>
          {hint}
        </span>
      )}
      <span className="profile-edit__counter">
        {value.trim().length}/{PROFILE_LIMITS[field]}
      </span>
      {error && (
        <p className="profile-edit__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function EditProfileForm({
  profile,
  onSubmit,
  onCancel,
}: EditProfileFormProps) {
  const [values, setValues] = useState<ProfileValues>(() => toValues(profile));
  const [baseline, setBaseline] = useState<ProfileValues>(() =>
    toValues(profile),
  );
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    kind: 'neutral' | 'success';
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: ProfileFieldName, value: string) {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    setSubmitError(null);
    setFeedback(null);

    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        [field]: VALIDATORS[field](value, baseline[field]),
      };
    });
  }

  function handleBlur(field: ProfileFieldName) {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: VALIDATORS[field](values[field], baseline[field]),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validate(values, baseline);
    setErrors(nextErrors);
    setSubmitError(null);
    setFeedback(null);

    if (hasErrors(nextErrors)) {
      return;
    }

    const update = buildUpdate(values, baseline);

    if (Object.keys(update).length === 0) {
      setFeedback({
        kind: 'neutral',
        message: 'Nenhuma alteração para salvar.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updated = await onSubmit(update);
      const updatedValues = toValues(updated);

      setValues(updatedValues);
      setBaseline(updatedValues);
      setFeedback({
        kind: 'success',
        message: 'Perfil atualizado com sucesso.',
      });
    } catch {
      setSubmitError(SUBMIT_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="profile-edit__form"
      noValidate
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <ProfileField
        field="name"
        label="Nome de exibição"
        placeholder="Seu nome"
        autoComplete="name"
        required
        value={values.name}
        error={errors.name}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <ProfileField
        field="phone"
        label={baseline.phone.trim() ? 'Telefone' : 'Telefone (opcional)'}
        placeholder="+5583999999999"
        autoComplete="tel"
        type="tel"
        hint="Formato internacional E.164, ex.: +5583999999999."
        value={values.phone}
        error={errors.phone}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <ProfileField
        field="bio"
        label="Biografia (opcional)"
        placeholder="Conte um pouco sobre você"
        autoComplete="off"
        multiline
        value={values.bio}
        error={errors.bio}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <ProfileField
        field="hometown"
        label="Cidade de origem (opcional)"
        placeholder="Ex.: Campina Grande, PB"
        autoComplete="off"

        value={values.hometown}
        error={errors.hometown}
        onChange={handleChange}
        onBlur={handleBlur}
      />

      {submitError && (
        <p className="profile-edit__error" role="alert">
          {submitError}
        </p>
      )}

      {feedback && (
        <p
          className={
            feedback.kind === 'success'
              ? 'profile-edit__success'
              : 'profile-edit__hint'
          }
          role="status"
        >
          {feedback.message}
        </p>
      )}

      <div className="profile-edit__actions">
        <button
          className="form-button profile-edit__secondary-button"
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          className="form-button profile-edit__primary-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
