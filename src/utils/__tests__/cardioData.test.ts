import { getCardioNutritionGuide } from '../nutritionData';
import {
  countCardioDayItems,
  formatCardioMainWorkout,
  getCardioActivities,
  getCardioActivity,
  getCardioDayPhases,
  getCardioDayPresentation,
  getCardioSessionDay,
  getCardioWeekDays,
} from '../cardioData';

describe('cardioData', () => {
  it('expone las tres actividades para cualquier perfil', () => {
    const activities = getCardioActivities();

    expect(activities.map((activity) => activity.id)).toEqual([
      'jog',
      'cycling',
      'rope-jump',
    ]);
    expect(activities.every((activity) => activity.descripcion.length > 0)).toBe(true);
    expect(activities.every((activity) => getCardioWeekDays(activity).length === 5)).toBe(
      true
    );
  });

  it('devuelve cada actividad por id', () => {
    expect(getCardioActivity('jog')?.objetivo).toBe('trotar_10km');
    expect(getCardioActivity('cycling')?.objetivo).toBe('ciclismo_15km');
    expect(getCardioActivity('rope-jump')?.objetivo).toBe('saltarCuerda_10min');
  });

  it('presenta cada día como en el plan de entrenamiento', () => {
    const monday = getCardioWeekDays(getCardioActivity('jog')!)[0];
    const presentation = getCardioDayPresentation(monday);

    expect(presentation).toEqual({
      weekdayShort: 'Lun',
      weekdayFull: 'Lunes',
      focus: 'Iniciación (Caminata + Trote)',
      dayOfWeek: 1,
    });
    expect(countCardioDayItems(monday)).toBeGreaterThan(0);
    expect(getCardioDayPhases(monday).map((phase) => phase.title)).toEqual([
      'Calentamiento',
      'Entrenamiento',
      'Enfriamiento',
    ]);
    expect(getCardioSessionDay(getCardioActivity('jog')!, 4)?.nombre).toContain('Domingo');
    expect(getCardioSessionDay(getCardioActivity('jog')!, 5)).toBeNull();
  });

  it('formatea bloques heterogéneos del entrenamiento principal', () => {
    const fields = formatCardioMainWorkout({
      intervalos: ['Trote suave (2 min)', 'Caminata (1 min)'],
      distanciaEstimada: '4 – 5 km',
    });

    expect(fields).toEqual([
      {
        label: 'Intervalos',
        values: ['Trote suave (2 min)', 'Caminata (1 min)'],
      },
      {
        label: 'Distancia estimada',
        values: ['4 – 5 km'],
      },
    ]);
  });
});

describe('nutrición asociada al cardio', () => {
  it('usa siempre la guía de reducción de grasa', () => {
    const guide = getCardioNutritionGuide();

    expect(guide.objetivo).toBe('reduccionDeGrasa');
    expect(guide).toEqual(getCardioNutritionGuide());
  });
});
