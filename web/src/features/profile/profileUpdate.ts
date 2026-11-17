import type { UpdateProfileInput } from './profileTypes';

const FIELDS = ['name', 'phone', 'bio', 'hometown'] as const;
export type ProfileFieldName = (typeof FIELDS)[number];
export type ProfileValues = Record<ProfileFieldName, string>;

export function buildUpdate(
  values: ProfileValues,
  baseline: ProfileValues,
): UpdateProfileInput {
  const update: UpdateProfileInput = {};

  for (const field of FIELDS) {
    const value = values[field].trim();
    if (value !== baseline[field].trim()) {
      update[field] = value;
    }
  }

  return update;
}
