export const AGE_RANGE_IDS = [
  '<=14',
  '15-20',
  '20-30',
  '30-40',
  '40-50',
  '50-60',
  '60-69',
  '>=70',
] as const;

export type AgeRangeId = (typeof AGE_RANGE_IDS)[number];

export const WEIGHT_RANGE_IDS = [
  '40-50',
  '50-60',
  '60-70',
  '70-80',
  '80-89',
  '>=90',
] as const;

export type WeightRangeId = (typeof WEIGHT_RANGE_IDS)[number];

export const MIN_MATCHABLE_WEIGHT_KG = 40;

/**
 * El usuario introduce la edad exacta; el matcher trabaja por estos rangos.
 * El límite compartido (20, 30, …) pertenece al rango anterior.
 */
export function getAgeRangeId(age: number): AgeRangeId | null {
  if (!Number.isFinite(age) || age < 0) {
    return null;
  }

  if (age <= 14) {
    return '<=14';
  }

  if (age <= 20) {
    return '15-20';
  }

  if (age <= 30) {
    return '20-30';
  }

  if (age <= 40) {
    return '30-40';
  }

  if (age <= 50) {
    return '40-50';
  }

  if (age <= 60) {
    return '50-60';
  }

  if (age <= 69) {
    return '60-69';
  }

  return '>=70';
}

/**
 * El usuario introduce el peso exacto; el matcher trabaja por estos rangos (kg).
 * Inferior inclusivo, superior exclusivo, excepto `>=90`.
 */
export function getWeightRangeId(weightKg: number): WeightRangeId | null {
  if (!Number.isFinite(weightKg) || weightKg < MIN_MATCHABLE_WEIGHT_KG) {
    return null;
  }

  if (weightKg < 50) {
    return '40-50';
  }

  if (weightKg < 60) {
    return '50-60';
  }

  if (weightKg < 70) {
    return '60-70';
  }

  if (weightKg < 80) {
    return '70-80';
  }

  if (weightKg < 90) {
    return '80-89';
  }

  return '>=90';
}

/** Límite inferior (inclusivo) del tramo 70–79 kg cuando no hay rutina `70-80`. */
export const WEIGHT_70_80_SPLIT_KG = 75;

/**
 * Rangos de peso a probar en orden de preferencia.
 * Entre 70–79 kg: intenta `70-80` primero; si no hay rutina, usa `60-70` (70–74) o `80-89` (75–79).
 */
export function getWeightRangesToTry(weightKg: number): WeightRangeId[] {
  const primary = getWeightRangeId(weightKg);

  if (!primary) {
    return [];
  }

  if (primary !== '70-80') {
    return [primary];
  }

  const fallback: WeightRangeId =
    weightKg < WEIGHT_70_80_SPLIT_KG ? '60-70' : '80-89';

  return ['70-80', fallback];
}

/** Interpreta `ageMin`/`ageMax` del JSON legado (sin `ageRange`). */
export function inferAgeRangeFromBounds(ageMin: number, ageMax: number): AgeRangeId | null {
  if (ageMax <= 14) {
    return '<=14';
  }

  if (ageMax <= 20) {
    return '15-20';
  }

  if (ageMax <= 30) {
    return '20-30';
  }

  if (ageMax <= 40) {
    return '30-40';
  }

  if (ageMax <= 50) {
    return '40-50';
  }

  if (ageMax <= 60) {
    return '50-60';
  }

  if (ageMax <= 69) {
    return '60-69';
  }

  if (ageMin >= 70) {
    return '>=70';
  }

  return null;
}

/** Interpreta `weightMin`/`weightMax` del JSON legado (sin `weightRange`). */
export function inferWeightRangeFromBounds(
  weightMin: number,
  _weightMax: number
): WeightRangeId | null {
  if (weightMin >= 90) {
    return '>=90';
  }

  if (weightMin >= 80) {
    return '80-89';
  }

  if (weightMin >= 70) {
    return '70-80';
  }

  if (weightMin >= 60) {
    return '60-70';
  }

  if (weightMin >= 50) {
    return '50-60';
  }

  if (weightMin >= 40) {
    return '40-50';
  }

  return null;
}
