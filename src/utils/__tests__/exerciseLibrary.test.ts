import type { WorkoutGoal, WorkoutLocation } from '../../models/types';
import { EXERCISE_LIBRARY_GROUP_ORDER, getExerciseLibrary, toLibraryExerciseView } from '../exerciseLibrary';
import { getGoalCatalog, listCatalogDays } from '../routinesData';

const LOCATIONS: WorkoutLocation[] = ['home', 'gym'];
const GOALS: WorkoutGoal[] = ['toning', 'muscle_gain', 'fat_reduction'];
const MUSCLE_GROUPS = ['pecho', 'espalda', 'hombros', 'brazos', 'abdomen', 'piernas'];

function sourceIds(location: WorkoutLocation, goal: WorkoutGoal): string[] {
  return listCatalogDays(getGoalCatalog(location, goal)).flatMap(({ day }) => [
    ...day.calentamiento.map((exercise) => exercise.id),
    ...day.ejercicios.map((exercise) => exercise.id),
    ...day.enfriamiento.map((exercise) => exercise.id),
  ]);
}

describe('exerciseLibrary', () => {
  it.each(LOCATIONS)(
    'separa músculos, calentamiento y enfriamiento en %s',
    (location) => {
      for (const goal of GOALS) {
        const library = getExerciseLibrary(location, goal);

        expect(library.gruposMusculares.map((group) => group.id)).toEqual([
          ...EXERCISE_LIBRARY_GROUP_ORDER,
        ]);
        expect(library.gruposMusculares.every((group) => group.ejercicios.length > 0)).toBe(true);

        for (const group of library.gruposMusculares) {
          for (const exercise of group.ejercicios) {
            expect(exercise).not.toHaveProperty('seriesPorEdad');
            expect(exercise).not.toHaveProperty('repsPorEdad');
            expect(exercise).not.toHaveProperty('durationSeconds');
          }

          if (MUSCLE_GROUPS.includes(group.id)) {
            expect(group.ejercicios.every((exercise) => exercise.fase === 'entrenamiento')).toBe(
              true
            );
          }
        }

        expect(
          library.gruposMusculares
            .find((group) => group.id === 'calentamiento')
            ?.ejercicios.every((exercise) => exercise.fase === 'calentamiento')
        ).toBe(true);
        expect(
          library.gruposMusculares
            .find((group) => group.id === 'enfriamiento')
            ?.ejercicios.every((exercise) => exercise.fase === 'enfriamiento')
        ).toBe(true);

        const listedIds = library.gruposMusculares.flatMap((group) =>
          group.ejercicios.map((exercise) => exercise.id)
        );

        expect([...listedIds].sort()).toEqual([...sourceIds(location, goal)].sort());
        expect(new Set(listedIds).size).toBe(listedIds.length);
      }
    }
  );

  it('conserva las series y repeticiones base del ejercicio', () => {
    const exercise = getExerciseLibrary('gym', 'fat_reduction')
      .gruposMusculares.find((group) => group.id === 'pecho')
      ?.ejercicios[0];
    const view = toLibraryExerciseView(exercise!);

    expect(view.sets).toBe(4);
    expect(view.reps).toBe('15');
    expect(view.durationSeconds).toBeNull();
  });
});