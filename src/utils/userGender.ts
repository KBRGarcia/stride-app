import type { UserGender } from '../models/types';

export const GENDER_OPTIONS: ReadonlyArray<{ value: UserGender; label: string }> = [
  { value: 'male', label: 'Hombre' },
  { value: 'female', label: 'Mujer' },
];

export function isUserGender(value: unknown): value is UserGender {
  return value === 'male' || value === 'female';
}

export function resolveUserGender(value: unknown): UserGender | null {
  return isUserGender(value) ? value : null;
}
