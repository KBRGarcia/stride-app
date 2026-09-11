import cyclingPlan from '../data/training/cycling.json';
import jogPlan from '../data/training/jog.json';
import ropeJumpPlan from '../data/training/rope-jump.json';
import type {
  CardioActivity,
  CardioActivityId,
  CardioPlan,
  CardioSessionDay,
  DayOfWeek,
} from '../models/types';

export type CardioDayPresentation = {
  weekdayShort: string;
  weekdayFull: string;
  focus: string;
  dayOfWeek: DayOfWeek | null;
};

export type CardioDayItem = {
  title: string;
  detail?: string;
};

export type CardioDayPhase = {
  title: string;
  duration?: string;
  items: CardioDayItem[];
};

const WEEKDAY_LABELS: Record<
  string,
  { short: string; full: string; day: DayOfWeek }
> = {
  lunes: { short: 'Lun', full: 'Lunes', day: 1 },
  martes: { short: 'Mar', full: 'Martes', day: 2 },
  miercoles: { short: 'Mié', full: 'Miércoles', day: 3 },
  jueves: { short: 'Jue', full: 'Jueves', day: 4 },
  viernes: { short: 'Vie', full: 'Viernes', day: 5 },
  sabado: { short: 'Sáb', full: 'Sábado', day: 6 },
  domingo: { short: 'Dom', full: 'Domingo', day: 7 },
};

const CARDIO_TITLES: Record<CardioActivityId, string> = {
  jog: 'Trote',
  cycling: 'Ciclismo',
  'rope-jump': 'Salto de cuerda',
};

const CARDIO_PLANS: Record<CardioActivityId, CardioPlan> = {
  jog: jogPlan as CardioPlan,
  cycling: cyclingPlan as CardioPlan,
  'rope-jump': ropeJumpPlan as CardioPlan,
};

const CARDIO_ORDER: CardioActivityId[] = ['jog', 'cycling', 'rope-jump'];

const MAIN_WORKOUT_LABELS: Record<string, string> = {
  trote_caminata: 'Caminata y trote',
  series: 'Series',
  distanciaEstimada: 'Distancia estimada',
  troteContinuo: 'Trote continuo',
  caminataActiva: 'Caminata activa',
  repeticiones: 'Repeticiones',
  intervalos: 'Intervalos',
  pedaleo: 'Pedaleo',
  descanso: 'Descanso',
  pedaleoContinuo: 'Pedaleo continuo',
  recuperacion: 'Recuperación',
  tiempoTotal: 'Tiempo total',
  saltoContinuo: 'Salto continuo',
};

export function getCardioActivities(): CardioActivity[] {
  return CARDIO_ORDER.map((id) => ({
    id,
    title: CARDIO_TITLES[id],
    ...CARDIO_PLANS[id],
  }));
}

export function getCardioActivity(id: CardioActivityId): CardioActivity | null {
  const plan = CARDIO_PLANS[id];

  if (!plan) {
    return null;
  }

  return {
    id,
    title: CARDIO_TITLES[id],
    ...plan,
  };
}

export function getCardioWeekDays(activity: CardioActivity): CardioSessionDay[] {
  const { rutinaSemanal } = activity;

  return [
    rutinaSemanal.dia1,
    rutinaSemanal.dia2,
    rutinaSemanal.dia3,
    rutinaSemanal.dia4,
    rutinaSemanal.dia5,
  ];
}

export function getCardioSessionDay(
  activity: CardioActivity,
  dayIndex: number
): CardioSessionDay | null {
  return getCardioWeekDays(activity)[dayIndex] ?? null;
}

function normalizeWeekday(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function getCardioDayPresentation(day: CardioSessionDay): CardioDayPresentation {
  const [rawWeekday, ...rest] = day.nombre.split(/\s+[–-]\s+/);
  const weekday = WEEKDAY_LABELS[normalizeWeekday(rawWeekday ?? '')];
  const focus = rest.join(' – ').trim();

  return {
    weekdayShort: weekday?.short ?? (rawWeekday ?? 'Día').slice(0, 3),
    weekdayFull: weekday?.full ?? rawWeekday ?? day.nombre,
    focus: focus || day.nombre,
    dayOfWeek: weekday?.day ?? null,
  };
}

export function countCardioDayItems(day: CardioSessionDay): number {
  const warmupCount = day.calentamiento?.ejercicios.length ?? 0;
  const activityCount = day.actividad ? 1 : 0;
  const mainCount = formatCardioMainWorkout(day.entrenamientoPrincipal).reduce(
    (total, field) => total + field.values.length,
    0
  );
  const cooldownCount = day.enfriamientoEstiramientos.ejercicios.length;

  return warmupCount + activityCount + mainCount + cooldownCount;
}

export function getCardioDayPhases(day: CardioSessionDay): CardioDayPhase[] {
  const phases: CardioDayPhase[] = [];

  if (day.calentamiento) {
    phases.push({
      title: 'Calentamiento',
      duration: day.calentamiento.duracion,
      items: day.calentamiento.ejercicios.map((title) => ({ title })),
    });
  }

  const trainingItems: CardioDayItem[] = [];

  if (day.actividad) {
    trainingItems.push({ title: day.actividad });
  }

  for (const field of formatCardioMainWorkout(day.entrenamientoPrincipal)) {
    if (field.values.length === 1) {
      trainingItems.push({ title: field.label, detail: field.values[0] });
      continue;
    }

    trainingItems.push(
      ...field.values.map((value) => ({
        title: value,
      }))
    );
  }

  if (trainingItems.length > 0) {
    phases.push({
      title: 'Entrenamiento',
      items: trainingItems,
    });
  }

  phases.push({
    title: 'Enfriamiento',
    duration: day.enfriamientoEstiramientos.duracion,
    items: day.enfriamientoEstiramientos.ejercicios.map((stretch) => ({
      title: stretch.nombre,
      detail: stretch.descripcion,
    })),
  });

  return phases;
}

export function formatCardioMainWorkout(
  workout: CardioSessionDay['entrenamientoPrincipal']
): Array<{ label: string; values: string[] }> {
  if (!workout) {
    return [];
  }

  return Object.entries(workout).map(([key, value]) => ({
    label: MAIN_WORKOUT_LABELS[key] ?? key,
    values: Array.isArray(value) ? value : [value],
  }));
}
