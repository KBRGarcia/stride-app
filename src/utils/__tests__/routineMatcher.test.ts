import type { Archetype, UserProfile } from '../../models/types';
import { calculateAge, findMatchingRecommendation } from '../routineMatcher';
import { getRoutines } from '../routinesData';

const REFERENCE_DATE = new Date(2026, 7, 31);
const ROUTINES = getRoutines('home', 'toning');

function createProfile(birthDate: string, weight: number): UserProfile {
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

describe('findMatchingRecommendation', () => {
  it.each([
    ['1986-08-31', 70, 'A'],
    ['1986-08-31', 70.1, 'B'],
    ['1985-08-31', 70, 'C'],
    ['1985-08-31', 71, 'D'],
    ['1960-08-31', 150, 'E'],
    ['1950-08-31', 200, 'F'],
  ] as const)(
    'selecciona el arquetipo %s para nacimiento %s y peso %s',
    (birthDate, weight, expectedArchetype) => {
      const recommendation = findMatchingRecommendation(
        createProfile(birthDate, weight),
        ROUTINES,
        REFERENCE_DATE
      );

      expect(recommendation?.archetype).toBe<Archetype>(expectedArchetype);
    }
  );

  it('rechaza perfiles fuera del dominio soportado', () => {
    expect(
      findMatchingRecommendation(
        createProfile('2013-08-31', 70),
        ROUTINES,
        REFERENCE_DATE
      )
    ).toBeNull();
    expect(
      findMatchingRecommendation(
        createProfile('1986-08-31', 39.9),
        ROUTINES,
        REFERENCE_DATE
      )
    ).toBeNull();
  });

  it('no sustituye silenciosamente un arquetipo ausente', () => {
    const withoutArchetypeF = ROUTINES.filter((routine) => routine.archetype !== 'F');

    expect(
      findMatchingRecommendation(
        createProfile('1950-08-31', 70),
        withoutArchetypeF,
        REFERENCE_DATE
      )
    ).toBeNull();
  });
});
