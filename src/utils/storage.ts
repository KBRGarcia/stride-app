import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DayOfWeek, UserProfile } from '../models/types';

const STORAGE_KEYS = {
  profile: '@stride/profile',
  completedDates: '@stride/completed_dates',
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

  return JSON.parse(raw) as UserProfile;
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
