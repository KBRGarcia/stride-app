import gymFatReduction from '../data/gym/fat_reduction.json';
import gymMuscleGain from '../data/gym/muscle_gain.json';
import gymToning from '../data/gym/toning.json';
import homeFatReduction from '../data/home/fat_reduction.json';
import homeMuscleGain from '../data/home/muscle_gain.json';
import homeToning from '../data/home/toning.json';
import type {
  AgeBand,
  CatalogDay,
  CatalogExercise,
  CatalogRoutine,
  DayOfWeek,
  DayRoutine,
  Exercise,
  GoalCatalog,
  RoutineSchedule,
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

const WEEKDAY_BY_NAME: ReadonlyArray<readonly [string, DayOfWeek]> = [
  ['lunes', 1],
  ['martes', 2],
  ['miércoles', 3],
  ['miercoles', 3],
  ['jueves', 4],
  ['viernes', 5],
  ['sábado', 6],
  ['sabado', 6],
  ['domingo', 7],
];

/** La opción de 3 días cae en lunes, miércoles y viernes, en ese orden. */
const THREE_DAY_WEEKDAYS: readonly DayOfWeek[] = [1, 3, 5];

export function getGoalCatalog(location: WorkoutLocation, goal: WorkoutGoal): GoalCatalog {
  return location === 'gym' ? GYM_CATALOGS[goal] : HOME_CATALOGS[goal];
}

export function getCatalogRoutine(
  catalog: GoalCatalog,
  schedule: RoutineSchedule
): CatalogRoutine | null {
  if (schedule === '3-days') {
    return catalog.rutina3Dias ?? null;
  }

  return catalog.rutina5Dias;
}

export function listAvailableSchedules(catalog: GoalCatalog): RoutineSchedule[] {
  return catalog.rutina3Dias ? ['5-days', '3-days'] : ['5-days'];
}

function weekdayFromName(name: string): DayOfWeek | null {
  const prefix = name.split('-')[0]?.trim().toLowerCase() ?? '';
  const match = WEEKDAY_BY_NAME.find(([label]) => prefix === label);
  return match?.[1] ?? null;
}

function resolveCalendarDay(
  day: CatalogDay,
  schedule: RoutineSchedule,
  index: number
): DayOfWeek {
  const fromName = weekdayFromName(day.nombre);
  if (fromName) {
    return fromName;
  }

  if (schedule === '3-days') {
    return THREE_DAY_WEEKDAYS[index] ?? 1;
  }

  return (day.dia >= 1 && day.dia <= 7 ? day.dia : 1) as DayOfWeek;
}

/** Días de la opción pedida, ordenados de lunes a domingo. */
export function listCatalogDays(catalog: GoalCatalog, schedule: RoutineSchedule): CatalogDay[] {
  const routine = getCatalogRoutine(catalog, schedule);
  if (!routine) {
    return [];
  }

  return routine.dias
    .map((day, index) => ({ day, weekday: resolveCalendarDay(day, schedule, index) }))
    .sort((left, right) => left.weekday - right.weekday)
    .map((entry) => entry.day);
}

/** Parte útil del título, sin el día de la semana. */
export function getSessionTitle(name: string): string {
  const separator = ' - ';
  const index = name.indexOf(separator);
  const title = index >= 0 ? name.slice(index + separator.length) : name;
  return title.trim();
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

function resolveDay(
  day: CatalogDay,
  ageBand: AgeBand,
  schedule: RoutineSchedule,
  index: number
): DayRoutine {
  return {
    day: resolveCalendarDay(day, schedule, index),
    name: day.nombre,
    muscleGroup: day.grupoMuscular,
    warmUp: day.calentamiento.map((exercise) => resolveExercise(exercise, ageBand)),
    mainWorkout: day.ejercicios.map((exercise) => resolveExercise(exercise, ageBand)),
    coolDown: day.enfriamiento.map((exercise) => resolveExercise(exercise, ageBand)),
  };
}

/** Misma secuencia de ejercicios para cualquier edad; la franja solo ajusta la carga. */
export function buildWeeklyPlan(
  catalog: GoalCatalog,
  ageBand: AgeBand,
  schedule: RoutineSchedule
): WeeklyPlan | null {
  const routine = getCatalogRoutine(catalog, schedule);
  if (!routine || routine.dias.length === 0) {
    return null;
  }

  const prescription = catalog.distribucionEdades[ageBand];
  const weeklyRoutine = routine.dias
    .map((day, index) => resolveDay(day, ageBand, schedule, index))
    .sort((left, right) => left.day - right.day);

  return {
    ageBand,
    sets: prescription.series,
    reps: prescription.repeticiones,
    note: catalog.nota,
    schedule,
    routineDescription: routine.descripcion,
    weeklyRoutine,
  };
}

/** Mantiene el orden natural de una sesión: calentamiento, trabajo principal y enfriamiento. */
export function getDayExercises(dayRoutine: DayRoutine): Exercise[] {
  return [...dayRoutine.warmUp, ...dayRoutine.mainWorkout, ...dayRoutine.coolDown];
}
