import gymFatReduction from '../data/gym/fat_reduction.json';
import gymMuscleGain from '../data/gym/muscle_gain.json';
import gymToning from '../data/gym/toning.json';
import homeFatReduction from '../data/home/fat_reduction.json';
import homeMuscleGain from '../data/home/muscle_gain.json';
import homeToning from '../data/home/toning.json';
import type {
  AgeBand,
  BodySplit,
  CatalogDay,
  CatalogExercise,
  DayRoutine,
  Exercise,
  GoalCatalog,
  WeeklyPlan,
  WorkoutGoal,
  WorkoutLocation,
} from '../models/types';

const HOME_CATALOGS: Record<WorkoutGoal, GoalCatalog> = {
  toning: homeToning as GoalCatalog,
  muscle_gain: homeMuscleGain as GoalCatalog,
  fat_reduction: homeFatReduction as GoalCatalog,
};

const GYM_CATALOGS: Record<WorkoutGoal, GoalCatalog> = {
  toning: gymToning as GoalCatalog,
  muscle_gain: gymMuscleGain as GoalCatalog,
  fat_reduction: gymFatReduction as GoalCatalog,
};

export function getGoalCatalog(location: WorkoutLocation, goal: WorkoutGoal): GoalCatalog {
  return location === 'gym' ? GYM_CATALOGS[goal] : HOME_CATALOGS[goal];
}

interface TaggedCatalogDay {
  day: CatalogDay;
  bodySplit: BodySplit;
}

/** Ordena la semana: tren superior al frente, tren superior atrás y tren inferior. */
export function listCatalogDays(catalog: GoalCatalog): TaggedCatalogDay[] {
  const { trenSuperior, trenInferior } = catalog.rutinaSemanal;

  return [
    ...trenSuperior.alFrente.map((day) => ({ day, bodySplit: 'upper-front' as const })),
    ...trenSuperior.atras.map((day) => ({ day, bodySplit: 'upper-back' as const })),
    ...trenInferior.map((day) => ({ day, bodySplit: 'lower' as const })),
  ].sort((left, right) => left.day.dia - right.day.dia);
}

function asReps(value: string | number | null | undefined): string | null {
  if (value == null) {
    return null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function resolveExercise(exercise: CatalogExercise, ageBand: AgeBand): Exercise {
  const isTimed = typeof exercise.durationSeconds === 'number' && exercise.durationSeconds > 0;

  return {
    id: exercise.id,
    name: exercise.nombre,
    description: exercise.descripcion,
    imagePlaceholder: exercise.imagePlaceholder,
    bodyZone: exercise.bodyZone,
    sets: exercise.seriesPorEdad?.[ageBand] ?? exercise.series ?? null,
    reps: isTimed ? null : asReps(exercise.repsPorEdad?.[ageBand] ?? exercise.reps),
    durationSeconds: isTimed ? exercise.durationSeconds : null,
    muscleGroup: exercise.grupoMuscular ?? null,
    muscle: exercise.musculo ?? null,
    tool: exercise.herramienta ?? null,
  };
}

function resolveDay(entry: TaggedCatalogDay, ageBand: AgeBand): DayRoutine {
  return {
    day: entry.day.dia,
    muscleGroup: entry.day.grupoMuscular,
    muscles: entry.day.musculos,
    bodySplit: entry.bodySplit,
    warmUp: entry.day.calentamiento.map((exercise) => resolveExercise(exercise, ageBand)),
    mainWorkout: entry.day.ejercicios.map((exercise) => resolveExercise(exercise, ageBand)),
    coolDown: entry.day.enfriamiento.map((exercise) => resolveExercise(exercise, ageBand)),
  };
}

/** Misma secuencia de ejercicios para cualquier edad; la franja solo ajusta la carga. */
export function buildWeeklyPlan(catalog: GoalCatalog, ageBand: AgeBand): WeeklyPlan {
  const prescription = catalog.distribucionEdades[ageBand];

  return {
    ageBand,
    sets: prescription.series,
    reps: prescription.repeticiones,
    note: catalog.nota,
    weeklyRoutine: listCatalogDays(catalog).map((entry) => resolveDay(entry, ageBand)),
  };
}

/** Mantiene el orden natural de una sesión: calentamiento, trabajo principal y enfriamiento. */
export function getDayExercises(dayRoutine: DayRoutine): Exercise[] {
  return [...dayRoutine.warmUp, ...dayRoutine.mainWorkout, ...dayRoutine.coolDown];
}
