import type { WorkoutGoal } from '../../models/types';
import { getCardioNutritionGuide, getNutritionGuide, NUTRITION_GOAL_TITLES } from '../nutritionData';

const GOALS: WorkoutGoal[] = ['toning', 'muscle_gain', 'fat_reduction'];

describe('nutritionData', () => {
  it.each(GOALS)('devuelve una guía completa para %s', (goal) => {
    const guide = getNutritionGuide(goal);

    expect(guide.descripcion.length).toBeGreaterThan(0);
    expect(guide.alimentosRecomendados.length).toBeGreaterThan(0);
    expect(guide.alimentosAEliminarOLimitar.length).toBeGreaterThan(0);
    expect(guide.caloriasYMacros.calorias.length).toBeGreaterThan(0);
    expect(guide.hidratacion.agua.length).toBeGreaterThan(0);
    expect(guide.suplementosYEstimulantes.recomendados.length).toBeGreaterThan(0);
    expect(guide.ejemploMenuDiario.desayuno.length).toBeGreaterThan(0);
  });

  it('asocia cada objetivo con su guía, independiente del entorno de entrenamiento', () => {
    expect(getNutritionGuide('toning').objetivo).toBe('tonificacion');
    expect(getNutritionGuide('muscle_gain').objetivo).toBe('aumentoMasaMuscular');
    expect(getNutritionGuide('fat_reduction').objetivo).toBe('reduccionDeGrasa');
    expect(getNutritionGuide('toning')).not.toBe(getNutritionGuide('muscle_gain'));
    expect(getNutritionGuide('toning')).not.toBe(getNutritionGuide('fat_reduction'));
  });

  it('asocia el cardio con la guía de reducción de grasa', () => {
    expect(getCardioNutritionGuide().objetivo).toBe('reduccionDeGrasa');
  });

  it('tiene título para cada objetivo', () => {
    expect(Object.keys(NUTRITION_GOAL_TITLES)).toEqual(GOALS);
  });
});
