import type { AgeBand, GoalCatalog, WorkoutGoal, WorkoutLocation } from '../../models/types';
import { AGE_BANDS } from '../ageBands';
import { buildWeeklyPlan, getDayExercises, getGoalCatalog, listCatalogDays } from '../routinesData';

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

function validateCatalog(catalog: GoalCatalog): void {
  expect(Object.keys(catalog.distribucionEdades).sort()).toEqual([...AGE_BANDS].sort());

  const days = listCatalogDays(catalog);
  expect(days.map((entry) => entry.day.dia).sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);

  const exerciseIds = new Set<string>();

  for (const band of AGE_BANDS) {
    const plan = buildWeeklyPlan(catalog, band);

    for (const day of plan.weeklyRoutine) {
      expect(day.muscleGroup.length).toBeGreaterThan(0);
      expect(day.muscles.length).toBeGreaterThan(0);

      for (const exercise of getDayExercises(day)) {
        if (band === '14-39') {
          expect(exerciseIds.has(exercise.id)).toBe(false);
          exerciseIds.add(exercise.id);
        }

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
  it.each(LOCATIONS)('cubre los siete días en %s para cada objetivo', (location) => {
    for (const goal of GOALS) {
      const days = listCatalogDays(getGoalCatalog(location, goal));

      expect(days.map((entry) => entry.day.dia).sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(days.some((entry) => entry.bodySplit === 'upper-anterior')).toBe(true);
      expect(days.some((entry) => entry.bodySplit === 'upper-posterior')).toBe(true);
      expect(days.some((entry) => entry.bodySplit === 'lower')).toBe(true);
    }
  });

  it('ordena las fases de cada sesión', () => {
    const day = buildWeeklyPlan(getGoalCatalog('home', 'toning'), '14-39').weeklyRoutine[0];

    expect(getDayExercises(day)).toEqual([...day.warmUp, ...day.mainWorkout, ...day.coolDown]);
  });

  it.each(DATASETS)('valida profundamente el JSON de $name', ({ location, goal }) => {
    validateCatalog(getGoalCatalog(location, goal));
  });

  it('aplica la carga de cada franja sin cambiar el ejercicio', () => {
    const catalog = getGoalCatalog('gym', 'toning');
    const loads = AGE_BANDS.map((band) => {
      const exercise = buildWeeklyPlan(catalog, band).weeklyRoutine[0]?.mainWorkout[0];
      return [band, exercise?.id, exercise?.sets, exercise?.reps] as const;
    });

    expect(loads.map((entry) => entry[1])).toEqual([loads[0]?.[1], loads[0]?.[1], loads[0]?.[1]]);
    expect(loads).toEqual([
      ['14-39', loads[0]?.[1], 4, '15'],
      ['40-59', loads[0]?.[1], 3, '12'],
      ['60+', loads[0]?.[1], 2, '8'],
    ] satisfies Array<readonly [AgeBand, string | undefined, number | null | undefined, string | null | undefined]>);
  });
});
