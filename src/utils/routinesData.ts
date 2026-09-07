import gymMuscleGainRoutines from '../data/gym/muscle_gain.json';
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

export function getRoutines(location: WorkoutLocation, goal: WorkoutGoal): RoutinesData {
  if (location === 'gym') {
    // El único archivo de gimnasio disponible actualmente corresponde a ganancia muscular.
    return goal === 'muscle_gain' ? (gymMuscleGainRoutines as RoutinesData) : [];
  }

  return HOME_ROUTINES[goal];
}

/** Mantiene el orden natural de una sesión: calentamiento, trabajo principal y enfriamiento. */
export function getDayExercises(dayRoutine: DayRoutine): Exercise[] {
  return [
    ...dayRoutine.warmUp,
    ...dayRoutine.mainWorkout,
    ...dayRoutine.coolDown,
  ];
}
