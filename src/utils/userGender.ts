import type { UserGender } from '../models/types';

export const GENDER_OPTIONS: ReadonlyArray<{ value: UserGender; label: string }> = [
  { value: 'male', label: 'Hombre' },
  { value: 'female', label: 'Mujer' },
  { value: 'other', label: 'Otro' },
];

export function isUserGender(value: unknown): value is UserGender {
  return value === 'male' || value === 'female' || value === 'other';
}

export function resolveUserGender(value: unknown): UserGender | null {
  return isUserGender(value) ? value : null;
}
