/** Entorno de entrenamiento elegido por el usuario. */
export type WorkoutLocation = 'home' | 'gym';

/** Objetivo que determina el conjunto de rutinas disponible. */
export type WorkoutGoal = 'toning' | 'muscle_gain' | 'fat_reduction';

/**
 * Esquema semanal.
 * Casa solo ofrece 5 días. Gimnasio ofrece 5 días (opción 1) o 3 días (opción 2).
 */
export type RoutineSchedule = '5-days' | '3-days';

/** Tipo de metabolismo que elige la guía nutricional. */
export type MetabolismType = 'slow' | 'fast' | 'normal';

/** Franja de edad que solo cambia series y repeticiones, no los ejercicios. */
export type AgeBand = '14-39' | '40-59' | '60+';

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
  /** Grupo amplio (Pecho, Espalda, Piernas…). */
  muscleGroup: string | null;
  /** Músculo concreto cuando el JSON lo indica. */
  muscle: string | null;
  /** Implemento o máquina, si aplica. */
  tool: string | null;
}

/** Rutina de un día concreto de la semana. `day` es el día calendario (1 = lunes). */
export interface DayRoutine {
  day: DayOfWeek;
  /** Título del JSON, por ejemplo `Lunes - Empuje (Push)`. */
  name: string;
  muscleGroup: string;
  warmUp: Exercise[];
  mainWorkout: Exercise[];
  coolDown: Exercise[];
}

/** Series y repeticiones base de una franja de edad dentro de un catálogo. */
export interface AgePrescription {
  series: number;
  repeticiones: number;
}

/** Ejercicio tal como llega en los JSON de `src/data`. */
export interface CatalogExercise {
  id: string;
  nombre: string;
  descripcion: string;
  imagePlaceholder: string;
  bodyZone: Exercise['bodyZone'];
  durationSeconds: number | null;
  grupoMuscular?: string;
  musculo?: string;
  herramienta?: string;
  series?: number | null;
  reps?: string | null;
  seriesPorEdad?: Partial<Record<AgeBand, number>>;
  repsPorEdad?: Partial<Record<AgeBand, string | number>>;
}

/** Sesión dentro de `rutina5Dias` o `rutina3Dias`. `dia` es el orden en el JSON, no siempre el día calendario. */
export interface CatalogDay {
  dia: number;
  nombre: string;
  grupoMuscular: string;
  calentamiento: CatalogExercise[];
  ejercicios: CatalogExercise[];
  enfriamiento: CatalogExercise[];
}

/** Bloque de días de una opción de rutina. */
export interface CatalogRoutine {
  descripcion: string;
  dias: CatalogDay[];
}

/** Contenido de uno de los archivos de objetivo bajo `src/data/home` o `src/data/gym`. */
export interface GoalCatalog {
  objetivo: string;
  lugar: string;
  distribucionEdades: Record<AgeBand, AgePrescription>;
  nota: string;
  rutina5Dias: CatalogRoutine;
  /** Solo los catálogos de gimnasio incluyen la segunda opción. */
  rutina3Dias?: CatalogRoutine;
}

/**
 * Semana ya resuelta para la edad del usuario.
 * Los ejercicios son los mismos en todas las franjas; cambian series y repeticiones.
 */
export interface WeeklyPlan {
  ageBand: AgeBand;
  sets: number;
  reps: number;
  note: string;
  schedule: RoutineSchedule;
  routineDescription: string;
  weeklyRoutine: DayRoutine[];
}

/** Apartado de la biblioteca de ejercicios. */
export type ExerciseLibraryGroupId =
  | 'pecho'
  | 'espalda'
  | 'hombros'
  | 'brazos'
  | 'abdomen'
  | 'piernas'
  | 'calentamiento'
  | 'enfriamiento';

export type ExerciseLibraryPhase = 'calentamiento' | 'entrenamiento' | 'enfriamiento';

/** Ejercicio de la biblioteca. No incluye carga por edad ni duración en segundos. */
export interface LibraryExercise
  extends Omit<CatalogExercise, 'durationSeconds' | 'seriesPorEdad' | 'repsPorEdad'> {
  fase: ExerciseLibraryPhase;
}

