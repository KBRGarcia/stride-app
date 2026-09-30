import type { MetabolismType, WorkoutGoal } from '../../models/types';
import {
  getCardioNutritionGuide,
  getNutritionGuide,
  METABOLISM_TYPES,
  NUTRITION_GOAL_TITLES,
  resolveMetabolism,
} from '../nutritionData';

const GOALS: WorkoutGoal[] = ['toning', 'muscle_gain', 'fat_reduction'];

describe('nutritionData', () => {
  it.each(GOALS)('devuelve una guía completa para %s', (goal) => {
    for (const metabolism of METABOLISM_TYPES) {
      const guide = getNutritionGuide(goal, metabolism);

      expect(guide.descripcion.length).toBeGreaterThan(0);
      expect(guide.nombre.length).toBeGreaterThan(0);
      expect(guide.caracteristicas.length).toBeGreaterThan(0);
      expect(guide.alimentosRecomendados.length).toBeGreaterThan(0);
      expect(guide.alimentosAEliminarOLimitar.length).toBeGreaterThan(0);
      expect(guide.caloriasYMacros.calorias.length).toBeGreaterThan(0);
      expect(guide.hidratacion.agua.length).toBeGreaterThan(0);
      expect(guide.suplementosYEstimulantes.recomendados.length).toBeGreaterThan(0);
      expect(guide.ejemploMenuDiario.desayuno.length).toBeGreaterThan(0);
    }
  });

  it('cambia calorías y menú según el metabolismo', () => {
    const guides = METABOLISM_TYPES.map((metabolism) => getNutritionGuide('toning', metabolism));
    const calories = new Set(guides.map((guide) => guide.caloriasYMacros.calorias));
    const breakfasts = new Set(guides.map((guide) => guide.ejemploMenuDiario.desayuno));

    expect(calories.size).toBe(METABOLISM_TYPES.length);
    expect(breakfasts.size).toBe(METABOLISM_TYPES.length);
  });

  it('asocia cada objetivo con su guía, independiente del entorno de entrenamiento', () => {
    expect(getNutritionGuide('toning', 'normal').objetivo).toBe('tonificacion');
    expect(getNutritionGuide('muscle_gain', 'normal').objetivo).toBe('aumentoMasaMuscular');
    expect(getNutritionGuide('fat_reduction', 'normal').objetivo).toBe('reduccionDeGrasa');
    expect(getNutritionGuide('toning', 'normal').caloriasYMacros).not.toEqual(
      getNutritionGuide('muscle_gain', 'normal').caloriasYMacros
    );
  });

  it('asocia el cardio con la guía de reducción de grasa del metabolismo elegido', () => {
    expect(getCardioNutritionGuide().objetivo).toBe('reduccionDeGrasa');
    expect(getCardioNutritionGuide('fast')).toEqual(getNutritionGuide('fat_reduction', 'fast'));
    expect(getCardioNutritionGuide('slow').caloriasYMacros).not.toEqual(
      getCardioNutritionGuide('normal').caloriasYMacros
    );
  });

  it('tiene título para cada objetivo', () => {
    expect(Object.keys(NUTRITION_GOAL_TITLES)).toEqual(GOALS);
  });

  it.each([
    ['slow', 'slow'],
    ['fast', 'fast'],
    ['normal', 'normal'],
    [undefined, 'normal'],
    ['otro', 'normal'],
  ] as const)('resuelve el metabolismo %s como %s', (value, expected: MetabolismType) => {
    expect(resolveMetabolism(value)).toBe(expected);
  });
});
