import cyclingPlan from '../data/training/cycling.json';
import jogPlan from '../data/training/jog.json';
import ropeJumpPlan from '../data/training/rope-jump.json';
import type {
  CardioActivity,
  CardioActivityId,
  CardioPlan,
  CardioSessionDay,
} from '../models/types';

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
