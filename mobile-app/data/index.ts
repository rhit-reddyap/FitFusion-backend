// Export all data files for easy importing
export { exerciseLibrary, Exercise as LibraryExercise } from './exerciseLibrary';
export { workoutLibrary, WorkoutRoutine, WorkoutExercise } from './workoutLibrary';

// Re-export everything as default for convenience
export default {
  exerciseLibrary,
  workoutLibrary
};


