import type { RoutineSchedule, WorkoutLocation } from '../models/types';

/**
 * Casa solo tiene la rutina de 5 días.
 * En gimnasio se conserva la opción guardada; un valor ausente o inválido queda en 5 días.
 */
export function resolveRoutineSchedule(
  workoutLocation: WorkoutLocation,
  value: unknown
): RoutineSchedule {
  if (workoutLocation === 'gym' && (value === '5-days' || value === '3-days')) {
    return value;
  }

  return '5-days';
}
