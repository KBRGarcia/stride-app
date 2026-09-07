import { getArchetype } from '../archetypes';

describe('getArchetype', () => {
  it.each([
    [14, 40, 'A'],
    [40, 70, 'A'],
    [14, 70.1, 'B'],
    [40, 150, 'B'],
    [41, 40, 'C'],
    [65, 70, 'C'],
    [41, 71, 'D'],
    [65, 200, 'D'],
    [66, 40, 'E'],
    [75, 200, 'E'],
    [76, 40, 'F'],
    [121, 200, 'F'],
  ] as const)('resuelve edad %i y peso %f como %s', (age, weight, expected) => {
    expect(getArchetype(age, weight)).toBe(expected);
  });

  it.each([
    [13, 70],
    [40, 39.9],
    [Number.NaN, 70],
    [40, Number.POSITIVE_INFINITY],
  ])('rechaza edad %s y peso %s fuera del dominio', (age, weight) => {
    expect(getArchetype(age, weight)).toBeNull();
  });
});
