import type { Recommendation, RoutinesData, UserProfile } from '../models/types';

/** Puntuación de especificidad: a menor valor, rango más estrecho (más específico). */
function getSpecificityScore(recommendation: Recommendation): number {
  const ageSpan = recommendation.ageMax - recommendation.ageMin;
  const weightSpan = recommendation.weightMax - recommendation.weightMin;
  return ageSpan + weightSpan;
}

function matchesRecommendation(
  recommendation: Recommendation,
  age: number,
  weight: number,
  gender: UserProfile['gender']
): boolean {
  return (
    recommendation.gender === gender &&
    age >= recommendation.ageMin &&
    age <= recommendation.ageMax &&
    weight >= recommendation.weightMin &&
    weight <= recommendation.weightMax
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
 * Busca la recomendación más específica que coincida con el perfil del usuario.
 * Ordena por rangos más estrechos (edad + peso) y devuelve el primer match.
 */
export function findMatchingRecommendation(
  profile: UserProfile,
  routines: RoutinesData
): Recommendation | null {
  const age = calculateAge(profile.birthDate);

  const sortedBySpecificity = [...routines].sort(
    (a, b) => getSpecificityScore(a) - getSpecificityScore(b)
  );

  return (
    sortedBySpecificity.find((recommendation) =>
      matchesRecommendation(recommendation, age, profile.weight, profile.gender)
    ) ?? null
  );
}
