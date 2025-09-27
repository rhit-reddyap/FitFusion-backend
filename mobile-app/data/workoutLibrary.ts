export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  weight?: string;
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  calories: number;
  equipment: string[];
  targetMuscles: string[];
  exercises: WorkoutExercise[];
  videoUrl?: string;
  thumbnail?: string;
}

export const workoutLibrary: WorkoutRoutine[] = [
  // PUSH DAY ROUTINES
  {
    id: 'push-day-beginner',
    name: 'Push Day - Beginner',
    description: 'Complete chest, shoulder, and tricep workout for beginners',
    category: 'Push',
    difficulty: 'Beginner',
    duration: 45,
    calories: 350,
    equipment: ['Dumbbells', 'Bench'],
    targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
    exercises: [
      { id: 'bench-press', name: 'Bench Press', sets: 3, reps: '8-12', rest: '2-3 min' },
      { id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', sets: 3, reps: '8-12', rest: '2-3 min' },
      { id: 'overhead-press', name: 'Overhead Press', sets: 3, reps: '8-12', rest: '2-3 min' },
      { id: 'lateral-raises', name: 'Lateral Raises', sets: 3, reps: '12-15', rest: '1-2 min' },
      { id: 'tricep-dips', name: 'Tricep Dips', sets: 3, reps: '8-12', rest: '1-2 min' },
      { id: 'tricep-pushdowns', name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: '1-2 min' }
    ]
  },
  {
    id: 'push-day-advanced',
    name: 'Push Day - Advanced',
    description: 'Intensive chest, shoulder, and tricep workout for advanced lifters',
    category: 'Push',
    difficulty: 'Advanced',
    duration: 75,
    calories: 550,
    equipment: ['Barbell', 'Dumbbells', 'Cable Machine', 'Bench'],
    targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
    exercises: [
      { id: 'bench-press', name: 'Bench Press', sets: 4, reps: '5-8', rest: '3-4 min' },
      { id: 'incline-bench-press', name: 'Incline Bench Press', sets: 4, reps: '6-10', rest: '3 min' },
      { id: 'dips', name: 'Weighted Dips', sets: 3, reps: '8-12', rest: '2-3 min' },
      { id: 'overhead-press', name: 'Overhead Press', sets: 4, reps: '6-10', rest: '3 min' },
      { id: 'arnold-press', name: 'Arnold Press', sets: 3, reps: '8-12', rest: '2 min' },
      { id: 'lateral-raises', name: 'Lateral Raises', sets: 4, reps: '12-15', rest: '1-2 min' },
      { id: 'close-grip-bench-press', name: 'Close Grip Bench Press', sets: 3, reps: '8-12', rest: '2-3 min' },
      { id: 'tricep-pushdowns', name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: '1-2 min' }
    ]
  },

  // PULL DAY ROUTINES
  {
    id: 'pull-day-beginner',
    name: 'Pull Day - Beginner',
    description: 'Complete back and bicep workout for beginners',
    category: 'Pull',
    difficulty: 'Beginner',
    duration: 45,
    calories: 350,
    equipment: ['Cable Machine', 'Dumbbells'],
    targetMuscles: ['Back', 'Biceps'],
    exercises: [
      { id: 'lat-pulldown', name: 'Lat Pulldown', sets: 3, reps: '8-12', rest: '2-3 min' },
      { id: 'seated-row', name: 'Seated Row', sets: 3, reps: '8-12', rest: '2-3 min' },
      { id: 'face-pulls', name: 'Face Pulls', sets: 3, reps: '12-15', rest: '1-2 min' },
      { id: 'bicep-curls', name: 'Bicep Curls', sets: 3, reps: '10-15', rest: '1-2 min' },
      { id: 'hammer-curls', name: 'Hammer Curls', sets: 3, reps: '10-15', rest: '1-2 min' }
    ]
  },
  {
    id: 'pull-day-advanced',
    name: 'Pull Day - Advanced',
    description: 'Intensive back and bicep workout for advanced lifters',
    category: 'Pull',
    difficulty: 'Advanced',
    duration: 75,
    calories: 550,
    equipment: ['Barbell', 'Dumbbells', 'Cable Machine', 'Pull-up Bar'],
    targetMuscles: ['Back', 'Biceps'],
    exercises: [
      { id: 'deadlift', name: 'Deadlift', sets: 4, reps: '5-8', rest: '3-4 min' },
      { id: 'pull-ups', name: 'Pull-ups', sets: 4, reps: '6-12', rest: '2-3 min' },
      { id: 'bent-over-row', name: 'Bent-over Row', sets: 4, reps: '6-10', rest: '3 min' },
      { id: 't-bar-row', name: 'T-Bar Row', sets: 3, reps: '8-12', rest: '2-3 min' },
      { id: 'face-pulls', name: 'Face Pulls', sets: 3, reps: '12-15', rest: '1-2 min' },
      { id: 'bicep-curls', name: 'Bicep Curls', sets: 4, reps: '8-12', rest: '1-2 min' },
      { id: 'hammer-curls', name: 'Hammer Curls', sets: 3, reps: '10-15', rest: '1-2 min' },
      { id: 'preacher-curls', name: 'Preacher Curls', sets: 3, reps: '10-15', rest: '1-2 min' }
    ]
  },

  // LEG DAY ROUTINES
  {
    id: 'leg-day-beginner',
    name: 'Leg Day - Beginner',
    description: 'Complete leg workout for beginners',
    category: 'Legs',
    difficulty: 'Beginner',
    duration: 50,
    calories: 400,
    equipment: ['Bodyweight', 'Dumbbells'],
    targetMuscles: ['Quads', 'Glutes', 'Hamstrings', 'Calves'],
    exercises: [
      { id: 'squat', name: 'Bodyweight Squats', sets: 3, reps: '12-15', rest: '2-3 min' },
      { id: 'lunges', name: 'Lunges', sets: 3, reps: '10 each leg', rest: '2 min' },
      { id: 'bulgarian-split-squats', name: 'Bulgarian Split Squats', sets: 3, reps: '8 each leg', rest: '2 min' },
      { id: 'calf-raises', name: 'Calf Raises', sets: 3, reps: '15-20', rest: '1-2 min' },
      { id: 'glute-bridges', name: 'Glute Bridges', sets: 3, reps: '12-15', rest: '1-2 min' }
    ]
  },
  {
    id: 'leg-day-advanced',
    name: 'Leg Day - Advanced',
    description: 'Intensive leg workout for advanced lifters',
    category: 'Legs',
    difficulty: 'Advanced',
    duration: 90,
    calories: 650,
    equipment: ['Barbell', 'Dumbbells', 'Leg Press Machine'],
    targetMuscles: ['Quads', 'Glutes', 'Hamstrings', 'Calves'],
    exercises: [
      { id: 'squat', name: 'Back Squat', sets: 4, reps: '5-8', rest: '3-4 min' },
      { id: 'front-squat', name: 'Front Squat', sets: 3, reps: '6-10', rest: '3 min' },
      { id: 'romanian-deadlift', name: 'Romanian Deadlift', sets: 4, reps: '6-10', rest: '3 min' },
      { id: 'leg-press', name: 'Leg Press', sets: 3, reps: '12-15', rest: '2-3 min' },
      { id: 'bulgarian-split-squats', name: 'Bulgarian Split Squats', sets: 3, reps: '8 each leg', rest: '2 min' },
      { id: 'leg-curls', name: 'Leg Curls', sets: 3, reps: '12-15', rest: '1-2 min' },
      { id: 'leg-extensions', name: 'Leg Extensions', sets: 3, reps: '12-15', rest: '1-2 min' },
      { id: 'calf-raises', name: 'Calf Raises', sets: 4, reps: '15-20', rest: '1-2 min' }
    ]
  },

  // UPPER BODY ROUTINES
  {
    id: 'upper-body-beginner',
    name: 'Upper Body - Beginner',
    description: 'Complete upper body workout for beginners',
    category: 'Upper Body',
    difficulty: 'Beginner',
    duration: 60,
    calories: 450,
    equipment: ['Dumbbells', 'Cable Machine'],
    targetMuscles: ['Chest', 'Back', 'Shoulders', 'Arms'],
    exercises: [
      { id: 'dumbbell-press', name: 'Dumbbell Press', sets: 3, reps: '8-12', rest: '2-3 min' },
      { id: 'lat-pulldown', name: 'Lat Pulldown', sets: 3, reps: '8-12', rest: '2-3 min' },
      { id: 'overhead-press', name: 'Overhead Press', sets: 3, reps: '8-12', rest: '2-3 min' },
      { id: 'seated-row', name: 'Seated Row', sets: 3, reps: '8-12', rest: '2-3 min' },
      { id: 'lateral-raises', name: 'Lateral Raises', sets: 3, reps: '12-15', rest: '1-2 min' },
      { id: 'bicep-curls', name: 'Bicep Curls', sets: 3, reps: '10-15', rest: '1-2 min' },
      { id: 'tricep-pushdowns', name: 'Tricep Pushdowns', sets: 3, reps: '10-15', rest: '1-2 min' }
    ]
  },

  // LOWER BODY ROUTINES
  {
    id: 'lower-body-beginner',
    name: 'Lower Body - Beginner',
    description: 'Complete lower body workout for beginners',
    category: 'Lower Body',
    difficulty: 'Beginner',
    duration: 45,
    calories: 350,
    equipment: ['Bodyweight', 'Dumbbells'],
    targetMuscles: ['Quads', 'Glutes', 'Hamstrings', 'Calves'],
    exercises: [
      { id: 'squat', name: 'Bodyweight Squats', sets: 3, reps: '12-15', rest: '2-3 min' },
      { id: 'lunges', name: 'Lunges', sets: 3, reps: '10 each leg', rest: '2 min' },
      { id: 'romanian-deadlift', name: 'Romanian Deadlift', sets: 3, reps: '8-12', rest: '2-3 min' },
      { id: 'calf-raises', name: 'Calf Raises', sets: 3, reps: '15-20', rest: '1-2 min' },
      { id: 'glute-bridges', name: 'Glute Bridges', sets: 3, reps: '12-15', rest: '1-2 min' }
    ]
  },

  // FULL BODY ROUTINES
  {
    id: 'full-body-beginner',
    name: 'Full Body - Beginner',
    description: 'Complete full body workout for beginners',
    category: 'Full Body',
    difficulty: 'Beginner',
    duration: 60,
    calories: 400,
    equipment: ['Dumbbells', 'Bodyweight'],
    targetMuscles: ['Full Body'],
    exercises: [
      { id: 'squat', name: 'Bodyweight Squats', sets: 3, reps: '12-15', rest: '2 min' },
      { id: 'push-ups', name: 'Push-ups', sets: 3, reps: '8-12', rest: '2 min' },
      { id: 'lunges', name: 'Lunges', sets: 3, reps: '10 each leg', rest: '2 min' },
      { id: 'dumbbell-press', name: 'Dumbbell Press', sets: 3, reps: '8-12', rest: '2 min' },
      { id: 'bent-over-row', name: 'Bent-over Row', sets: 3, reps: '8-12', rest: '2 min' },
      { id: 'plank', name: 'Plank', sets: 3, reps: '30-60 sec', rest: '1 min' }
    ]
  },
  {
    id: 'full-body-advanced',
    name: 'Full Body - Advanced',
    description: 'Intensive full body workout for advanced lifters',
    category: 'Full Body',
    difficulty: 'Advanced',
    duration: 90,
    calories: 600,
    equipment: ['Barbell', 'Dumbbells', 'Pull-up Bar'],
    targetMuscles: ['Full Body'],
    exercises: [
      { id: 'squat', name: 'Back Squat', sets: 4, reps: '5-8', rest: '3-4 min' },
      { id: 'bench-press', name: 'Bench Press', sets: 4, reps: '5-8', rest: '3-4 min' },
      { id: 'deadlift', name: 'Deadlift', sets: 4, reps: '5-8', rest: '3-4 min' },
      { id: 'pull-ups', name: 'Pull-ups', sets: 4, reps: '6-12', rest: '2-3 min' },
      { id: 'overhead-press', name: 'Overhead Press', sets: 3, reps: '6-10', rest: '3 min' },
      { id: 'bent-over-row', name: 'Bent-over Row', sets: 3, reps: '6-10', rest: '3 min' },
      { id: 'plank', name: 'Plank', sets: 3, reps: '60-90 sec', rest: '1 min' }
    ]
  },

  // CROSSFIT ROUTINES
  {
    id: 'crossfit-amrap',
    name: 'CrossFit AMRAP',
    description: 'As Many Rounds As Possible in 20 minutes',
    category: 'CrossFit',
    difficulty: 'Advanced',
    duration: 20,
    calories: 300,
    equipment: ['Bodyweight', 'Pull-up Bar'],
    targetMuscles: ['Full Body'],
    exercises: [
      { id: 'burpees', name: 'Burpees', sets: 1, reps: '10', rest: '0' },
      { id: 'pull-ups', name: 'Pull-ups', sets: 1, reps: '10', rest: '0' },
      { id: 'push-ups', name: 'Push-ups', sets: 1, reps: '20', rest: '0' },
      { id: 'air-squats', name: 'Air Squats', sets: 1, reps: '30', rest: '0' }
    ]
  },
  {
    id: 'crossfit-emom',
    name: 'CrossFit EMOM',
    description: 'Every Minute On the Minute for 15 minutes',
    category: 'CrossFit',
    difficulty: 'Advanced',
    duration: 15,
    calories: 250,
    equipment: ['Bodyweight', 'Dumbbells'],
    targetMuscles: ['Full Body'],
    exercises: [
      { id: 'thrusters', name: 'Dumbbell Thrusters', sets: 1, reps: '8', rest: '0' },
      { id: 'burpees', name: 'Burpees', sets: 1, reps: '5', rest: '0' },
      { id: 'mountain-climbers', name: 'Mountain Climbers', sets: 1, reps: '20', rest: '0' }
    ]
  },

  // YOGA ROUTINES
  {
    id: 'morning-yoga',
    name: 'Morning Yoga Flow',
    description: 'Gentle yoga flow to start your day',
    category: 'Yoga',
    difficulty: 'Beginner',
    duration: 30,
    calories: 150,
    equipment: ['Yoga Mat'],
    targetMuscles: ['Full Body'],
    exercises: [
      { id: 'sun-salutation', name: 'Sun Salutation', sets: 1, reps: '5 rounds', rest: '0' },
      { id: 'warrior-poses', name: 'Warrior Poses', sets: 1, reps: 'Hold 30 sec each', rest: '0' },
      { id: 'tree-pose', name: 'Tree Pose', sets: 1, reps: 'Hold 30 sec each side', rest: '0' },
      { id: 'childs-pose', name: 'Child\'s Pose', sets: 1, reps: 'Hold 1 min', rest: '0' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=v7AYKMP6rOE'
  },
  {
    id: 'power-yoga',
    name: 'Power Yoga',
    description: 'Dynamic yoga flow for strength and flexibility',
    category: 'Yoga',
    difficulty: 'Intermediate',
    duration: 45,
    calories: 250,
    equipment: ['Yoga Mat'],
    targetMuscles: ['Full Body'],
    exercises: [
      { id: 'vinyasa-flow', name: 'Vinyasa Flow', sets: 1, reps: '10 rounds', rest: '0' },
      { id: 'crow-pose', name: 'Crow Pose', sets: 1, reps: 'Hold 30 sec', rest: '0' },
      { id: 'wheel-pose', name: 'Wheel Pose', sets: 1, reps: 'Hold 30 sec', rest: '0' },
      { id: 'headstand', name: 'Headstand', sets: 1, reps: 'Hold 1 min', rest: '0' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=6p6y7y1a7oY'
  },
  {
    id: 'yoga-flexibility',
    name: 'Flexibility Yoga',
    description: 'Yoga routine focused on improving flexibility',
    category: 'Yoga',
    difficulty: 'Beginner',
    duration: 25,
    calories: 120,
    equipment: ['Yoga Mat'],
    targetMuscles: ['Full Body'],
    exercises: [
      { id: 'forward-fold', name: 'Forward Fold', sets: 1, reps: 'Hold 1 min', rest: '0' },
      { id: 'pigeon-pose', name: 'Pigeon Pose', sets: 1, reps: 'Hold 1 min each side', rest: '0' },
      { id: 'seated-twist', name: 'Seated Twist', sets: 1, reps: 'Hold 30 sec each side', rest: '0' },
      { id: 'happy-baby', name: 'Happy Baby', sets: 1, reps: 'Hold 1 min', rest: '0' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=4pKly2JojMw'
  },

  // STRETCHING ROUTINES
  {
    id: 'morning-stretch',
    name: 'Morning Stretch',
    description: 'Gentle stretching routine to wake up your body',
    category: 'Stretching',
    difficulty: 'Beginner',
    duration: 15,
    calories: 50,
    equipment: ['Yoga Mat'],
    targetMuscles: ['Full Body'],
    exercises: [
      { id: 'cat-cow', name: 'Cat-Cow Stretch', sets: 1, reps: '10 reps', rest: '0' },
      { id: 'spinal-twist', name: 'Spinal Twist', sets: 1, reps: 'Hold 30 sec each side', rest: '0' },
      { id: 'hip-flexor-stretch', name: 'Hip Flexor Stretch', sets: 1, reps: 'Hold 30 sec each', rest: '0' },
      { id: 'hamstring-stretch', name: 'Hamstring Stretch', sets: 1, reps: 'Hold 30 sec each', rest: '0' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=g13nVX7Vdso'
  },
  {
    id: 'post-workout-stretch',
    name: 'Post-Workout Stretch',
    description: 'Comprehensive stretching routine after workouts',
    category: 'Stretching',
    difficulty: 'Beginner',
    duration: 20,
    calories: 75,
    equipment: ['Yoga Mat'],
    targetMuscles: ['Full Body'],
    exercises: [
      { id: 'quad-stretch', name: 'Quad Stretch', sets: 1, reps: 'Hold 30 sec each', rest: '0' },
      { id: 'calf-stretch', name: 'Calf Stretch', sets: 1, reps: 'Hold 30 sec each', rest: '0' },
      { id: 'shoulder-stretch', name: 'Shoulder Stretch', sets: 1, reps: 'Hold 30 sec each', rest: '0' },
      { id: 'chest-stretch', name: 'Chest Stretch', sets: 1, reps: 'Hold 30 sec', rest: '0' },
      { id: 'tricep-stretch', name: 'Tricep Stretch', sets: 1, reps: 'Hold 30 sec each', rest: '0' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=4pKly2JojMw'
  },
  {
    id: 'flexibility-routine',
    name: 'Flexibility Routine',
    description: 'Deep stretching routine for improved flexibility',
    category: 'Stretching',
    difficulty: 'Intermediate',
    duration: 30,
    calories: 100,
    equipment: ['Yoga Mat'],
    targetMuscles: ['Full Body'],
    exercises: [
      { id: 'pigeon-pose', name: 'Pigeon Pose', sets: 1, reps: 'Hold 2 min each side', rest: '0' },
      { id: 'frog-pose', name: 'Frog Pose', sets: 1, reps: 'Hold 2 min', rest: '0' },
      { id: 'butterfly-stretch', name: 'Butterfly Stretch', sets: 1, reps: 'Hold 2 min', rest: '0' },
      { id: 'seated-forward-fold', name: 'Seated Forward Fold', sets: 1, reps: 'Hold 2 min', rest: '0' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=4pKly2JojMw'
  }
];

export default workoutLibrary;