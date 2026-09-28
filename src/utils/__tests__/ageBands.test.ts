import { getAgeBand } from '../ageBands';

describe('getAgeBand', () => {
  it.each([
    [14, '14-39'],
    [39, '14-39'],
    [40, '40-59'],
    [59, '40-59'],
    [60, '60+'],
    [90, '60+'],
  ] as const)('clasifica la edad %i en %s', (age, expected) => {
    expect(getAgeBand(age)).toBe(expected);
  });

  it.each([13, 0, Number.NaN, Number.POSITIVE_INFINITY])(
    'rechaza la edad %s',
    (age) => {
      expect(getAgeBand(age)).toBeNull();
    }
  );
});
