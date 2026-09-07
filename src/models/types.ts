/** Entorno de entrenamiento elegido por el usuario. */
export type WorkoutLocation = 'home' | 'gym';

/** Objetivo que determina el conjunto de rutinas disponible. */
export type WorkoutGoal = 'toning' | 'muscle_gain' | 'fat_reduction';

/** Arquetipo calculado exclusivamente a partir de edad y peso. */
export type Archetype = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

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
  bodyZone: 'upper' | 'lower' | 'full';
  sets: number | null;
  reps: string | null;
  durationSeconds: number | null;
}

/** Rutina de un día concreto de la semana. */
export interface DayRoutine {
  day: DayOfWeek;
  warmUp: Exercise[];
  mainWorkout: Exercise[];
  coolDown: Exercise[];
}

/**
 * Recomendación semanal asociada a uno de los seis arquetipos.
 */
export interface Recommendation {
  archetype: Archetype;
  ageMin: number;
  ageMax: number;
  weightMin: number;
  weightMax: number;
  weeklyRoutine: DayRoutine[];
}

/** Contenido de uno de los archivos de objetivo bajo `src/data/home` o `src/data/gym`. */
export type RoutinesData = Recommendation[];

/**
 * Perfil del usuario persistido en AsyncStorage (no proviene del JSON).
 * La edad se calcula en runtime a partir de `birthDate`.
 */
export interface UserProfile {
  birthDate: string;
  weight: number;
  workoutLocation: WorkoutLocation;
  goal: WorkoutGoal;
}
