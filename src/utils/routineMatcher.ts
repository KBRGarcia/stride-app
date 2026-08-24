import type { Recommendation, RoutinesData, UserProfile } from '../models/types';
import {
  getAgeRangeId,
  getWeightRangesToTry,
  inferAgeRangeFromBounds,
  inferWeightRangeFromBounds,
  type AgeRangeId,
  type WeightRangeId,
} from './profileRanges';

export function getRecommendationAgeRange(recommendation: Recommendation): AgeRangeId | null {
  return recommendation.ageRange ?? inferAgeRangeFromBounds(recommendation.ageMin, recommendation.ageMax);
}

export function getRecommendationWeightRange(
  recommendation: Recommendation
): WeightRangeId | null {
  return (
    recommendation.weightRange ??
    inferWeightRangeFromBounds(recommendation.weightMin, recommendation.weightMax)
  );
}

function matchesRecommendation(
  recommendation: Recommendation,
  ageRange: AgeRangeId,
  weightRange: WeightRangeId,
  gender: UserProfile['gender']
): boolean {
  const recommendationAgeRange = getRecommendationAgeRange(recommendation);
  const recommendationWeightRange = getRecommendationWeightRange(recommendation);

  return (
    recommendation.gender === gender &&
    recommendationAgeRange === ageRange &&
    recommendationWeightRange === weightRange
  );
}

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
 * Busca la recomendación que coincide con el rango de edad y peso del perfil.
 */
export function findMatchingRecommendation(
  profile: UserProfile,
  routines: RoutinesData,
  referenceDate: Date = new Date()
): Recommendation | null {
  const age = calculateAge(profile.birthDate, referenceDate);
  const ageRange = getAgeRangeId(age);
  const weightRangesToTry = getWeightRangesToTry(profile.weight);

  if (!ageRange || weightRangesToTry.length === 0) {
    return null;
  }

  for (const weightRange of weightRangesToTry) {
    const match = routines.find((recommendation) =>
      matchesRecommendation(recommendation, ageRange, weightRange, profile.gender)
    );

    if (match) {
      return match;
    }
  }

  return null;
}
