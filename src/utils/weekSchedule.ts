import type { DayOfWeek } from '../models/types';

/** Lunes = 1 … Domingo = 7 (ISO). */
export function getDayOfWeek(date: Date = new Date()): DayOfWeek {
  const jsDay = date.getDay();
  return (jsDay === 0 ? 7 : jsDay) as DayOfWeek;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Devuelve el lunes 00:00 de la semana calendario que contiene `date`. */
export function getWeekStartDate(date: Date = new Date()): Date {
  const weekDate = new Date(date);
  const dayOfWeek = getDayOfWeek(weekDate);
  weekDate.setDate(weekDate.getDate() - (dayOfWeek - 1));
  weekDate.setHours(0, 0, 0, 0);
  return weekDate;
}

export function isSameCalendarWeek(isoDate: string, reference: Date = new Date()): boolean {
  const date = parseIsoDate(isoDate);
  return toIsoDate(getWeekStartDate(date)) === toIsoDate(getWeekStartDate(reference));
}

export type DayScheduleStatus = 'expired' | 'completed' | 'today' | 'upcoming';

export function getDayScheduleStatus(
  day: DayOfWeek,
  completedThisWeek: boolean,
  reference: Date = new Date()
): DayScheduleStatus {
  if (completedThisWeek) {
    return 'completed';
  }

  const today = getDayOfWeek(reference);

  if (day < today) {
    return 'expired';
  }

  if (day > today) {
    return 'upcoming';
  }

  return 'today';
}

/** Solo el entrenamiento del día actual puede iniciarse (dentro de la semana en curso). */
export function isDayWorkoutAccessible(
  day: DayOfWeek,
  completedThisWeek: boolean,
  reference: Date = new Date()
): boolean {
  return getDayScheduleStatus(day, completedThisWeek, reference) === 'today';
}

export function getDayStatusLabel(status: DayScheduleStatus): string {
  switch (status) {
    case 'expired':
      return 'No disponible';
    case 'upcoming':
      return 'Próximamente';
    case 'today':
      return 'Hoy';
    case 'completed':
      return 'Completado';
  }
}
