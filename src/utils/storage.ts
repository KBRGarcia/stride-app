import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DayOfWeek, UserProfile } from '../models/types';
import type { ColorScheme } from '../theme/types';

const STORAGE_KEYS = {
  profile: '@stride/profile',
  completedDates: '@stride/completed_dates',
  colorScheme: '@stride/color_scheme',
} as const;

/** Fecha ISO (`YYYY-MM-DD`) en la que se completó un día de rutina. */
export type CompletedWorkoutDate = {
  day: DayOfWeek;
  date: string;
};

export async function getProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.profile);
  if (!raw) {
    return null;
  }

  const parsed = JSON.parse(raw) as Partial<UserProfile>;
  if (!parsed.birthDate || !parsed.weight || !parsed.gender) {
    return null;
  }

  return {
    birthDate: parsed.birthDate,
    weight: parsed.weight,
    gender: parsed.gender,
    workoutLocation: parsed.workoutLocation === 'gym' ? 'gym' : 'home',
  };
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
}

export async function getCompletedWorkoutDates(): Promise<CompletedWorkoutDate[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.completedDates);
  if (!raw) {
    return [];
  }

  return JSON.parse(raw) as CompletedWorkoutDate[];
}

export async function saveCompletedWorkoutDates(
  completions: CompletedWorkoutDate[]
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.completedDates, JSON.stringify(completions));
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.profile,
    STORAGE_KEYS.completedDates,
  ]);
}

export async function getColorScheme(): Promise<ColorScheme | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.colorScheme);
  if (raw === 'light' || raw === 'dark') {
    return raw;
  }

  return null;
}

export async function saveColorScheme(colorScheme: ColorScheme): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.colorScheme, colorScheme);
}
