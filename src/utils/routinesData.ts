import gymRoutines from '../data/routines-gym.json';
import homeRoutines from '../data/routines-home.json';
import type { RoutinesData, WorkoutLocation } from '../models/types';

export function getRoutinesForLocation(location: WorkoutLocation): RoutinesData {
  return location === 'gym' ? (gymRoutines as RoutinesData) : (homeRoutines as RoutinesData);
}
