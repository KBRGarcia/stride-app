import type { Exercise } from '../models/types';

const BODY_ZONE_LABELS: Record<Exercise['bodyZone'], string> = {
  upper: 'Tren superior',
  lower: 'Tren inferior',
  full: 'Cuerpo completo',
};

const MUSCLE_GROUP_RULES: Array<{ group: string; keywords: string[] }> = [
  { group: 'Pecho', keywords: ['pecho', 'press banca', 'press de banca'] },
  { group: 'Espalda', keywords: ['remo', 'jalón', 'jalon', 'dominada', 'espalda'] },
  { group: 'Hombros', keywords: ['hombro', 'militar', 'laterales', 'rotación de brazos'] },
  { group: 'Bíceps', keywords: ['bícep', 'bicep', 'curl'] },
  { group: 'Tríceps', keywords: ['trícep', 'tricep', 'fondos'] },
  { group: 'Glúteos', keywords: ['glúteo', 'gluteo', 'puente', 'hip thrust'] },
  {
    group: 'Piernas',
    keywords: [
      'sentadilla',
      'zancada',
      'prensa',
      'peso muerto',
      'talón',
      'talon',
      'gemelo',
      'femoral',
      'cadera',
      'paseo lateral',
    ],
  },
  {
    group: 'Core',
    keywords: [
      'plancha',
      'abdominal',
      'bird-dog',
      'bird dog',
      'dead bug',
      'crunch',
      'core',
    ],
  },
  {
    group: 'Cardio',
    keywords: [
      'marcha',
      'jumping',
      'mountain',
      'burpee',
      'correr',
      'trote',
      'cardio',
      'bicicleta',
      'cuerda',
    ],
  },
];

export function inferMuscleGroup(exerciseName: string): string | null {
  const normalized = exerciseName.toLowerCase();
  const match = MUSCLE_GROUP_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword))
  );

  return match?.group ?? null;
}

export function getExerciseMuscleGroup(exercise: Exercise): string {
  return inferMuscleGroup(exercise.name) ?? BODY_ZONE_LABELS[exercise.bodyZone];
}

export function getDayMuscleGroups(exercises: Exercise[]): string[] {
  return [...new Set(exercises.map((exercise) => getExerciseMuscleGroup(exercise)))];
}

export function formatMuscleGroups(exercises: Exercise[]): string {
  const groups = getDayMuscleGroups(exercises);
  return groups.length > 0 ? groups.join(' · ') : 'Rutina del día';
}
