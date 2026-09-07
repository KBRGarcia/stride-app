import { formatElapsedDuration, formatExercisePrescription } from '../workoutFormat';
import type { Exercise } from '../../models/types';

describe('formatElapsedDuration', () => {
  it('formatea minutos y segundos', () => {
    expect(formatElapsedDuration(125_000)).toBe('2 min 5 s');
  });

  it('incluye horas cuando corresponde', () => {
    expect(formatElapsedDuration(3_661_000)).toBe('1 h 1 min 1 s');
  });
});

describe('formatExercisePrescription', () => {
  it('usa duración cuando el ejercicio es por tiempo', () => {
    const exercise = {
      sets: 3,
      reps: null,
      durationSeconds: 20,
    } as Exercise;

    expect(formatExercisePrescription(exercise)).toBe('3 series × 20s');
  });
});
