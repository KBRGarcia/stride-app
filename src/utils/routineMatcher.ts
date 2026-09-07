import type { Recommendation, RoutinesData, UserProfile } from '../models/types';
import { getArchetype } from './archetypes';

/**
 * Calcula la edad en años completos a partir de una fecha ISO (`YYYY-MM-DD`).
 */
export function calculateAge(
  birthDate: string,
  referenceDate: Date = new Date()
): number {
  const parts = birthDate.split('-');
  if (parts.length !== 3 || parts[0]?.length !== 4) {
    throw new Error(`Invalid birthDate format: "${birthDate}". Expected YYYY-MM-DD.`);
  }

  const [year, month, day] = parts.map(Number);

  if (!year || !month || !day) {
    throw new Error(`Invalid birthDate format: "${birthDate}". Expected YYYY-MM-DD.`);
  }

  const birth = new Date(year, month - 1, day);

  if (
    birth.getFullYear() !== year ||
    birth.getMonth() !== month - 1 ||
    birth.getDate() !== day
  ) {
    throw new Error(`Invalid birthDate value: "${birthDate}".`);
  }

  let age = referenceDate.getFullYear() - birth.getFullYear();
  const hasBirthdayPassed =
    referenceDate.getMonth() > birth.getMonth() ||
    (referenceDate.getMonth() === birth.getMonth() &&
      referenceDate.getDate() >= birth.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

/**
 * Busca la recomendación correspondiente al arquetipo calculado del perfil.
 */
export function findMatchingRecommendation(
  profile: UserProfile,
  routines: RoutinesData,
  referenceDate: Date = new Date()
): Recommendation | null {
  const age = calculateAge(profile.birthDate, referenceDate);
  const archetype = getArchetype(age, profile.weight);

  return archetype
    ? routines.find((recommendation) => recommendation.archetype === archetype) ?? null
    : null;
}
