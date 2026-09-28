import type { AgeBand, AgePrescription } from '../models/types';

export const MIN_SUPPORTED_AGE = 14;
export const MIN_SUPPORTED_WEIGHT_KG = 40;

export const AGE_BANDS: readonly AgeBand[] = ['14-39', '40-59', '60+'];

export const AGE_BAND_LABELS: Record<AgeBand, string> = {
  '14-39': '14 a 39 años',
  '40-59': '40 a 59 años',
  '60+': '60 años o más',
};

/** Carga por defecto cuando el objetivo aún no está elegido. */
export const DEFAULT_AGE_PRESCRIPTIONS: Record<AgeBand, AgePrescription> = {
  '14-39': { series: 4, repeticiones: 15 },
  '40-59': { series: 3, repeticiones: 12 },
  '60+': { series: 2, repeticiones: 8 },
};

/**
 * Resuelve la franja a partir de la edad en años completos.
 * 39 entra en la primera franja, 40 en la segunda y 60 en la de mayores.
 */
export function getAgeBand(age: number): AgeBand | null {
  if (!Number.isFinite(age) || age < MIN_SUPPORTED_AGE) {
    return null;
  }

  if (age <= 39) {
    return '14-39';
  }

  if (age <= 59) {
    return '40-59';
  }

  return '60+';
}
