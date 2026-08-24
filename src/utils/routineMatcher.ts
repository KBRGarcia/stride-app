import type { Recommendation, RoutinesData, UserProfile } from '../models/types';
import {
  AGE_RANGE_IDS,
  WEIGHT_RANGE_IDS,
  getAgeRangeId,
  getWeightRangeId,
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

type SearchCandidate = {
  ageRange: AgeRangeId;
  weightRange: WeightRangeId;
};

/**
 * Ordena candidatos de búsqueda: exacto → mismo rango de edad con peso cercano →
 * mismo rango de peso con edad cercana → vecino más próximo (distancia Manhattan).
 */
export function buildSearchCandidates(ageRange: AgeRangeId, weightKg: number): SearchCandidate[] {
  const primaryWeightRange = getWeightRangeId(weightKg);

  if (!primaryWeightRange) {
    return [];
  }

  const seen = new Set<string>();
  const ordered: SearchCandidate[] = [];

  const add = (candidateAgeRange: AgeRangeId, candidateWeightRange: WeightRangeId) => {
    const key = `${candidateAgeRange}|${candidateWeightRange}`;

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    ordered.push({ ageRange: candidateAgeRange, weightRange: candidateWeightRange });
  };

  for (const weightRange of getWeightRangesToTry(weightKg)) {
    add(ageRange, weightRange);
  }

  const ageIndex = AGE_RANGE_IDS.indexOf(ageRange);
  const weightIndex = WEIGHT_RANGE_IDS.indexOf(primaryWeightRange);

  for (let distance = 1; distance < WEIGHT_RANGE_IDS.length; distance += 1) {
    const lowerIndex = weightIndex - distance;
    const upperIndex = weightIndex + distance;

    if (lowerIndex >= 0) {
      add(ageRange, WEIGHT_RANGE_IDS[lowerIndex]);
    }

    if (upperIndex < WEIGHT_RANGE_IDS.length) {
      add(ageRange, WEIGHT_RANGE_IDS[upperIndex]);
    }
  }

  for (let distance = 1; distance < AGE_RANGE_IDS.length; distance += 1) {
    const lowerIndex = ageIndex - distance;
    const upperIndex = ageIndex + distance;

    if (lowerIndex >= 0) {
      add(AGE_RANGE_IDS[lowerIndex], primaryWeightRange);
    }

    if (upperIndex < AGE_RANGE_IDS.length) {
      add(AGE_RANGE_IDS[upperIndex], primaryWeightRange);
    }
  }

  const remaining: Array<{ candidate: SearchCandidate; distance: number }> = [];

  for (let candidateAgeIndex = 0; candidateAgeIndex < AGE_RANGE_IDS.length; candidateAgeIndex += 1) {
    for (
      let candidateWeightIndex = 0;
      candidateWeightIndex < WEIGHT_RANGE_IDS.length;
      candidateWeightIndex += 1
    ) {
      const candidateAgeRange = AGE_RANGE_IDS[candidateAgeIndex];
      const candidateWeightRange = WEIGHT_RANGE_IDS[candidateWeightIndex];
      const key = `${candidateAgeRange}|${candidateWeightRange}`;

      if (seen.has(key)) {
        continue;
      }

      remaining.push({
        candidate: { ageRange: candidateAgeRange, weightRange: candidateWeightRange },
        distance:
          Math.abs(candidateAgeIndex - ageIndex) + Math.abs(candidateWeightIndex - weightIndex),
      });
    }
  }

  remaining.sort((left, right) => left.distance - right.distance);

  for (const { candidate } of remaining) {
    add(candidate.ageRange, candidate.weightRange);
  }

  return ordered;
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
 * Si no hay coincidencia exacta, aplica fallback por rangos adyacentes.
 */
export function findMatchingRecommendation(
  profile: UserProfile,
  routines: RoutinesData,
  referenceDate: Date = new Date()
): Recommendation | null {
  const age = calculateAge(profile.birthDate, referenceDate);
  const ageRange = getAgeRangeId(age);

  if (!ageRange) {
    return null;
  }

  const candidates = buildSearchCandidates(ageRange, profile.weight);

  if (candidates.length === 0) {
    return null;
  }

  for (const { ageRange: candidateAgeRange, weightRange: candidateWeightRange } of candidates) {
    const match = routines.find((recommendation) =>
      matchesRecommendation(
        recommendation,
        candidateAgeRange,
        candidateWeightRange,
        profile.gender
      )
    );

    if (match) {
      return match;
    }
  }

  return null;
}
