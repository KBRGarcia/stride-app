import type {
  AgeBand,
  DayOfWeek,
  GoalCatalog,
  RoutineSchedule,
  WorkoutGoal,
  WorkoutLocation,
} from '../../models/types';
import { AGE_BANDS } from '../ageBands';
import {
  buildWeeklyPlan,
  getCatalogRoutine,
  getDayExercises,
  getGoalCatalog,
  getSessionTitle,
  listAvailableSchedules,
  listCatalogDays,
} from '../routinesData';

const GOALS: WorkoutGoal[] = ['toning', 'muscle_gain', 'fat_reduction'];
const WEEKDAY_NAMES: Record<DayOfWeek, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};
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

function validateRoutine(
  catalog: GoalCatalog,
  schedule: RoutineSchedule,
  expectedDays: DayOfWeek[]
): void {
  expect(Object.keys(catalog.distribucionEdades).sort()).toEqual([...AGE_BANDS].sort());
  expect(listCatalogDays(catalog, schedule).map((day) => day.dia).length).toBe(expectedDays.length);

  for (const band of AGE_BANDS) {
    const plan = buildWeeklyPlan(catalog, band, schedule);
    expect(plan?.schedule).toBe(schedule);
    expect(plan?.routineDescription.length).toBeGreaterThan(0);
    expect(plan?.weeklyRoutine.map((day) => day.day)).toEqual(expectedDays);

    for (const day of plan?.weeklyRoutine ?? []) {
      expect(day.name.startsWith(WEEKDAY_NAMES[day.day])).toBe(true);
      expect(day.muscleGroup.length).toBeGreaterThan(0);
      expect(getSessionTitle(day.name).length).toBeGreaterThan(0);

      const ids = getDayExercises(day).map((exercise) => exercise.id);
      expect(new Set(ids).size).toBe(ids.length);

      for (const exercise of getDayExercises(day)) {
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
  it('ofrece 5 días en casa y las dos opciones en el gimnasio', () => {
    for (const goal of GOALS) {
      const home = getGoalCatalog('home', goal);
      const gym = getGoalCatalog('gym', goal);

      expect(listAvailableSchedules(home)).toEqual(['5-days']);
      expect(getCatalogRoutine(home, '3-days')).toBeNull();
      expect(listAvailableSchedules(gym)).toEqual(['5-days', '3-days']);
      expect(listCatalogDays(home, '5-days')).toHaveLength(5);
      expect(listCatalogDays(gym, '5-days')).toHaveLength(5);
      expect(listCatalogDays(gym, '3-days')).toHaveLength(3);
    }
  });

  it('ordena las fases de cada sesión', () => {
    const day = buildWeeklyPlan(getGoalCatalog('home', 'toning'), '14-39', '5-days')
      ?.weeklyRoutine[0];

    expect(day).toBeDefined();
    expect(getDayExercises(day!)).toEqual([...day!.warmUp, ...day!.mainWorkout, ...day!.coolDown]);
  });

  it.each(DATASETS)('valida la rutina de 5 días de $name', ({ location, goal }) => {
    validateRoutine(getGoalCatalog(location, goal), '5-days', [1, 2, 3, 4, 5]);
  });

  it.each(GOALS)('ubica la rutina de 3 días del gimnasio en lunes, miércoles y viernes (%s)', (goal) => {
    validateRoutine(getGoalCatalog('gym', goal), '3-days', [1, 3, 5]);
  });

  it('no arma una rutina de 3 días para casa', () => {
    expect(buildWeeklyPlan(getGoalCatalog('home', 'toning'), '14-39', '3-days')).toBeNull();
  });

  it('aplica la carga de cada franja sin cambiar el ejercicio', () => {
    const catalog = getGoalCatalog('gym', 'toning');
    const loads = AGE_BANDS.map((band) => {
      const exercise = buildWeeklyPlan(catalog, band, '5-days')?.weeklyRoutine[0]?.mainWorkout[0];
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
