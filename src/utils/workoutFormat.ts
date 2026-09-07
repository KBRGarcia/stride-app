import type { Exercise } from '../models/types';

export function formatExercisePrescription(exercise: Exercise): string {
  if (exercise.durationSeconds) {
    return exercise.sets
      ? `${exercise.sets} series × ${exercise.durationSeconds}s`
      : `${exercise.durationSeconds}s`;
  }

  if (exercise.sets && exercise.reps) {
    return `${exercise.sets} series × ${exercise.reps}`;
  }

  return exercise.reps ?? 'Sigue las indicaciones';
}
