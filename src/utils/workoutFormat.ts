import type { Exercise } from '../models/types';

export function formatExercisePrescription(exercise: Exercise): string {
  if (exercise.durationSeconds) {
    return `${exercise.sets} series × ${exercise.durationSeconds}s`;
  }

  return `${exercise.sets} series × ${exercise.reps ?? '-'}`;
}
