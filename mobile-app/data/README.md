# Workout Tracker Data Files

This directory contains the data files for the workout tracker application.

## Files

### `exerciseLibrary.ts`
Contains 200+ exercises with detailed information including:
- Exercise name, category, difficulty level
- Equipment needed and target muscles
- YouTube video URLs for tutorials
- Calorie burn estimates
- Primary and secondary muscle groups

### `workoutLibrary.ts`
Contains pre-built workout routines including:
- **Push Day** (Beginner & Advanced)
- **Pull Day** (Beginner & Advanced) 
- **Leg Day** (Beginner & Advanced)
- **Upper Body** (Beginner)
- **Lower Body** (Beginner)
- **Full Body** (Beginner & Advanced)
- **CrossFit** (AMRAP & EMOM)
- **Yoga** (Morning Flow, Power Yoga, Flexibility)
- **Stretching** (Morning, Post-Workout, Flexibility)

### `index.ts`
Convenient export file for importing all data.

## Usage

```typescript
// Import individual files
import { exerciseLibrary } from '../data/exerciseLibrary';
import { workoutLibrary } from '../data/workoutLibrary';

// Or import everything at once
import { exerciseLibrary, workoutLibrary } from '../data';

// Use in your component
const exercises = exerciseLibrary.filter(ex => ex.category === 'Chest');
const workouts = workoutLibrary.filter(workout => workout.difficulty === 'Beginner');
```

## Features

- **200+ Exercises**: Comprehensive exercise database
- **Pre-built Routines**: Ready-to-use workout plans
- **YouTube Integration**: Video tutorials for exercises and routines
- **Difficulty Levels**: Beginner, Intermediate, Advanced
- **Equipment Tracking**: Know what equipment you need
- **Calorie Estimates**: Track calories burned
- **Muscle Targeting**: Know which muscles each exercise works

## Adding New Exercises

To add new exercises, simply add them to the `exerciseLibrary` array in `exerciseLibrary.ts`.

## Adding New Workouts

To add new workout routines, add them to the `workoutLibrary` array in `workoutLibrary.ts`.


