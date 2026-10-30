import { useState, type FormEvent } from 'react';

import type { EditableProfile, UpdateProfileInput } from '../profileTypes';
import {
  PROFILE_LIMITS,
  validateProfileBio,
  validateProfileHometown,
  validateProfileName,
  validateProfilePhone,
} from '../profileValidation';

type ProfileField = 'name' | 'phone' | 'bio' | 'hometown';

type ProfileValues = Record<ProfileField, string>;
type ProfileErrors = Partial<Record<ProfileField, string>>;

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

function validate(values: ProfileValues): ProfileErrors {
  return {
    name: validateProfileName(values.name),
    phone: validateProfilePhone(values.phone),
    bio: validateProfileBio(values.bio),
    hometown: validateProfileHometown(values.hometown),
  };
}

function hasErrors(errors: ProfileErrors): boolean {
  return Object.values(errors).some(Boolean);
}

function buildUpdate(
  values: ProfileValues,
  baseline: ProfileValues,
): UpdateProfileInput {
  const update: UpdateProfileInput = {};

  const name = values.name.trim();
  const phone = values.phone.trim();
  const bio = values.bio.trim();
  const hometown = values.hometown.trim();

  if (name !== baseline.name.trim()) {
    update.name = name;
  }

  if (phone !== baseline.phone.trim()) {
    update.phone = phone;
  }

  if (bio !== baseline.bio.trim()) {
    update.bio = bio;
  }

  if (hometown !== baseline.hometown.trim()) {
    update.hometown = hometown;
  }

  return update;
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: ProfileField, value: string) {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    setSubmitError(null);
    setSuccessMessage(null);

    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        [field]: validate(nextValues)[field],
      };
    });
  }

  function handleBlur(field: ProfileField) {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: validate(values)[field],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitError(null);
    setSuccessMessage(null);

    if (hasErrors(nextErrors)) {
      return;
    }

    const update = buildUpdate(values, baseline);

    if (Object.keys(update).length === 0) {
      setSuccessMessage('Nenhuma alteração para salvar.');
      return;
    }

    setIsSubmitting(true);

    try {
      const updated = await onSubmit(update);
      const updatedValues = toValues(updated);

      setValues(updatedValues);
      setBaseline(updatedValues);
      setSuccessMessage('Perfil atualizado com sucesso.');
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
      <div className="profile-edit__field">
        <label className="profile-edit__label" htmlFor="profile-name">
          Nome de exibição
        </label>
        <input
          className="form-control profile-edit__input"
          id="profile-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Seu nome"
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'profile-name-error' : undefined}
          value={values.name}
          onChange={(event) => handleChange('name', event.target.value)}
          onBlur={() => handleBlur('name')}
        />
        <span className="profile-edit__counter">
          {values.name.length}/{PROFILE_LIMITS.name}
        </span>
        {errors.name && (
          <p
            className="profile-edit__error"
            id="profile-name-error"
            role="alert"
          >
            {errors.name}
          </p>
        )}
      </div>

      <div className="profile-edit__field">
        <label className="profile-edit__label" htmlFor="profile-phone">
          Telefone (opcional)
        </label>
        <input
          className="form-control profile-edit__input"
          id="profile-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+5583999999999"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={
            errors.phone
              ? 'profile-phone-hint profile-phone-error'
              : 'profile-phone-hint'
          }
          value={values.phone}
          onChange={(event) => handleChange('phone', event.target.value)}
          onBlur={() => handleBlur('phone')}
        />
        <span className="profile-edit__hint" id="profile-phone-hint">
          Formato internacional E.164, ex.: +5583999999999.
        </span>
        <span className="profile-edit__counter">
          {values.phone.length}/{PROFILE_LIMITS.phone}
        </span>
        {errors.phone && (
          <p
            className="profile-edit__error"
            id="profile-phone-error"
            role="alert"
          >
            {errors.phone}
          </p>
        )}
      </div>

      <div className="profile-edit__field">
        <label className="profile-edit__label" htmlFor="profile-bio">
          Biografia (opcional)
        </label>
        <textarea
          className="form-control profile-edit__input profile-edit__textarea"
          id="profile-bio"
          name="bio"
          rows={4}
          autoComplete="off"
          placeholder="Conte um pouco sobre você"
          aria-invalid={Boolean(errors.bio)}
          aria-describedby={errors.bio ? 'profile-bio-error' : undefined}
          value={values.bio}
          onChange={(event) => handleChange('bio', event.target.value)}
          onBlur={() => handleBlur('bio')}
        />
        <span className="profile-edit__counter" aria-live="polite">
          {values.bio.length}/{PROFILE_LIMITS.bio}
        </span>
        {errors.bio && (
          <p
            className="profile-edit__error"
            id="profile-bio-error"
            role="alert"
          >
            {errors.bio}
          </p>
        )}
      </div>

      <div className="profile-edit__field">
        <label className="profile-edit__label" htmlFor="profile-hometown">
          Cidade de origem (opcional)
        </label>
        <input
          className="form-control profile-edit__input"
          id="profile-hometown"
          name="hometown"
          type="text"
          autoComplete="off"
          placeholder="Ex.: Campina Grande, PB"
          aria-invalid={Boolean(errors.hometown)}
          aria-describedby={
            errors.hometown ? 'profile-hometown-error' : undefined
          }
          value={values.hometown}
          onChange={(event) => handleChange('hometown', event.target.value)}
          onBlur={() => handleBlur('hometown')}
        />
        <span className="profile-edit__counter">
          {values.hometown.length}/{PROFILE_LIMITS.hometown}
        </span>
        {errors.hometown && (
          <p
            className="profile-edit__error"
            id="profile-hometown-error"
            role="alert"
          >
            {errors.hometown}
          </p>
        )}
      </div>

      {submitError && (
        <p className="profile-edit__error" role="alert">
          {submitError}
        </p>
      )}

      {successMessage && (
        <p className="profile-edit__success" role="status">
          {successMessage}
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
