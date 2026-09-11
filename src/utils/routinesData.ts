import gymFatReductionRoutines from '../data/gym/fat_reduction.json';
import gymMuscleGainRoutines from '../data/gym/muscle_gain.json';
import gymToningRoutines from '../data/gym/toning.json';
import homeFatReductionRoutines from '../data/home/fat_reduction.json';
import homeMuscleGainRoutines from '../data/home/muscle_gain.json';
import homeToningRoutines from '../data/home/toning.json';
import type {
  DayRoutine,
  Exercise,
  RoutinesData,
  WorkoutGoal,
  WorkoutLocation,
} from '../models/types';

const HOME_ROUTINES: Record<WorkoutGoal, RoutinesData> = {
  toning: homeToningRoutines as RoutinesData,
  muscle_gain: homeMuscleGainRoutines as RoutinesData,
  fat_reduction: homeFatReductionRoutines as RoutinesData,
};

const GYM_ROUTINES: Record<WorkoutGoal, RoutinesData> = {
  toning: gymToningRoutines as RoutinesData,
  muscle_gain: gymMuscleGainRoutines as RoutinesData,
  fat_reduction: gymFatReductionRoutines as RoutinesData,
};

export function getRoutines(location: WorkoutLocation, goal: WorkoutGoal): RoutinesData {
  return location === 'gym' ? GYM_ROUTINES[goal] : HOME_ROUTINES[goal];
}

/** Mantiene el orden natural de una sesión: calentamiento, trabajo principal y enfriamiento. */
export function getDayExercises(dayRoutine: DayRoutine): Exercise[] {
  return [
    ...dayRoutine.warmUp,
    ...dayRoutine.mainWorkout,
    ...dayRoutine.coolDown,
  ];
}
