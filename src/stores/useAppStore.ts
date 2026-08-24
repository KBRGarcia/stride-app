import { create } from 'zustand';

import type { DayOfWeek, Recommendation, UserProfile } from '../models/types';
import { findMatchingRecommendation } from '../utils/routineMatcher';
import { getRoutinesForLocation } from '../utils/routinesData';
import { isSameCalendarWeek } from '../utils/weekSchedule';
import {
  clearProfile,
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
  resetProfile: () => Promise<void>;
  isDayCompleted: (day: DayOfWeek) => boolean;
}

function matchProfile(profile: UserProfile): Recommendation | null {
  return findMatchingRecommendation(profile, getRoutinesForLocation(profile.workoutLocation));
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

    const recommendation = profile ? matchProfile(profile) : null;

    set({
      isHydrated: true,
      profile,
      recommendation,
      completedWorkouts,
    });
  },

  setProfile: async (profile) => {
    const recommendation = matchProfile(profile);

    if (!recommendation) {
      return false;
    }

    await saveProfile(profile);
    set({ profile, recommendation });
    return true;
  },

  resetProfile: async () => {
    await clearProfile();
    set({
      profile: null,
      recommendation: null,
      completedWorkouts: [],
    });
  },

  isDayCompleted: (day) =>
    get().completedWorkouts.some(
      (entry) => entry.day === day && isSameCalendarWeek(entry.date)
    ),
}));

/** Expuesto para WorkoutScreen u otras pantallas que registren progreso. */
export async function markDayCompleted(day: DayOfWeek, date: string): Promise<void> {
  const current = await getCompletedWorkoutDates();
  const withoutDay = current.filter((entry) => entry.day !== day);
  const updated = [...withoutDay, { day, date }];

  await saveCompletedWorkoutDates(updated);
  useAppStore.setState({ completedWorkouts: updated });
}
