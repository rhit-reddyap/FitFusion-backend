export interface ExerciseVideo {
  id: string;
  name: string;
  category: 'compound' | 'isolation' | 'cardio' | 'functional' | 'bodyweight';
  muscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  youtubeId: string;
  duration: string;
  description: string;
  benefits: string[];
  tips: string[];
}

export const exerciseVideoLibrary: ExerciseVideo[] = [
  // COMPOUND EXERCISES
  {
    id: 'squat',
    name: 'Barbell Back Squat',
    category: 'compound',
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    difficulty: 'intermediate',
    equipment: ['Barbell', 'Squat Rack'],
    youtubeId: 'YaXPRqUwItQ', // Athlean-X squat tutorial
    duration: '8:45',
    description: 'The king of all exercises - builds lower body strength and power',
    benefits: ['Full body strength', 'Improved mobility', 'Better posture', 'Increased testosterone'],
    tips: ['Keep chest up', 'Knees track over toes', 'Go below parallel', 'Drive through heels']
  },
  {
    id: 'deadlift',
    name: 'Conventional Deadlift',
    category: 'compound',
    muscleGroups: ['Hamstrings', 'Glutes', 'Erector Spinae', 'Traps', 'Lats'],
    difficulty: 'intermediate',
    equipment: ['Barbell', 'Plates'],
    youtubeId: 'op9kVnSso6Q', // Alan Thrall deadlift tutorial
    duration: '12:30',
    description: 'The ultimate posterior chain builder and functional strength exercise',
    benefits: ['Full body strength', 'Improved posture', 'Better hip mobility', 'Increased power'],
    tips: ['Keep bar close to body', 'Neutral spine', 'Hip hinge movement', 'Full extension at top']
  },
  {
    id: 'bench_press',
    name: 'Barbell Bench Press',
    category: 'compound',
    muscleGroups: ['Pectorals', 'Anterior Deltoids', 'Triceps'],
    difficulty: 'intermediate',
    equipment: ['Barbell', 'Bench'],
    youtubeId: 'gRVjAtPip0Y', // Jeff Nippard bench press tutorial
    duration: '10:15',
    description: 'The gold standard for upper body pushing strength',
    benefits: ['Chest development', 'Upper body strength', 'Improved pressing power'],
    tips: ['Retract shoulder blades', 'Full range of motion', 'Control the descent', 'Drive through feet']
  },
  {
    id: 'overhead_press',
    name: 'Overhead Press',
    category: 'compound',
    muscleGroups: ['Deltoids', 'Triceps', 'Core', 'Upper Traps'],
    difficulty: 'intermediate',
    equipment: ['Barbell'],
    youtubeId: '5y3fVd7J64A', // Starting Strength overhead press
    duration: '7:20',
    description: 'Builds shoulder strength and stability',
    benefits: ['Shoulder strength', 'Core stability', 'Improved posture'],
    tips: ['Tight core', 'Press straight up', 'Full lockout', 'Control the descent']
  },
  {
    id: 'bent_over_row',
    name: 'Bent-Over Barbell Row',
    category: 'compound',
    muscleGroups: ['Lats', 'Rhomboids', 'Middle Traps', 'Rear Delts', 'Biceps'],
    difficulty: 'intermediate',
    equipment: ['Barbell'],
    youtubeId: 'kZlXw-p88kI', // Athlean-X row tutorial
    duration: '6:45',
    description: 'Essential for balanced upper body development',
    benefits: ['Back strength', 'Improved posture', 'Balanced development'],
    tips: ['Hinge at hips', 'Pull to lower chest', 'Squeeze shoulder blades', 'Control the weight']
  },
  {
    id: 'pull_ups',
    name: 'Pull-ups',
    category: 'compound',
    muscleGroups: ['Lats', 'Biceps', 'Rear Delts', 'Rhomboids'],
    difficulty: 'intermediate',
    equipment: ['Pull-up Bar'],
    youtubeId: 'eGo4IYlbE5g', // Calisthenic Movement pull-up tutorial
    duration: '9:30',
    description: 'Bodyweight back builder and strength test',
    benefits: ['Upper body strength', 'Grip strength', 'Core engagement'],
    tips: ['Full range of motion', 'Dead hang start', 'Pull chest to bar', 'Control descent']
  },
  {
    id: 'dips',
    name: 'Dips',
    category: 'compound',
    muscleGroups: ['Triceps', 'Lower Pectorals', 'Anterior Deltoids'],
    difficulty: 'intermediate',
    equipment: ['Dip Bars'],
    youtubeId: '2g8LUVSxqp4', // Athlean-X dips tutorial
    duration: '5:15',
    description: 'Bodyweight tricep and chest builder',
    benefits: ['Tricep strength', 'Chest development', 'Shoulder stability'],
    tips: ['Lean slightly forward', 'Full range of motion', 'Control the movement', 'Engage core']
  },
  {
    id: 'incline_press',
    name: 'Incline Barbell Press',
    category: 'compound',
    muscleGroups: ['Upper Pectorals', 'Anterior Deltoids', 'Triceps'],
    difficulty: 'intermediate',
    equipment: ['Barbell', 'Incline Bench'],
    youtubeId: '8iPEnov-lmU', // Jeff Nippard incline press
    duration: '7:45',
    description: 'Targets upper chest development',
    benefits: ['Upper chest', 'Shoulder strength', 'Improved aesthetics'],
    tips: ['30-45 degree angle', 'Retract shoulder blades', 'Full range of motion', 'Control weight']
  },
  {
    id: 'romanian_deadlift',
    name: 'Romanian Deadlift',
    category: 'compound',
    muscleGroups: ['Hamstrings', 'Glutes', 'Erector Spinae'],
    difficulty: 'intermediate',
    equipment: ['Barbell'],
    youtubeId: 'op9kVnSso6Q', // Alan Thrall RDL tutorial
    duration: '6:20',
    description: 'Hip hinge movement for posterior chain',
    benefits: ['Hamstring strength', 'Glute development', 'Hip mobility'],
    tips: ['Hip hinge pattern', 'Keep bar close', 'Feel hamstring stretch', 'Drive hips forward']
  },
  {
    id: 'front_squat',
    name: 'Front Squat',
    category: 'compound',
    muscleGroups: ['Quadriceps', 'Core', 'Upper Back', 'Glutes'],
    difficulty: 'advanced',
    equipment: ['Barbell', 'Squat Rack'],
    youtubeId: 'v-mQm_droHg', // Starting Strength front squat
    duration: '8:15',
    description: 'Advanced squat variation with front rack position',
    benefits: ['Core strength', 'Quad development', 'Improved mobility'],
    tips: ['Clean grip', 'Elbows up', 'Upright torso', 'Full depth']
  },

  // ISOLATION EXERCISES
  {
    id: 'bicep_curls',
    name: 'Barbell Bicep Curls',
    category: 'isolation',
    muscleGroups: ['Biceps'],
    difficulty: 'beginner',
    equipment: ['Barbell'],
    youtubeId: 'ykJmrZ5v0Oo', // Athlean-X bicep curls
    duration: '4:30',
    description: 'Classic bicep builder',
    benefits: ['Bicep size', 'Arm strength', 'Grip strength'],
    tips: ['Full range of motion', 'Control the weight', 'Squeeze at top', 'No swinging']
  },
  {
    id: 'tricep_extensions',
    name: 'Overhead Tricep Extensions',
    category: 'isolation',
    muscleGroups: ['Triceps'],
    difficulty: 'beginner',
    equipment: ['Dumbbell'],
    youtubeId: 'Bdqz_qZqas0', // Jeff Nippard tricep extensions
    duration: '5:45',
    description: 'Isolates tricep development',
    benefits: ['Tricep size', 'Arm definition', 'Lockout strength'],
    tips: ['Keep elbows in', 'Full extension', 'Control the stretch', 'Stable core']
  },
  {
    id: 'lateral_raises',
    name: 'Lateral Raises',
    category: 'isolation',
    muscleGroups: ['Lateral Deltoids'],
    difficulty: 'beginner',
    equipment: ['Dumbbells'],
    youtubeId: '3VcKXr1n1YI', // Athlean-X lateral raises
    duration: '4:15',
    description: 'Builds shoulder width',
    benefits: ['Shoulder width', 'Deltoid development', 'Improved posture'],
    tips: ['Lead with pinkies', 'Slight forward angle', 'Control the weight', 'Full range']
  },
  {
    id: 'rear_delt_flyes',
    name: 'Rear Delt Flyes',
    category: 'isolation',
    muscleGroups: ['Rear Deltoids', 'Rhomboids'],
    difficulty: 'beginner',
    equipment: ['Dumbbells'],
    youtubeId: 'rep-qVOkqgk', // Athlean-X rear delt flyes
    duration: '3:45',
    description: 'Targets rear deltoids for balanced shoulders',
    benefits: ['Rear delt strength', 'Posture improvement', 'Shoulder balance'],
    tips: ['Bend forward', 'Squeeze shoulder blades', 'Control the movement', 'Light weight']
  },
  {
    id: 'leg_press',
    name: 'Leg Press',
    category: 'isolation',
    muscleGroups: ['Quadriceps', 'Glutes'],
    difficulty: 'beginner',
    equipment: ['Leg Press Machine'],
    youtubeId: 'IZxyjW7MPJQ', // Athlean-X leg press
    duration: '6:30',
    description: 'Machine-based leg builder',
    benefits: ['Leg strength', 'Quad development', 'Safe progression'],
    tips: ['Full range of motion', 'Knees track toes', 'Control the weight', 'Don\'t lock out']
  },
  {
    id: 'leg_curls',
    name: 'Leg Curls',
    category: 'isolation',
    muscleGroups: ['Hamstrings'],
    difficulty: 'beginner',
    equipment: ['Leg Curl Machine'],
    youtubeId: '0tn5K9NlCfo', // Athlean-X leg curls
    duration: '4:20',
    description: 'Isolates hamstring development',
    benefits: ['Hamstring strength', 'Knee health', 'Balanced legs'],
    tips: ['Full range of motion', 'Squeeze at top', 'Control the weight', 'Stable core']
  },
  {
    id: 'calf_raises',
    name: 'Standing Calf Raises',
    category: 'isolation',
    muscleGroups: ['Calves'],
    difficulty: 'beginner',
    equipment: ['Calf Raise Machine'],
    youtubeId: 'YyvSfVjQeL0', // Athlean-X calf raises
    duration: '3:30',
    description: 'Builds calf strength and size',
    benefits: ['Calf development', 'Ankle strength', 'Lower leg power'],
    tips: ['Full range of motion', 'Pause at top', 'Control the descent', 'High reps']
  },
  {
    id: 'chest_flyes',
    name: 'Dumbbell Chest Flyes',
    category: 'isolation',
    muscleGroups: ['Pectorals'],
    difficulty: 'beginner',
    equipment: ['Dumbbells', 'Bench'],
    youtubeId: 'eozdVDA78K0', // Athlean-X chest flyes
    duration: '5:00',
    description: 'Isolates chest muscles',
    benefits: ['Chest stretch', 'Muscle definition', 'Improved range'],
    tips: ['Slight bend in elbows', 'Feel the stretch', 'Control the weight', 'Squeeze at top']
  },
  {
    id: 'face_pulls',
    name: 'Face Pulls',
    category: 'isolation',
    muscleGroups: ['Rear Deltoids', 'Rhomboids', 'External Rotators'],
    difficulty: 'beginner',
    equipment: ['Cable Machine'],
    youtubeId: 'rep-qVOkqgk', // Athlean-X face pulls
    duration: '4:45',
    description: 'Essential for shoulder health and posture',
    benefits: ['Shoulder health', 'Posture improvement', 'Rear delt strength'],
    tips: ['Pull to face', 'External rotation', 'Squeeze shoulder blades', 'Light weight']
  },
  {
    id: 'hammer_curls',
    name: 'Hammer Curls',
    category: 'isolation',
    muscleGroups: ['Biceps', 'Brachialis'],
    difficulty: 'beginner',
    equipment: ['Dumbbells'],
    youtubeId: 'TwD-YGVP4Bk', // Athlean-X hammer curls
    duration: '4:00',
    description: 'Builds bicep peak and brachialis',
    benefits: ['Bicep peak', 'Brachialis development', 'Grip strength'],
    tips: ['Neutral grip', 'Full range of motion', 'Control the weight', 'Squeeze at top']
  },

  // FUNCTIONAL EXERCISES
  {
    id: 'kettlebell_swings',
    name: 'Kettlebell Swings',
    category: 'functional',
    muscleGroups: ['Hamstrings', 'Glutes', 'Core', 'Shoulders'],
    difficulty: 'intermediate',
    equipment: ['Kettlebell'],
    youtubeId: 'YSxHrfE4bYE', // Pavel Tsatsouline kettlebell swings
    duration: '7:15',
    description: 'Explosive hip hinge movement',
    benefits: ['Power development', 'Cardio fitness', 'Hip mobility'],
    tips: ['Hip hinge pattern', 'Explosive movement', 'Stand tall at top', 'Control the weight']
  },
  {
    id: 'turkish_get_ups',
    name: 'Turkish Get-ups',
    category: 'functional',
    muscleGroups: ['Full Body', 'Core', 'Shoulders'],
    difficulty: 'advanced',
    equipment: ['Kettlebell'],
    youtubeId: '0bWRPC49-KI', // Pavel Tsatsouline Turkish get-ups
    duration: '10:30',
    description: 'Complex full-body movement',
    benefits: ['Full body strength', 'Mobility', 'Stability', 'Coordination'],
    tips: ['Slow and controlled', 'Keep eyes on weight', 'Full range of motion', 'Practice without weight first']
  },
  {
    id: 'farmer_walks',
    name: 'Farmer\'s Walks',
    category: 'functional',
    muscleGroups: ['Grip', 'Core', 'Traps', 'Full Body'],
    difficulty: 'intermediate',
    equipment: ['Heavy Dumbbells'],
    youtubeId: 'FkkaEr2W4dM', // Athlean-X farmer's walks
    duration: '5:45',
    description: 'Functional strength and grip builder',
    benefits: ['Grip strength', 'Core stability', 'Postural strength'],
    tips: ['Heavy weight', 'Upright posture', 'Controlled steps', 'Squeeze handles']
  },
  {
    id: 'battle_ropes',
    name: 'Battle Ropes',
    category: 'functional',
    muscleGroups: ['Core', 'Shoulders', 'Arms', 'Cardio'],
    difficulty: 'intermediate',
    equipment: ['Battle Ropes'],
    youtubeId: '8sObwkqI9lw', // Athlean-X battle ropes
    duration: '6:20',
    description: 'High-intensity conditioning',
    benefits: ['Cardio fitness', 'Core strength', 'Power endurance'],
    tips: ['Stable stance', 'Engage core', 'Full arm movement', 'Controlled breathing']
  },
  {
    id: 'sled_pushes',
    name: 'Sled Pushes',
    category: 'functional',
    muscleGroups: ['Legs', 'Core', 'Cardio'],
    difficulty: 'intermediate',
    equipment: ['Sled'],
    youtubeId: 'FkkaEr2W4dM', // Athlean-X sled work
    duration: '4:30',
    description: 'Functional leg power and conditioning',
    benefits: ['Leg power', 'Cardio fitness', 'Mental toughness'],
    tips: ['Low body position', 'Drive through legs', 'Controlled pace', 'Full extension']
  },

  // BODYWEIGHT EXERCISES
  {
    id: 'push_ups',
    name: 'Push-ups',
    category: 'bodyweight',
    muscleGroups: ['Pectorals', 'Triceps', 'Anterior Deltoids', 'Core'],
    difficulty: 'beginner',
    equipment: ['Bodyweight'],
    youtubeId: 'IODxDxX7oi4', // Calisthenic Movement push-ups
    duration: '8:15',
    description: 'Classic bodyweight upper body exercise',
    benefits: ['Upper body strength', 'Core stability', 'No equipment needed'],
    tips: ['Straight body line', 'Full range of motion', 'Controlled movement', 'Engage core']
  },
  {
    id: 'pull_ups_variations',
    name: 'Pull-up Variations',
    category: 'bodyweight',
    muscleGroups: ['Lats', 'Biceps', 'Rear Delts', 'Core'],
    difficulty: 'intermediate',
    equipment: ['Pull-up Bar'],
    youtubeId: 'eGo4IYlbE5g', // Calisthenic Movement pull-ups
    duration: '9:45',
    description: 'Multiple grip variations for back development',
    benefits: ['Back strength', 'Grip strength', 'Core engagement'],
    tips: ['Full range of motion', 'Different grips', 'Controlled movement', 'Progressive overload']
  },
  {
    id: 'dips_variations',
    name: 'Dip Variations',
    category: 'bodyweight',
    muscleGroups: ['Triceps', 'Lower Pectorals', 'Anterior Deltoids'],
    difficulty: 'intermediate',
    equipment: ['Dip Bars'],
    youtubeId: '2g8LUVSxqp4', // Athlean-X dips
    duration: '6:30',
    description: 'Bodyweight tricep and chest builder',
    benefits: ['Tricep strength', 'Chest development', 'Shoulder stability'],
    tips: ['Full range of motion', 'Lean forward for chest', 'Control the movement', 'Engage core']
  },
  {
    id: 'handstand_push_ups',
    name: 'Handstand Push-ups',
    category: 'bodyweight',
    muscleGroups: ['Shoulders', 'Triceps', 'Core'],
    difficulty: 'advanced',
    equipment: ['Wall'],
    youtubeId: 'N7Fy6mYhxqk', // Calisthenic Movement handstand push-ups
    duration: '12:00',
    description: 'Advanced bodyweight shoulder exercise',
    benefits: ['Shoulder strength', 'Core stability', 'Balance', 'Body control'],
    tips: ['Start against wall', 'Progress slowly', 'Strong core', 'Practice handstands first']
  },
  {
    id: 'muscle_ups',
    name: 'Muscle-ups',
    category: 'bodyweight',
    muscleGroups: ['Lats', 'Triceps', 'Chest', 'Core'],
    difficulty: 'advanced',
    equipment: ['Pull-up Bar'],
    youtubeId: 'N7Fy6mYhxqk', // Calisthenic Movement muscle-ups
    duration: '15:30',
    description: 'Ultimate bodyweight strength test',
    benefits: ['Full body strength', 'Power', 'Coordination', 'Mental toughness'],
    tips: ['Master pull-ups first', 'Explosive movement', 'False grip', 'Practice transitions']
  },
  {
    id: 'pistol_squats',
    name: 'Pistol Squats',
    category: 'bodyweight',
    muscleGroups: ['Quadriceps', 'Glutes', 'Core', 'Balance'],
    difficulty: 'advanced',
    equipment: ['Bodyweight'],
    youtubeId: 'N7Fy6mYhxqk', // Calisthenic Movement pistol squats
    duration: '10:45',
    description: 'Single-leg squat variation',
    benefits: ['Single leg strength', 'Balance', 'Mobility', 'Core stability'],
    tips: ['Start with assisted', 'Full range of motion', 'Keep chest up', 'Practice balance']
  },
  {
    id: 'l_sits',
    name: 'L-sits',
    category: 'bodyweight',
    muscleGroups: ['Core', 'Triceps', 'Shoulders'],
    difficulty: 'advanced',
    equipment: ['Parallel Bars'],
    youtubeId: 'N7Fy6mYhxqk', // Calisthenic Movement L-sits
    duration: '8:30',
    description: 'Core strength and shoulder stability',
    benefits: ['Core strength', 'Shoulder stability', 'Body control'],
    tips: ['Start with tuck L-sit', 'Strong core', 'Push through shoulders', 'Progress slowly']
  },
  {
    id: 'planche_progression',
    name: 'Planche Progression',
    category: 'bodyweight',
    muscleGroups: ['Shoulders', 'Core', 'Triceps', 'Full Body'],
    difficulty: 'advanced',
    equipment: ['Floor'],
    youtubeId: 'N7Fy6mYhxqk', // Calisthenic Movement planche
    duration: '18:00',
    description: 'Ultimate bodyweight strength feat',
    benefits: ['Incredible strength', 'Body control', 'Mental discipline'],
    tips: ['Start with frog stand', 'Strong core', 'Years of practice', 'Perfect form']
  },
  {
    id: 'human_flag',
    name: 'Human Flag',
    category: 'bodyweight',
    muscleGroups: ['Core', 'Shoulders', 'Lats', 'Full Body'],
    difficulty: 'advanced',
    equipment: ['Vertical Pole'],
    youtubeId: 'N7Fy6mYhxqk', // Calisthenic Movement human flag
    duration: '12:15',
    description: 'Side lever strength demonstration',
    benefits: ['Core strength', 'Shoulder stability', 'Body control'],
    tips: ['Strong core', 'Grip strength', 'Side plank progression', 'Years of training']
  },
  {
    id: 'front_lever',
    name: 'Front Lever',
    category: 'bodyweight',
    muscleGroups: ['Lats', 'Core', 'Shoulders', 'Full Body'],
    difficulty: 'advanced',
    equipment: ['Pull-up Bar'],
    youtubeId: 'N7Fy6mYhxqk', // Calisthenic Movement front lever
    duration: '14:30',
    description: 'Horizontal pulling strength',
    benefits: ['Back strength', 'Core strength', 'Body control'],
    tips: ['Master pull-ups', 'Tuck lever first', 'Strong core', 'Progressive training']
  },

  // CARDIO EXERCISES
  {
    id: 'burpees',
    name: 'Burpees',
    category: 'cardio',
    muscleGroups: ['Full Body', 'Cardio'],
    difficulty: 'intermediate',
    equipment: ['Bodyweight'],
    youtubeId: 'TU8QYVc0J6c', // Athlean-X burpees
    duration: '5:30',
    description: 'Full-body cardio exercise',
    benefits: ['Cardio fitness', 'Full body strength', 'Power endurance'],
    tips: ['Smooth transitions', 'Full range of motion', 'Controlled breathing', 'Moderate pace']
  },
  {
    id: 'mountain_climbers',
    name: 'Mountain Climbers',
    category: 'cardio',
    muscleGroups: ['Core', 'Shoulders', 'Legs', 'Cardio'],
    difficulty: 'beginner',
    equipment: ['Bodyweight'],
    youtubeId: 'cnyTODMEhJ4', // Athlean-X mountain climbers
    duration: '4:15',
    description: 'High-intensity cardio exercise',
    benefits: ['Cardio fitness', 'Core strength', 'Coordination'],
    tips: ['Stable plank position', 'Quick leg movement', 'Engage core', 'Controlled breathing']
  },
  {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    category: 'cardio',
    muscleGroups: ['Full Body', 'Cardio'],
    difficulty: 'beginner',
    equipment: ['Bodyweight'],
    youtubeId: 'cnyTODMEhJ4', // Athlean-X jumping jacks
    duration: '3:30',
    description: 'Classic cardio warm-up',
    benefits: ['Cardio fitness', 'Coordination', 'Warm-up'],
    tips: ['Full arm movement', 'Land softly', 'Controlled pace', 'Good posture']
  },
  {
    id: 'high_knees',
    name: 'High Knees',
    category: 'cardio',
    muscleGroups: ['Legs', 'Core', 'Cardio'],
    difficulty: 'beginner',
    equipment: ['Bodyweight'],
    youtubeId: 'cnyTODMEhJ4', // Athlean-X high knees
    duration: '3:45',
    description: 'Running in place with high knees',
    benefits: ['Cardio fitness', 'Leg strength', 'Coordination'],
    tips: ['Knees to chest', 'Quick movement', 'Land on balls of feet', 'Upright posture']
  },
  {
    id: 'jump_squats',
    name: 'Jump Squats',
    category: 'cardio',
    muscleGroups: ['Legs', 'Glutes', 'Cardio'],
    difficulty: 'intermediate',
    equipment: ['Bodyweight'],
    youtubeId: 'cnyTODMEhJ4', // Athlean-X jump squats
    duration: '4:00',
    description: 'Explosive squat variation',
    benefits: ['Power development', 'Cardio fitness', 'Leg strength'],
    tips: ['Land softly', 'Full squat depth', 'Explosive movement', 'Controlled landing']
  },
  {
    id: 'box_jumps',
    name: 'Box Jumps',
    category: 'cardio',
    muscleGroups: ['Legs', 'Glutes', 'Core', 'Cardio'],
    difficulty: 'intermediate',
    equipment: ['Plyometric Box'],
    youtubeId: 'cnyTODMEhJ4', // Athlean-X box jumps
    duration: '5:15',
    description: 'Plyometric leg power exercise',
    benefits: ['Power development', 'Leg strength', 'Coordination'],
    tips: ['Start low', 'Land softly', 'Full extension', 'Controlled descent']
  },
  {
    id: 'battle_ropes_cardio',
    name: 'Battle Ropes (Cardio)',
    category: 'cardio',
    muscleGroups: ['Core', 'Shoulders', 'Arms', 'Cardio'],
    difficulty: 'intermediate',
    equipment: ['Battle Ropes'],
    youtubeId: '8sObwkqI9lw', // Athlean-X battle ropes
    duration: '6:45',
    description: 'High-intensity rope conditioning',
    benefits: ['Cardio fitness', 'Core strength', 'Power endurance'],
    tips: ['Stable stance', 'Engage core', 'Full arm movement', 'Controlled breathing']
  },
  {
    id: 'rowing_machine',
    name: 'Rowing Machine',
    category: 'cardio',
    muscleGroups: ['Full Body', 'Cardio'],
    difficulty: 'intermediate',
    equipment: ['Rowing Machine'],
    youtubeId: 'cnyTODMEhJ4', // Athlean-X rowing
    duration: '8:30',
    description: 'Full-body cardio exercise',
    benefits: ['Cardio fitness', 'Full body strength', 'Low impact'],
    tips: ['Proper form', 'Full range of motion', 'Controlled pace', 'Consistent rhythm']
  },
  {
    id: 'assault_bike',
    name: 'Assault Bike',
    category: 'cardio',
    muscleGroups: ['Full Body', 'Cardio'],
    difficulty: 'intermediate',
    equipment: ['Assault Bike'],
    youtubeId: 'cnyTODMEhJ4', // Athlean-X assault bike
    duration: '7:15',
    description: 'High-intensity cardio machine',
    benefits: ['Cardio fitness', 'Full body workout', 'Mental toughness'],
    tips: ['Consistent pace', 'Full range of motion', 'Controlled breathing', 'Progressive intensity']
  },
  {
    id: 'treadmill_sprints',
    name: 'Treadmill Sprints',
    category: 'cardio',
    muscleGroups: ['Legs', 'Cardio'],
    difficulty: 'intermediate',
    equipment: ['Treadmill'],
    youtubeId: 'cnyTODMEhJ4', // Athlean-X treadmill work
    duration: '6:00',
    description: 'High-intensity interval training',
    benefits: ['Cardio fitness', 'Leg power', 'Fat burning'],
    tips: ['Warm up first', 'Progressive intensity', 'Controlled breathing', 'Cool down']
  },

  // ADDITIONAL COMPOUND EXERCISES
  {
    id: 'clean_and_press',
    name: 'Clean and Press',
    category: 'compound',
    muscleGroups: ['Full Body', 'Power'],
    difficulty: 'advanced',
    equipment: ['Barbell'],
    youtubeId: 'op9kVnSso6Q', // Alan Thrall clean and press
    duration: '11:45',
    description: 'Olympic lift for power development',
    benefits: ['Power development', 'Full body strength', 'Coordination'],
    tips: ['Learn technique first', 'Start light', 'Full extension', 'Controlled descent']
  },
  {
    id: 'snatch',
    name: 'Snatch',
    category: 'compound',
    muscleGroups: ['Full Body', 'Power'],
    difficulty: 'advanced',
    equipment: ['Barbell'],
    youtubeId: 'op9kVnSso6Q', // Alan Thrall snatch
    duration: '13:30',
    description: 'Complex Olympic lift',
    benefits: ['Power development', 'Mobility', 'Coordination', 'Full body strength'],
    tips: ['Professional coaching', 'Start with PVC pipe', 'Perfect technique', 'Progressive loading']
  },
  {
    id: 'thruster',
    name: 'Thruster',
    category: 'compound',
    muscleGroups: ['Full Body', 'Power'],
    difficulty: 'intermediate',
    equipment: ['Barbell'],
    youtubeId: 'cnyTODMEhJ4', // Athlean-X thruster
    duration: '6:45',
    description: 'Front squat to overhead press',
    benefits: ['Power development', 'Full body strength', 'Cardio fitness'],
    tips: ['Smooth transition', 'Full range of motion', 'Controlled movement', 'Progressive loading']
  },
  {
    id: 'wall_ball_shots',
    name: 'Wall Ball Shots',
    category: 'compound',
    muscleGroups: ['Full Body', 'Power'],
    difficulty: 'intermediate',
    equipment: ['Medicine Ball', 'Wall'],
    youtubeId: 'cnyTODMEhJ4', // Athlean-X wall ball
    duration: '5:30',
    description: 'Full-body power exercise',
    benefits: ['Power development', 'Cardio fitness', 'Full body strength'],
    tips: ['Proper squat depth', 'Full extension', 'Controlled movement', 'Appropriate weight']
  },
  {
    id: 'kettlebell_clean',
    name: 'Kettlebell Clean',
    category: 'compound',
    muscleGroups: ['Full Body', 'Power'],
    difficulty: 'intermediate',
    equipment: ['Kettlebell'],
    youtubeId: 'YSxHrfE4bYE', // Pavel Tsatsouline kettlebell clean
    duration: '8:15',
    description: 'Kettlebell power movement',
    benefits: ['Power development', 'Full body strength', 'Coordination'],
    tips: ['Hip hinge pattern', 'Explosive movement', 'Rack position', 'Controlled descent']
  }
];

export const getExerciseById = (id: string): ExerciseVideo | undefined => {
  return exerciseVideoLibrary.find(exercise => exercise.id === id);
};

export const getExercisesByCategory = (category: string): ExerciseVideo[] => {
  return exerciseVideoLibrary.filter(exercise => exercise.category === category);
};

export const getExercisesByDifficulty = (difficulty: string): ExerciseVideo[] => {
  return exerciseVideoLibrary.filter(exercise => exercise.difficulty === difficulty);
};

export const getExercisesByMuscleGroup = (muscleGroup: string): ExerciseVideo[] => {
  return exerciseVideoLibrary.filter(exercise => 
    exercise.muscleGroups.some(muscle => 
      muscle.toLowerCase().includes(muscleGroup.toLowerCase())
    )
  );
};









