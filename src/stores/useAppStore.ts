import { create } from 'zustand';

import type { DayOfWeek, UserProfile, WeeklyPlan } from '../models/types';
import { resolveWeeklyPlan } from '../utils/routineMatcher';
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
  weeklyPlan: WeeklyPlan | null;
  completedWorkouts: CompletedWorkoutDate[];
  hydrate: () => Promise<void>;
  setProfile: (profile: UserProfile) => Promise<boolean>;
  resetProfile: () => Promise<void>;
  isDayCompleted: (day: DayOfWeek) => boolean;
}

function matchProfile(profile: UserProfile): WeeklyPlan | null {
  return resolveWeeklyPlan(profile);
}

export const useAppStore = create<AppState>((set, get) => ({
  isHydrated: false,
  profile: null,
  weeklyPlan: null,
  completedWorkouts: [],

  hydrate: async () => {
    const [profile, completedWorkouts] = await Promise.all([
      getProfile(),
      getCompletedWorkoutDates(),
    ]);

    const weeklyPlan = profile ? matchProfile(profile) : null;

    set({
      isHydrated: true,
      profile,
      weeklyPlan,
      completedWorkouts,
    });
  },

  setProfile: async (profile) => {
    const weeklyPlan = matchProfile(profile);

    if (!weeklyPlan) {
      return false;
    }

    await saveProfile(profile);
    set({ profile, weeklyPlan });
    return true;
  },

  resetProfile: async () => {
    await clearProfile();
    set({
      profile: null,
      weeklyPlan: null,
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
