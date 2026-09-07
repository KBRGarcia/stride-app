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

/**
 * Solo se puede entrenar el día de hoy. Se puede repetir aunque ya esté marcado
 * como completado en la semana actual.
 */
export function isDayWorkoutAccessible(
  day: DayOfWeek,
  _completedThisWeek: boolean,
  reference: Date = new Date()
): boolean {
  return day === getDayOfWeek(reference);
}

export function getDayStatusLabel(
  status: DayScheduleStatus,
  options?: { canRepeat?: boolean }
): string {
  switch (status) {
    case 'expired':
      return 'Ver rutina';
    case 'upcoming':
      return 'Ver rutina';
    case 'today':
      return 'Hoy';
    case 'completed':
      return options?.canRepeat ? 'Completado · Toca para repetir' : 'Completado';
  }
}
