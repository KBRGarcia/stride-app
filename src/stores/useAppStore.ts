import { create } from 'zustand';

import routines from '../data/routines.json';
import type { DayOfWeek, Recommendation, RoutinesData, UserProfile } from '../models/types';
import { findMatchingRecommendation } from '../utils/routineMatcher';
import {
  getCompletedWorkoutDates,
  getProfile,
  saveCompletedWorkoutDates,
  saveProfile,
  type CompletedWorkoutDate,
} from '../utils/storage';

interface AppState {
  isHydrated: boolean;
  profile: UserProfile | null;
  recommendation: Recommendation | null;
  completedWorkouts: CompletedWorkoutDate[];
  hydrate: () => Promise<void>;
  setProfile: (profile: UserProfile) => Promise<boolean>;
  isDayCompleted: (day: DayOfWeek) => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  isHydrated: false,
  profile: null,
  recommendation: null,
  completedWorkouts: [],

  hydrate: async () => {
    const [profile, completedWorkouts] = await Promise.all([
      getProfile(),
      getCompletedWorkoutDates(),
    ]);

    const recommendation = profile
      ? findMatchingRecommendation(profile, routines as RoutinesData)
      : null;

    set({
      isHydrated: true,
      profile,
      recommendation,
      completedWorkouts,
    });
  },

  setProfile: async (profile) => {
    const recommendation = findMatchingRecommendation(profile, routines as RoutinesData);

    if (!recommendation) {
      return false;
    }

    await saveProfile(profile);
    set({ profile, recommendation });
    return true;
  },

  isDayCompleted: (day) => get().completedWorkouts.some((entry) => entry.day === day),
}));

/** Expuesto para WorkoutScreen u otras pantallas que registren progreso. */
export async function markDayCompleted(day: DayOfWeek, date: string): Promise<void> {
  const current = await getCompletedWorkoutDates();
  const withoutDay = current.filter((entry) => entry.day !== day);
  const updated = [...withoutDay, { day, date }];

  await saveCompletedWorkoutDates(updated);
  useAppStore.setState({ completedWorkouts: updated });
}
