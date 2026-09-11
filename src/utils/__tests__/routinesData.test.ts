import type {
  Archetype,
  RoutinesData,
  WorkoutGoal,
  WorkoutLocation,
} from '../../models/types';
import { getDayExercises, getRoutines } from '../routinesData';

const ARCHETYPES: Archetype[] = ['A', 'B', 'C', 'D', 'E', 'F'];
const GOALS: WorkoutGoal[] = ['toning', 'muscle_gain', 'fat_reduction'];
const LOCATIONS: WorkoutLocation[] = ['home', 'gym'];
const DATASETS: ReadonlyArray<{
  name: string;
  location: WorkoutLocation;
  goal: WorkoutGoal;
}> = [
  { name: 'casa/tonificación', location: 'home', goal: 'toning' },
  { name: 'casa/masa muscular', location: 'home', goal: 'muscle_gain' },
  { name: 'casa/reducción de grasa', location: 'home', goal: 'fat_reduction' },
  { name: 'gimnasio/tonificación', location: 'gym', goal: 'toning' },
  { name: 'gimnasio/masa muscular', location: 'gym', goal: 'muscle_gain' },
  { name: 'gimnasio/reducción de grasa', location: 'gym', goal: 'fat_reduction' },
];

function validateDataset(routines: RoutinesData): void {
  expect(routines.map((routine) => routine.archetype)).toEqual(ARCHETYPES);

  const exerciseIds = new Set<string>();

  for (const routine of routines) {
    expect(routine.weeklyRoutine.map((day) => day.day).sort()).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);

    for (const day of routine.weeklyRoutine) {
      for (const exercise of getDayExercises(day)) {
        expect(exerciseIds.has(exercise.id)).toBe(false);
        exerciseIds.add(exercise.id);
        expect(['upper', 'lower', 'full']).toContain(exercise.bodyZone);

        const isTimed =
          Number.isInteger(exercise.durationSeconds) &&
          (exercise.durationSeconds ?? 0) > 0 &&
          exercise.reps === null;
        const usesRepetitions =
          typeof exercise.reps === 'string' &&
          exercise.reps.trim().length > 0 &&
          exercise.durationSeconds === null;

        expect(isTimed || usesRepetitions).toBe(true);
      }
    }
  }
}

describe('routinesData', () => {
  it.each(LOCATIONS)('incluye los seis arquetipos en %s para cada objetivo', (location) => {
    for (const goal of GOALS) {
      const routines = getRoutines(location, goal);

      expect(routines.map((routine) => routine.archetype)).toEqual(ARCHETYPES);
      expect(routines.every((routine) => routine.weeklyRoutine.length === 7)).toBe(true);
    }
  });

  it('ordena las fases de cada sesión', () => {
    const day = getRoutines('home', 'toning')[0].weeklyRoutine[0];

    expect(getDayExercises(day)).toEqual([
      ...day.warmUp,
      ...day.mainWorkout,
      ...day.coolDown,
    ]);
  });

  it.each(DATASETS)('valida profundamente el JSON de $name', ({ location, goal }) => {
    validateDataset(getRoutines(location, goal));
  });
});
