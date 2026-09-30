import nutritionFatReduction from '../data/nutrition/nutrition_fat_reduction.json';
import nutritionMuscleGain from '../data/nutrition/nutrition_muscle_gain.json';
import nutritionToning from '../data/nutrition/nutrition_toning.json';
import type {
  MetabolismType,
  NutritionCatalog,
  NutritionGuide,
  WorkoutGoal,
} from '../models/types';

export const NUTRITION_DISCLAIMER =
  'Nota importante: Esta guía es meramente informativa y basada en principios generales de la nutrición deportiva. No sustituye el asesoramiento de un dietista-nutricionista, médico o entrenador cualificado. Cada persona tiene necesidades individuales según su metabolismo, estado de salud, alergias, intolerancias y medicación. Siempre consulta con un profesional antes de realizar cambios drásticos en tu alimentación.';

export const NUTRITION_GOAL_TITLES: Record<WorkoutGoal, string> = {
  toning: 'Tonificación',
  muscle_gain: 'Aumento de masa muscular',
  fat_reduction: 'Reducción de grasa',
};

const NUTRITION_BY_GOAL: Record<WorkoutGoal, NutritionCatalog> = {
  toning: nutritionToning as NutritionCatalog,
  muscle_gain: nutritionMuscleGain as NutritionCatalog,
  fat_reduction: nutritionFatReduction as NutritionCatalog,
};

const METABOLISM_JSON_KEY = {
  fast: 'metabolismoRapido',
  slow: 'metabolismoLento',
  normal: 'metabolismoNormal',
} as const satisfies Record<MetabolismType, keyof NutritionCatalog['metabolismos']>;

export const METABOLISM_LABELS: Record<MetabolismType, string> = {
  slow: 'Lento',
  fast: 'Rápido',
  normal: 'Normal',
};

export const METABOLISM_TYPES: readonly MetabolismType[] = ['slow', 'fast', 'normal'];

/** Un valor ausente o inválido queda en metabolismo normal. */
export function resolveMetabolism(value: unknown): MetabolismType {
  if (value === 'slow' || value === 'fast' || value === 'normal') {
    return value;
  }

  return 'normal';
}

export function getNutritionGuide(goal: WorkoutGoal, metabolism: MetabolismType): NutritionGuide {
  const catalog = NUTRITION_BY_GOAL[goal];
  const detail = catalog.metabolismos[METABOLISM_JSON_KEY[metabolism]];

  return {
    objetivo: catalog.objetivo,
    descripcion: catalog.descripcion,
    nota: catalog.nota,
    ...detail,
  };
}

/** El cardio se asocia siempre con la guía de reducción de grasa del metabolismo elegido. */
export function getCardioNutritionGuide(metabolism: MetabolismType = 'normal'): NutritionGuide {
  return getNutritionGuide('fat_reduction', metabolism);
}
