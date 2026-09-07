import type { DayOfWeek } from '../models/types';

export type RootStackParamList = {
  Welcome: undefined;
  Profile: undefined;
  Home: undefined;
  Nutrition: undefined;
  Workout: { day: DayOfWeek };
};