export interface ExerciseLibraryGroup {
  id: ExerciseLibraryGroupId;
  nombre: string;
  ejercicios: LibraryExercise[];
}

/** Catálogo de ejercicios de un objetivo, agrupado por músculo. */
export interface ExerciseLibrary {
  objetivo: string;
  lugar: string;
  gruposMusculares: ExerciseLibraryGroup[];
}

/**
 * Perfil del usuario persistido en AsyncStorage (no proviene del JSON).
 * La edad se calcula en runtime a partir de `birthDate`.
 */
export interface UserProfile {
  birthDate: string;
  weight: number;
  workoutLocation: WorkoutLocation;
  goal: WorkoutGoal;
  /** En casa siempre es `5-days`. En gimnasio el usuario elige `5-days` o `3-days`. */
  routineSchedule: RoutineSchedule;
  metabolism: MetabolismType;
}

/** Guía nutricional asociada a un objetivo de entrenamiento. */
export interface NutritionMacros {
  calorias: string;
  proteinas: string;
  carbohidratos: string;
  grasas: string;
}

export interface NutritionHydration {
  agua: string;
  bebidas: string;
}

export interface NutritionSupplements {
  recomendados: string[];
  evitar: string;
}

export interface NutritionMealTiming {
  antesEntreno: string;
  duranteEntreno: string;
  despuesEntreno: string;
  comidaPostEntreno?: string;
  distribucion: string;
}

export interface NutritionDailyMenu {
  desayuno: string;
  mediaManana: string;
  comida: string;
  merienda?: string;
  meriendaPreEntreno?: string;
  cena: string;
  antesDormir?: string;
}

/** Guía de un metabolismo dentro de un objetivo. */
export interface MetabolismGuide {
  nombre: string;
  caracteristicas: string;
  comportamientoEnGym: string;
  caloriasYMacros: NutritionMacros;
  alimentosRecomendados: string[];
  alimentosAEliminarOLimitar: string[];
  hidratacion: NutritionHydration;
  suplementosYEstimulantes: NutritionSupplements;
  timingDeComidas: NutritionMealTiming;
  ejemploMenuDiario: NutritionDailyMenu;
}

/** Archivo de `src/data/nutrition`, con las tres variantes de metabolismo. */
export interface NutritionCatalog {
  objetivo: string;
  descripcion: string;
  nota: string;
  metabolismos: {
    metabolismoRapido: MetabolismGuide;
    metabolismoLento: MetabolismGuide;
    metabolismoNormal: MetabolismGuide;
  };
}

/** Guía ya resuelta para el objetivo y el metabolismo del usuario. */
export interface NutritionGuide extends MetabolismGuide {
  objetivo: string;
  descripcion: string;
  nota: string;
}

/** Identificador de una actividad de cardio independiente del perfil. */
export type CardioActivityId = 'jog' | 'cycling' | 'rope-jump';

export interface CardioStretch {
  nombre: string;
  descripcion: string;
}

export interface CardioWarmUp {
  duracion: string;
  ejercicios: string[];
}

export interface CardioCoolDown {
  duracion: string;
  ejercicios: CardioStretch[];
}

export type CardioMainWorkout = Record<string, string | string[]>;

export interface CardioSessionDay {
  nombre: string;
  calentamiento?: CardioWarmUp;
  entrenamientoPrincipal?: CardioMainWorkout;
  actividad?: string;
  enfriamientoEstiramientos: CardioCoolDown;
}

export interface CardioWeeklyRoutine {
  dia1: CardioSessionDay;
  dia2: CardioSessionDay;
  dia3: CardioSessionDay;
  dia4: CardioSessionDay;
  dia5: CardioSessionDay;
}

export interface CardioPlan {
  objetivo: string;
  descripcion: string;
  nota: string;
  duracionEstimada: string;
  recomendacionesGenerales: string[];
  rutinaSemanal: CardioWeeklyRoutine;
}

export interface CardioActivity extends CardioPlan {
  id: CardioActivityId;
  title: string;
}
