import type { UserProfile, WeeklyPlan } from '../models/types';
import { getAgeBand } from './ageBands';
import { resolveRoutineSchedule } from './routineSchedule';
import { buildWeeklyPlan, getGoalCatalog } from './routinesData';

/**
 * Calcula la edad en años completos a partir de una fecha ISO (`YYYY-MM-DD`).
 */
export function calculateAge(birthDate: string, referenceDate: Date = new Date()): number {
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
    (referenceDate.getMonth() === birth.getMonth() && referenceDate.getDate() >= birth.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

/**
 * Arma la semana del objetivo elegido y aplica series y repeticiones de la edad.
 * El peso no cambia los ejercicios.
 */
export function resolveWeeklyPlan(
  profile: UserProfile,
  referenceDate: Date = new Date()
): WeeklyPlan | null {
  const ageBand = getAgeBand(calculateAge(profile.birthDate, referenceDate));

  if (!ageBand) {
    return null;
  }

  return buildWeeklyPlan(
    getGoalCatalog(profile.workoutLocation, profile.goal),
    ageBand,
    resolveRoutineSchedule(profile.workoutLocation, profile.routineSchedule)
  );
}
