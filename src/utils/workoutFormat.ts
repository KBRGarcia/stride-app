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

export function formatElapsedDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} h ${minutes} min ${seconds} s`;
  }

  return `${minutes} min ${seconds} s`;
}
