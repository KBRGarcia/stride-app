import type { CardioActivityId, DayOfWeek } from '../models/types';

export type RootStackParamList = {
  Welcome: undefined;
  Profile: undefined;
  Home: undefined;
  Cardio: undefined;
  CardioActivity: { activityId: CardioActivityId };
  Nutrition: undefined;
  Workout: { day: DayOfWeek };
};
