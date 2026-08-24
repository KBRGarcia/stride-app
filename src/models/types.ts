import type { AgeRangeId, WeightRangeId } from '../utils/profileRanges';

/** Género soportado por el matcher y el JSON de rutinas. */
export type Gender = 'male' | 'female';

/** Entorno de entrenamiento elegido por el usuario. */
export type WorkoutLocation = 'home' | 'gym';

/** Día de la semana (1 = Lunes … 7 = Domingo). */
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Ejercicio individual dentro de un día de entrenamiento.
 * `reps` y `durationSeconds` son excluyentes en la práctica:
 * ejercicios por repeticiones usan `reps`; holds/tiempos usan `durationSeconds`.
 */
export interface Exercise {
  id: string;
  name: string;
  description: string;
  imagePlaceholder: string;
  sets: number;
  reps: string | null;
  durationSeconds: number | null;
}

/** Rutina de un día concreto de la semana. */
export interface DayRoutine {
  day: DayOfWeek;
  exercises: Exercise[];
}

/**
 * Recomendación semanal filtrable por perfil demográfico.
 * Cada entrada del array raíz en `routines.json` sigue esta forma.
 */
export interface Recommendation {
  id: string;
  gender: Gender;
  ageMin: number;
  ageMax: number;
  weightMin: number;
  weightMax: number;
  /** Rango canónico de edad. Si falta, se infiere de `ageMin`/`ageMax`. */
  ageRange?: AgeRangeId;
  /** Rango canónico de peso. Si falta, se infiere de `weightMin`/`weightMax`. */
  weightRange?: WeightRangeId;
  weeklyRoutine: DayRoutine[];
}

/** Contenido de `src/data/routines-home.json` o `src/data/routines-gym.json`. */
export type RoutinesData = Recommendation[];

/**
 * Perfil del usuario persistido en AsyncStorage (no proviene del JSON).
 * La edad se calcula en runtime a partir de `birthDate`.
 */
export interface UserProfile {
  birthDate: string;
  weight: number;
  gender: Gender;
  workoutLocation: WorkoutLocation;
}
