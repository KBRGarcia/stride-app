import type { Archetype } from '../models/types';

export const MIN_SUPPORTED_AGE = 14;
export const MIN_SUPPORTED_WEIGHT_KG = 40;

/**
 * Resuelve el arquetipo sin límites superiores artificiales.
 * Para pesos decimales, cualquier valor superior a 70 kg pertenece al grupo pesado.
 */
export function getArchetype(age: number, weightKg: number): Archetype | null {
  if (
    !Number.isFinite(age) ||
    !Number.isFinite(weightKg) ||
    age < MIN_SUPPORTED_AGE ||
    weightKg < MIN_SUPPORTED_WEIGHT_KG
  ) {
    return null;
  }

  if (age <= 40) {
    return weightKg <= 70 ? 'A' : 'B';
  }

  if (age <= 65) {
    return weightKg <= 70 ? 'C' : 'D';
  }

  if (age <= 75) {
    return 'E';
  }

  return 'F';
}
