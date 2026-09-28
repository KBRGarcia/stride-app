import type { Exercise } from '../../models/types';
import {
  formatExerciseFocus,
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
    muscleGroup: null,
    muscle: null,
    tool: null,
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
  it('prioriza el músculo indicado en el catálogo', () => {
    expect(
      getExerciseMuscleGroup(
        buildExercise({
          name: 'Movimiento',
          muscle: 'Pectoral Mayor',
          muscleGroup: 'Pecho',
        })
      )
    ).toBe('Pectoral Mayor');
  });

  it('usa el nombre y, si no hay coincidencia, bodyZone', () => {
    expect(
      getExerciseMuscleGroup(buildExercise({ name: 'Flexiones de pecho', bodyZone: 'upper' }))
    ).toBe('Pecho');
    expect(
      getExerciseMuscleGroup(buildExercise({ name: 'Rotación desconocida', bodyZone: 'upper' }))
    ).toBe('Tren superior');
  });
});

describe('formatExerciseFocus', () => {
  it('añade el implemento cuando existe', () => {
    expect(
      formatExerciseFocus(
        buildExercise({
          muscle: 'Dorsal ancho',
          tool: 'Máquina',
        })
      )
    ).toBe('Dorsal ancho · Máquina');
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
