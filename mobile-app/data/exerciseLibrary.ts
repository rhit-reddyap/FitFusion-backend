export interface Exercise {
  id: string;
  name: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string;
  muscle: string;
  instructions?: string;
  videoUrl?: string;
  description?: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  caloriesPerMinute: number;
}

export const exerciseLibrary: Exercise[] = [
  // CHEST EXERCISES
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'Chest',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    muscle: 'Chest',
    description: 'Classic chest exercise performed lying on a bench',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Shoulders', 'Triceps'],
    caloriesPerMinute: 8,
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg'
  },
  {
    id: 'incline-bench-press',
    name: 'Incline Bench Press',
    category: 'Chest',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    muscle: 'Upper Chest',
    description: 'Targets upper chest muscles',
    primaryMuscles: ['Upper Chest'],
    secondaryMuscles: ['Shoulders', 'Triceps'],
    caloriesPerMinute: 8,
    videoUrl: 'https://www.youtube.com/watch?v=8iPEnov-lmU'
  },
  {
    id: 'dumbbell-press',
    name: 'Dumbbell Press',
    category: 'Chest',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    muscle: 'Chest',
    description: 'Chest exercise with dumbbells for better range of motion',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Shoulders', 'Triceps'],
    caloriesPerMinute: 7,
    videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94'
  },
  {
    id: 'push-ups',
    name: 'Push-ups',
    category: 'Chest',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    muscle: 'Chest',
    description: 'Classic bodyweight chest exercise',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Shoulders', 'Triceps', 'Core'],
    caloriesPerMinute: 6,
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4'
  },
  {
    id: 'dips',
    name: 'Dips',
    category: 'Chest',
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    muscle: 'Chest',
    description: 'Bodyweight exercise targeting chest and triceps',
    primaryMuscles: ['Chest', 'Triceps'],
    secondaryMuscles: ['Shoulders'],
    caloriesPerMinute: 7,
    videoUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As'
  },
  {
    id: 'chest-flyes',
    name: 'Chest Flyes',
    category: 'Chest',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    muscle: 'Chest',
    description: 'Isolation exercise for chest muscles',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Shoulders'],
    caloriesPerMinute: 5,
    videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0'
  },
  {
    id: 'cable-flyes',
    name: 'Cable Flyes',
    category: 'Chest',
    difficulty: 'Intermediate',
    equipment: 'Cable Machine',
    muscle: 'Chest',
    description: 'Cable-based chest isolation exercise',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Shoulders'],
    caloriesPerMinute: 6,
    videoUrl: 'https://www.youtube.com/watch?v=Iwe6AmxVf7o'
  },
  {
    id: 'decline-bench-press',
    name: 'Decline Bench Press',
    category: 'Chest',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    muscle: 'Lower Chest',
    description: 'Targets lower chest muscles',
    primaryMuscles: ['Lower Chest'],
    secondaryMuscles: ['Shoulders', 'Triceps'],
    caloriesPerMinute: 8,
    videoUrl: 'https://www.youtube.com/watch?v=LfyQBUKR8SE'
  },

  // BACK EXERCISES
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: 'Back',
    difficulty: 'Advanced',
    equipment: 'Barbell',
    muscle: 'Back',
    description: 'Compound exercise targeting entire posterior chain',
    primaryMuscles: ['Back', 'Glutes', 'Hamstrings'],
    secondaryMuscles: ['Core', 'Traps', 'Forearms'],
    caloriesPerMinute: 12,
    videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q'
  },
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    category: 'Back',
    difficulty: 'Intermediate',
    equipment: 'Pull-up Bar',
    muscle: 'Back',
    description: 'Bodyweight exercise for back and biceps',
    primaryMuscles: ['Lats', 'Rhomboids'],
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    caloriesPerMinute: 8,
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g'
  },
  {
    id: 'bent-over-row',
    name: 'Bent-over Row',
    category: 'Back',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    muscle: 'Back',
    description: 'Compound back exercise',
    primaryMuscles: ['Lats', 'Rhomboids'],
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    caloriesPerMinute: 9,
    videoUrl: 'https://www.youtube.com/watch?v=9efgcAjQe7E'
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    category: 'Back',
    difficulty: 'Beginner',
    equipment: 'Cable Machine',
    muscle: 'Lats',
    description: 'Machine-based lat exercise',
    primaryMuscles: ['Lats'],
    secondaryMuscles: ['Biceps', 'Rhomboids'],
    caloriesPerMinute: 6,
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc'
  },
  {
    id: 'seated-row',
    name: 'Seated Row',
    category: 'Back',
    difficulty: 'Beginner',
    equipment: 'Cable Machine',
    muscle: 'Back',
    description: 'Seated cable row for back muscles',
    primaryMuscles: ['Rhomboids', 'Middle Traps'],
    secondaryMuscles: ['Lats', 'Biceps'],
    caloriesPerMinute: 6,
    videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74'
  },
  {
    id: 't-bar-row',
    name: 'T-Bar Row',
    category: 'Back',
    difficulty: 'Intermediate',
    equipment: 'T-Bar',
    muscle: 'Back',
    description: 'T-bar rowing exercise',
    primaryMuscles: ['Lats', 'Rhomboids'],
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    caloriesPerMinute: 8,
    videoUrl: 'https://www.youtube.com/watch?v=9efgcAjQe7E'
  },
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    category: 'Back',
    difficulty: 'Beginner',
    equipment: 'Cable Machine',
    muscle: 'Rear Delts',
    description: 'Rear deltoid and upper trap exercise',
    primaryMuscles: ['Rear Delts', 'Upper Traps'],
    secondaryMuscles: ['Rhomboids'],
    caloriesPerMinute: 4,
    videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk'
  },
  {
    id: 'reverse-flyes',
    name: 'Reverse Flyes',
    category: 'Back',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    muscle: 'Rear Delts',
    description: 'Isolation exercise for rear deltoids',
    primaryMuscles: ['Rear Delts'],
    secondaryMuscles: ['Rhomboids'],
    caloriesPerMinute: 4,
    videoUrl: 'https://www.youtube.com/watch?v=6Z15_WdXmVw'
  },

  // LEG EXERCISES
  {
    id: 'squat',
    name: 'Squat',
    category: 'Legs',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    muscle: 'Legs',
    description: 'King of all exercises - compound leg movement',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    caloriesPerMinute: 10,
    videoUrl: 'https://www.youtube.com/watch?v=YaXPRqUwItQ'
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    category: 'Legs',
    difficulty: 'Advanced',
    equipment: 'Barbell',
    muscle: 'Quads',
    description: 'Squat variation with front-loaded weight',
    primaryMuscles: ['Quads', 'Core'],
    secondaryMuscles: ['Glutes', 'Upper Back'],
    caloriesPerMinute: 11,
    videoUrl: 'https://www.youtube.com/watch?v=uYumuL_G_V0'
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    category: 'Legs',
    difficulty: 'Beginner',
    equipment: 'Leg Press Machine',
    muscle: 'Legs',
    description: 'Machine-based leg exercise',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings'],
    caloriesPerMinute: 7,
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ'
  },
  {
    id: 'lunges',
    name: 'Lunges',
    category: 'Legs',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    muscle: 'Legs',
    description: 'Unilateral leg exercise',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    caloriesPerMinute: 6,
    videoUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U'
  },
  {
    id: 'bulgarian-split-squats',
    name: 'Bulgarian Split Squats',
    category: 'Legs',
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    muscle: 'Legs',
    description: 'Single-leg squat variation',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    caloriesPerMinute: 7,
    videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE'
  },
  {
    id: 'leg-curls',
    name: 'Leg Curls',
    category: 'Legs',
    difficulty: 'Beginner',
    equipment: 'Leg Curl Machine',
    muscle: 'Hamstrings',
    description: 'Isolation exercise for hamstrings',
    primaryMuscles: ['Hamstrings'],
    secondaryMuscles: ['Calves'],
    caloriesPerMinute: 4,
    videoUrl: 'https://www.youtube.com/watch?v=0tn5K9NlCfo'
  },
  {
    id: 'leg-extensions',
    name: 'Leg Extensions',
    category: 'Legs',
    difficulty: 'Beginner',
    equipment: 'Leg Extension Machine',
    muscle: 'Quads',
    description: 'Isolation exercise for quadriceps',
    primaryMuscles: ['Quads'],
    secondaryMuscles: [],
    caloriesPerMinute: 4,
    videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0'
  },
  {
    id: 'calf-raises',
    name: 'Calf Raises',
    category: 'Legs',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    muscle: 'Calves',
    description: 'Isolation exercise for calf muscles',
    primaryMuscles: ['Calves'],
    secondaryMuscles: [],
    caloriesPerMinute: 3,
    videoUrl: 'https://www.youtube.com/watch?v=3VcKXNN1lGU'
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    category: 'Legs',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    muscle: 'Hamstrings',
    description: 'Hip-hinge movement for hamstrings and glutes',
    primaryMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Lower Back', 'Core'],
    caloriesPerMinute: 9,
    videoUrl: 'https://www.youtube.com/watch?v=1ED09ZVp4fI'
  },

  // SHOULDER EXERCISES
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    category: 'Shoulders',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    muscle: 'Shoulders',
    description: 'Compound shoulder exercise',
    primaryMuscles: ['Shoulders'],
    secondaryMuscles: ['Triceps', 'Core'],
    caloriesPerMinute: 8,
    videoUrl: 'https://www.youtube.com/watch?v=QAy8dM2p8Vk'
  },
  {
    id: 'lateral-raises',
    name: 'Lateral Raises',
    category: 'Shoulders',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    muscle: 'Side Delts',
    description: 'Isolation exercise for side deltoids',
    primaryMuscles: ['Side Delts'],
    secondaryMuscles: ['Front Delts'],
    caloriesPerMinute: 4,
    videoUrl: 'https://www.youtube.com/watch?v=3VcKXNN1lGU'
  },
  {
    id: 'front-raises',
    name: 'Front Raises',
    category: 'Shoulders',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    muscle: 'Front Delts',
    description: 'Isolation exercise for front deltoids',
    primaryMuscles: ['Front Delts'],
    secondaryMuscles: ['Side Delts'],
    caloriesPerMinute: 4,
    videoUrl: 'https://www.youtube.com/watch?v=-t7fuZ0KhDA'
  },
  {
    id: 'arnold-press',
    name: 'Arnold Press',
    category: 'Shoulders',
    difficulty: 'Intermediate',
    equipment: 'Dumbbells',
    muscle: 'Shoulders',
    description: 'Rotating shoulder press variation',
    primaryMuscles: ['Shoulders'],
    secondaryMuscles: ['Triceps'],
    caloriesPerMinute: 7,
    videoUrl: 'https://www.youtube.com/watch?v=6Z15_WdXmVw'
  },
  {
    id: 'upright-row',
    name: 'Upright Row',
    category: 'Shoulders',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    muscle: 'Shoulders',
    description: 'Shoulder and trap exercise',
    primaryMuscles: ['Side Delts', 'Traps'],
    secondaryMuscles: ['Front Delts', 'Biceps'],
    caloriesPerMinute: 6,
    videoUrl: 'https://www.youtube.com/watch?v=amCU-ziHITM'
  },
  {
    id: 'pike-push-ups',
    name: 'Pike Push-ups',
    category: 'Shoulders',
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    muscle: 'Shoulders',
    description: 'Bodyweight shoulder exercise',
    primaryMuscles: ['Shoulders'],
    secondaryMuscles: ['Triceps', 'Core'],
    caloriesPerMinute: 6,
    videoUrl: 'https://www.youtube.com/watch?v=3VcKXNN1lGU'
  },

  // ARM EXERCISES
  {
    id: 'bicep-curls',
    name: 'Bicep Curls',
    category: 'Arms',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    muscle: 'Biceps',
    description: 'Classic bicep isolation exercise',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    caloriesPerMinute: 4,
    videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo'
  },
  {
    id: 'hammer-curls',
    name: 'Hammer Curls',
    category: 'Arms',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    muscle: 'Biceps',
    description: 'Bicep exercise with neutral grip',
    primaryMuscles: ['Biceps', 'Forearms'],
    secondaryMuscles: [],
    caloriesPerMinute: 4,
    videoUrl: 'https://www.youtube.com/watch?v=TwD-YGVP4Bk'
  },
  {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    category: 'Arms',
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    muscle: 'Triceps',
    description: 'Bodyweight tricep exercise',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Chest', 'Shoulders'],
    caloriesPerMinute: 6,
    videoUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As'
  },
  {
    id: 'tricep-pushdowns',
    name: 'Tricep Pushdowns',
    category: 'Arms',
    difficulty: 'Beginner',
    equipment: 'Cable Machine',
    muscle: 'Triceps',
    description: 'Cable-based tricep isolation',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: [],
    caloriesPerMinute: 4,
    videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU'
  },
  {
    id: 'close-grip-bench-press',
    name: 'Close Grip Bench Press',
    category: 'Arms',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    muscle: 'Triceps',
    description: 'Compound tricep exercise',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Chest', 'Shoulders'],
    caloriesPerMinute: 7,
    videoUrl: 'https://www.youtube.com/watch?v=nEF0bv2FW94'
  },
  {
    id: 'preacher-curls',
    name: 'Preacher Curls',
    category: 'Arms',
    difficulty: 'Beginner',
    equipment: 'Barbell',
    muscle: 'Biceps',
    description: 'Isolated bicep exercise with preacher bench',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    caloriesPerMinute: 4,
    videoUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0'
  },

  // CORE EXERCISES
  {
    id: 'plank',
    name: 'Plank',
    category: 'Core',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    muscle: 'Core',
    description: 'Isometric core strengthening exercise',
    primaryMuscles: ['Core', 'Shoulders'],
    secondaryMuscles: ['Glutes'],
    caloriesPerMinute: 5,
    videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw'
  },
  {
    id: 'crunches',
    name: 'Crunches',
    category: 'Core',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    muscle: 'Abs',
    description: 'Classic abdominal exercise',
    primaryMuscles: ['Abs'],
    secondaryMuscles: ['Obliques'],
    caloriesPerMinute: 4,
    videoUrl: 'https://www.youtube.com/watch?v=Xyd_faXzoEE'
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    category: 'Core',
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    muscle: 'Core',
    description: 'Dynamic core and cardio exercise',
    primaryMuscles: ['Core', 'Shoulders'],
    secondaryMuscles: ['Legs'],
    caloriesPerMinute: 8,
    videoUrl: 'https://www.youtube.com/watch?v=nmwgirgXLYM'
  },
  {
    id: 'russian-twists',
    name: 'Russian Twists',
    category: 'Core',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    muscle: 'Obliques',
    description: 'Rotational core exercise',
    primaryMuscles: ['Obliques'],
    secondaryMuscles: ['Abs'],
    caloriesPerMinute: 5,
    videoUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI'
  },
  {
    id: 'leg-raises',
    name: 'Leg Raises',
    category: 'Core',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    muscle: 'Lower Abs',
    description: 'Lower abdominal exercise',
    primaryMuscles: ['Lower Abs'],
    secondaryMuscles: ['Hip Flexors'],
    caloriesPerMinute: 5,
    videoUrl: 'https://www.youtube.com/watch?v=JB2oyawG9KI'
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    category: 'Core',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    muscle: 'Core',
    description: 'Core stability exercise',
    primaryMuscles: ['Core'],
    secondaryMuscles: ['Hip Flexors'],
    caloriesPerMinute: 4,
    videoUrl: 'https://www.youtube.com/watch?v=g_BYB0R-4Ws'
  },
  {
    id: 'bicycle-crunches',
    name: 'Bicycle Crunches',
    category: 'Core',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    muscle: 'Abs',
    description: 'Dynamic abdominal exercise',
    primaryMuscles: ['Abs', 'Obliques'],
    secondaryMuscles: ['Hip Flexors'],
    caloriesPerMinute: 6,
    videoUrl: 'https://www.youtube.com/watch?v=Iwyvozckjak'
  },
  {
    id: 'hollow-body-hold',
    name: 'Hollow Body Hold',
    category: 'Core',
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    muscle: 'Core',
    description: 'Advanced core isometric exercise',
    primaryMuscles: ['Core'],
    secondaryMuscles: ['Hip Flexors'],
    caloriesPerMinute: 6,
    videoUrl: 'https://www.youtube.com/watch?v=rCXY2vRk6t8'
  }
];

export default exerciseLibrary;


