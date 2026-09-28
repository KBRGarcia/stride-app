import type { AgeBand, UserProfile } from '../../models/types';
import { calculateAge, resolveWeeklyPlan } from '../routineMatcher';

const REFERENCE_DATE = new Date(2026, 7, 31);

function createProfile(birthDate: string, weight = 70): UserProfile {
  return {
    birthDate,
    weight,
    workoutLocation: 'home',
    goal: 'toning',
  };
}

describe('calculateAge', () => {
  it('calcula años completos alrededor del cumpleaños', () => {
    expect(calculateAge('1986-08-31', REFERENCE_DATE)).toBe(40);
    expect(calculateAge('1986-09-01', REFERENCE_DATE)).toBe(39);
  });

  it.each(['31-08-1986', '2024-02-30', 'texto'])(
    'rechaza la fecha inválida %s',
    (birthDate) => {
      expect(() => calculateAge(birthDate, REFERENCE_DATE)).toThrow();
    }
  );
});

describe('resolveWeeklyPlan', () => {
  it.each([
    ['2012-08-31', '14-39', 4, '15'],
    ['1987-08-31', '14-39', 4, '15'],
    ['1986-08-31', '40-59', 3, '12'],
    ['1967-08-31', '40-59', 3, '12'],
    ['1966-08-31', '60+', 2, '8'],
    ['1950-08-31', '60+', 2, '8'],
  ] as const)(
    'ajusta la carga de %s a la franja %s',
    (birthDate, ageBand, sets, reps) => {
      const plan = resolveWeeklyPlan(createProfile(birthDate), REFERENCE_DATE);
      const mainExercise = plan?.weeklyRoutine.find((day) => day.day === 1)?.mainWorkout[0];

      expect(plan?.ageBand).toBe<AgeBand>(ageBand);
      expect(plan?.sets).toBe(sets);
      expect(plan?.reps).toBe(Number(reps));
      expect(mainExercise?.sets).toBe(sets);
      expect(mainExercise?.reps).toBe(reps);
    }
  );

  it('mantiene los mismos ejercicios al cambiar de franja', () => {
    const young = resolveWeeklyPlan(createProfile('2000-01-01'), REFERENCE_DATE);
    const senior = resolveWeeklyPlan(createProfile('1950-01-01'), REFERENCE_DATE);

    const youngIds = young?.weeklyRoutine.flatMap((day) => [
      ...day.warmUp.map((exercise) => exercise.id),
      ...day.mainWorkout.map((exercise) => exercise.id),
      ...day.coolDown.map((exercise) => exercise.id),
    ]);
    const seniorIds = senior?.weeklyRoutine.flatMap((day) => [
      ...day.warmUp.map((exercise) => exercise.id),
      ...day.mainWorkout.map((exercise) => exercise.id),
      ...day.coolDown.map((exercise) => exercise.id),
    ]);

    expect(seniorIds).toEqual(youngIds);
    expect(young?.weeklyRoutine[0]?.mainWorkout[0]?.sets).toBe(4);
    expect(senior?.weeklyRoutine[0]?.mainWorkout[0]?.sets).toBe(2);
  });

  it('no cambia la rutina según el peso', () => {
    const light = resolveWeeklyPlan(createProfile('2000-01-01', 45), REFERENCE_DATE);
    const heavy = resolveWeeklyPlan(createProfile('2000-01-01', 120), REFERENCE_DATE);

    expect(heavy?.weeklyRoutine).toEqual(light?.weeklyRoutine);
  });

  it('rechaza edades por debajo del mínimo', () => {
    expect(resolveWeeklyPlan(createProfile('2013-08-31'), REFERENCE_DATE)).toBeNull();
  });

  it('separa los días por tren superior y tren inferior', () => {
    const plan = resolveWeeklyPlan(createProfile('2000-01-01'), REFERENCE_DATE);

    expect(plan?.weeklyRoutine.map((day) => [day.day, day.bodySplit, day.muscleGroup])).toEqual([
      [1, 'upper-front', 'Pecho'],
      [2, 'upper-back', 'Espalda'],
      [3, 'upper-front', 'Hombros'],
      [4, 'lower', 'Piernas'],
      [5, 'upper-front', 'Brazos'],
      [6, 'lower', 'Abdomen'],
      [7, 'lower', 'Recuperación Activa'],
    ]);
  });
});
