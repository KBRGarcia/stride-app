import {
  getDayScheduleStatus,
  getDayStatusLabel,
  isDayWorkoutAccessible,
} from '../weekSchedule';

const monday = new Date(2026, 8, 7);

describe('isDayWorkoutAccessible', () => {
  it('permite entrenar el día actual aunque ya esté completado', () => {
    expect(isDayWorkoutAccessible(1, true, monday)).toBe(true);
  });

  it('no permite iniciar el entrenamiento de otro día', () => {
    expect(isDayWorkoutAccessible(2, false, monday)).toBe(false);
    expect(isDayWorkoutAccessible(7, false, monday)).toBe(false);
  });
});

describe('getDayScheduleStatus', () => {
  it('marca como completado si ya se entrenó esta semana', () => {
    expect(getDayScheduleStatus(1, true, monday)).toBe('completed');
  });

  it('distingue hoy, próximos y caducados', () => {
    expect(getDayScheduleStatus(1, false, monday)).toBe('today');
    expect(getDayScheduleStatus(3, false, monday)).toBe('upcoming');
  });
});

describe('getDayStatusLabel', () => {
  it('indica que un día no actual se puede consultar', () => {
    expect(getDayStatusLabel('upcoming')).toBe('Ver rutina');
    expect(getDayStatusLabel('expired')).toBe('Ver rutina');
  });

  it('indica que el día completado de hoy se puede repetir', () => {
    expect(getDayStatusLabel('completed', { canRepeat: true })).toBe(
      'Completado · Toca para repetir'
    );
  });
});
