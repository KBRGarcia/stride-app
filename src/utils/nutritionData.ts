import nutritionFatReduction from '../data/nutrition/nutrition_fat_reduction.json';
import nutritionMuscleGain from '../data/nutrition/nutrition_muscle_gain.json';
import nutritionToning from '../data/nutrition/nutrition_toning.json';
import type { NutritionGuide, WorkoutGoal } from '../models/types';

export const NUTRITION_DISCLAIMER =
  'Nota importante: Esta guía es meramente informativa y basada en principios generales de la nutrición deportiva. No sustituye el asesoramiento de un dietista-nutricionista, médico o entrenador cualificado. Cada persona tiene necesidades individuales según su metabolismo, estado de salud, alergias, intolerancias y medicación. Siempre consulta con un profesional antes de realizar cambios drásticos en tu alimentación.';

export const NUTRITION_GOAL_TITLES: Record<WorkoutGoal, string> = {
  toning: 'Tonificación',
  muscle_gain: 'Aumento de masa muscular',
  fat_reduction: 'Reducción de grasa',
};

const NUTRITION_BY_GOAL: Record<WorkoutGoal, NutritionGuide> = {
  toning: nutritionToning as NutritionGuide,
  muscle_gain: nutritionMuscleGain as NutritionGuide,
  fat_reduction: nutritionFatReduction as NutritionGuide,
};

export function getNutritionGuide(goal: WorkoutGoal): NutritionGuide {
  return NUTRITION_BY_GOAL[goal];
}

/** El cardio se asocia siempre con la guía de reducción de grasa. */
export function getCardioNutritionGuide(): NutritionGuide {
  return getNutritionGuide('fat_reduction');
}
