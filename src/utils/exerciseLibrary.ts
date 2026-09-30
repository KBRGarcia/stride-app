import gymFatReductionList from '../data/gym-list/fat_reduction_list.json';
import gymMuscleGainList from '../data/gym-list/muscle_gain_list.json';
import gymToningList from '../data/gym-list/toning_list.json';
import homeFatReductionList from '../data/home-list/fat_reduction_list.json';
import homeMuscleGainList from '../data/home-list/muscle_gain_list.json';
import homeToningList from '../data/home-list/toning_list.json';
import type {
  Exercise,
  ExerciseLibrary,
  ExerciseLibraryGroupId,
  LibraryExercise,
  WorkoutGoal,
  WorkoutLocation,
} from '../models/types';

export const EXERCISE_LIBRARY_GROUP_ORDER: readonly ExerciseLibraryGroupId[] = [
  'pecho',
  'espalda',
  'hombros',
  'brazos',
  'abdomen',
  'piernas',
  'calentamiento',
  'enfriamiento',
];

const GYM_LIBRARIES: Record<WorkoutGoal, ExerciseLibrary> = {
  toning: gymToningList as ExerciseLibrary,
  muscle_gain: gymMuscleGainList as ExerciseLibrary,
  fat_reduction: gymFatReductionList as ExerciseLibrary,
};

const HOME_LIBRARIES: Record<WorkoutGoal, ExerciseLibrary> = {
  toning: homeToningList as ExerciseLibrary,
  muscle_gain: homeMuscleGainList as ExerciseLibrary,
  fat_reduction: homeFatReductionList as ExerciseLibrary,
};

export function getExerciseLibrary(
  location: WorkoutLocation,
  goal: WorkoutGoal
): ExerciseLibrary {
  return location === 'gym' ? GYM_LIBRARIES[goal] : HOME_LIBRARIES[goal];
}

function asReps(value: string | number | null | undefined): string | null {
  if (value == null) {
    return null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

/** Convierte un ejercicio de la biblioteca a la vista de la app, sin duración ni carga por edad. */
export function toLibraryExerciseView(exercise: LibraryExercise): Exercise {
  return {
    id: exercise.id,
    name: exercise.nombre,
    description: exercise.descripcion,
    imagePlaceholder: exercise.imagePlaceholder,
    bodyZone: exercise.bodyZone,
    sets: exercise.series ?? null,
    reps: asReps(exercise.reps),
    durationSeconds: null,
    muscleGroup: exercise.grupoMuscular ?? null,
    muscle: exercise.musculo ?? null,
    tool: exercise.herramienta ?? null,
  };
}
