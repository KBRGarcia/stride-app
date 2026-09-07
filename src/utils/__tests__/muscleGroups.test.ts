import type { Exercise } from '../../models/types';
import {
  formatMuscleGroups,
  getExerciseMuscleGroup,
  inferMuscleGroup,
} from '../muscleGroups';

function buildExercise(overrides: Partial<Exercise>): Exercise {
  return {
    id: 'exercise-id',
    name: 'Movimiento',
    description: 'Descripción',
    imagePlaceholder: 'placeholder.png',
    bodyZone: 'full',
    sets: 3,
    reps: '10',
    durationSeconds: null,
    ...overrides,
  };
}

describe('inferMuscleGroup', () => {
  it('clasifica ejercicios frecuentes por nombre', () => {
    expect(inferMuscleGroup('Flexiones de pecho')).toBe('Pecho');
    expect(inferMuscleGroup('Puente de glúteos')).toBe('Glúteos');
    expect(inferMuscleGroup('Sentadilla a silla')).toBe('Piernas');
    expect(inferMuscleGroup('Plancha frontal')).toBe('Core');
    expect(inferMuscleGroup('Jumping jacks')).toBe('Cardio');
    expect(inferMuscleGroup('Fondos en silla')).toBe('Tríceps');
  });

  it('devuelve null si no hay coincidencia por nombre', () => {
    expect(inferMuscleGroup('Movimiento desconocido')).toBeNull();
  });
});

describe('getExerciseMuscleGroup', () => {
  it('prioriza el nombre y usa bodyZone como respaldo', () => {
    expect(
      getExerciseMuscleGroup(buildExercise({ name: 'Flexiones de pecho', bodyZone: 'upper' }))
    ).toBe('Pecho');
    expect(
      getExerciseMuscleGroup(buildExercise({ name: 'Rotación desconocida', bodyZone: 'upper' }))
    ).toBe('Tren superior');
  });
});

describe('formatMuscleGroups', () => {
  it('une los grupos únicos del día', () => {
    const exercises = [
      buildExercise({ name: 'Flexiones de pecho', bodyZone: 'upper' }),
      buildExercise({ id: '2', name: 'Sentadillas', bodyZone: 'lower' }),
      buildExercise({ id: '3', name: 'Flexiones de pecho', bodyZone: 'upper' }),
    ];

    expect(formatMuscleGroups(exercises)).toBe('Pecho · Piernas');
  });
});
