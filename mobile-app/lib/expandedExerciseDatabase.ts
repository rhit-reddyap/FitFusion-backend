// Expanded Exercise Database with comprehensive exercises for all muscle groups

export interface ExerciseData {
  id: string;
  name: string;
  muscle: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  difficulty: string;
  instructions: string[];
  formTips: string[];
  commonMistakes: string[];
}

export const expandedExerciseDatabase: ExerciseData[] = [
  // CHEST EXERCISES
  {
    id: 'push_up',
    name: 'Push-ups',
    muscle: 'Chest',
    primaryMuscles: ['chest', 'anterior_deltoids', 'triceps'],
    secondaryMuscles: ['core', 'serratus_anterior'],
    equipment: ['bodyweight'],
    difficulty: 'Beginner',
    instructions: [
      'Start in plank position with hands slightly wider than shoulders',
      'Lower body until chest nearly touches ground',
      'Push back up to starting position',
      'Keep core tight throughout movement'
    ],
    formTips: [
      'Keep body in straight line',
      'Don\'t let hips sag or pike up',
      'Full range of motion is key'
    ],
    commonMistakes: [
      'Incomplete range of motion',
      'Flaring elbows too wide',
      'Sagging hips'
    ]
  },
  {
    id: 'bench_press',
    name: 'Bench Press',
    muscle: 'Chest',
    primaryMuscles: ['chest', 'anterior_deltoids', 'triceps'],
    secondaryMuscles: ['serratus_anterior'],
    equipment: ['barbell', 'bench'],
    difficulty: 'Intermediate',
    instructions: [
      'Lie on bench with feet flat on floor',
      'Grip bar slightly wider than shoulders',
      'Lower bar to chest with control',
      'Press up explosively'
    ],
    formTips: [
      'Retract shoulder blades',
      'Keep core tight',
      'Drive through heels'
    ],
    commonMistakes: [
      'Bouncing bar off chest',
      'Flaring elbows too wide',
      'Lifting feet off ground'
    ]
  },
  {
    id: 'incline_dumbbell_press',
    name: 'Incline Dumbbell Press',
    muscle: 'Chest',
    primaryMuscles: ['upper_chest', 'anterior_deltoids', 'triceps'],
    secondaryMuscles: ['serratus_anterior'],
    equipment: ['dumbbells', 'incline_bench'],
    difficulty: 'Intermediate',
    instructions: [
      'Set bench to 30-45 degree incline',
      'Start with dumbbells at chest level',
      'Press up and slightly together',
      'Lower with control'
    ],
    formTips: [
      'Focus on upper chest contraction',
      'Don\'t over-arch back',
      'Control the negative'
    ],
    commonMistakes: [
      'Too steep incline angle',
      'Using too much weight',
      'Poor range of motion'
    ]
  },
  {
    id: 'dumbbell_flyes',
    name: 'Dumbbell Flyes',
    muscle: 'Chest',
    primaryMuscles: ['chest', 'anterior_deltoids'],
    secondaryMuscles: ['serratus_anterior'],
    equipment: ['dumbbells', 'bench'],
    difficulty: 'Beginner',
    instructions: [
      'Lie on bench with dumbbells',
      'Start with arms extended, slight bend in elbows',
      'Lower dumbbells in wide arc',
      'Feel stretch in chest',
      'Bring dumbbells together with slight bend'
    ],
    formTips: [
      'Keep slight bend in elbows',
      'Focus on chest stretch',
      'Don\'t go too deep',
      'Control the movement'
    ],
    commonMistakes: [
      'Straight arms (elbow injury risk)',
      'Too deep stretch',
      'Using too much weight',
      'Poor control'
    ]
  },
  {
    id: 'decline_bench_press',
    name: 'Decline Bench Press',
    muscle: 'Chest',
    primaryMuscles: ['lower_chest', 'anterior_deltoids', 'triceps'],
    secondaryMuscles: ['serratus_anterior'],
    equipment: ['barbell', 'decline_bench'],
    difficulty: 'Intermediate',
    instructions: [
      'Set bench to 15-30 degree decline',
      'Secure feet in foot rests',
      'Grip bar slightly wider than shoulders',
      'Lower to lower chest',
      'Press up explosively'
    ],
    formTips: [
      'Keep core tight',
      'Control the descent',
      'Full range of motion'
    ],
    commonMistakes: [
      'Too steep decline',
      'Bouncing off chest',
      'Poor foot positioning'
    ]
  },
  {
    id: 'cable_crossover',
    name: 'Cable Crossover',
    muscle: 'Chest',
    primaryMuscles: ['chest', 'anterior_deltoids'],
    secondaryMuscles: ['serratus_anterior'],
    equipment: ['cables'],
    difficulty: 'Intermediate',
    instructions: [
      'Set cables at shoulder height',
      'Step forward with slight lean',
      'Bring hands together in front',
      'Feel chest squeeze',
      'Return with control'
    ],
    formTips: [
      'Slight forward lean',
      'Focus on chest contraction',
      'Control the stretch'
    ],
    commonMistakes: [
      'Too much weight',
      'Poor posture',
      'Incomplete range'
    ]
  },

  // TRICEPS EXERCISES
  {
    id: 'tricep_dips',
    name: 'Tricep Dips',
    muscle: 'Triceps',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['anterior_deltoids', 'chest'],
    equipment: ['dip_bars', 'bodyweight'],
    difficulty: 'Intermediate',
    instructions: [
      'Support body on dip bars',
      'Lower body by bending elbows',
      'Keep torso upright',
      'Press up to starting position',
      'Squeeze triceps at top'
    ],
    formTips: [
      'Keep elbows close to body',
      'Don\'t go too deep',
      'Control the movement',
      'Full extension at top'
    ],
    commonMistakes: [
      'Going too deep',
      'Flaring elbows',
      'Using momentum',
      'Incomplete range'
    ]
  },
  {
    id: 'close_grip_bench_press',
    name: 'Close Grip Bench Press',
    muscle: 'Triceps',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['chest', 'anterior_deltoids'],
    equipment: ['barbell', 'bench'],
    difficulty: 'Intermediate',
    instructions: [
      'Lie on bench with narrow grip',
      'Hands shoulder-width apart',
      'Lower bar to chest',
      'Press up focusing on triceps',
      'Keep elbows close to body'
    ],
    formTips: [
      'Narrow grip',
      'Elbows close to body',
      'Focus on triceps'
    ],
    commonMistakes: [
      'Too wide grip',
      'Flaring elbows',
      'Using too much weight'
    ]
  },
  {
    id: 'overhead_tricep_extension',
    name: 'Overhead Tricep Extension',
    muscle: 'Triceps',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['core'],
    equipment: ['dumbbell'],
    difficulty: 'Beginner',
    instructions: [
      'Hold dumbbell overhead with both hands',
      'Lower behind head',
      'Extend arms back up',
      'Keep core tight'
    ],
    formTips: [
      'Keep elbows close',
      'Control the movement',
      'Full extension'
    ],
    commonMistakes: [
      'Flaring elbows',
      'Using momentum',
      'Poor posture'
    ]
  },
  {
    id: 'tricep_pushdowns',
    name: 'Tricep Pushdowns',
    muscle: 'Triceps',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['core'],
    equipment: ['cables'],
    difficulty: 'Beginner',
    instructions: [
      'Stand at cable machine',
      'Grip bar with overhand grip',
      'Keep elbows at sides',
      'Push down until arms extended',
      'Return with control'
    ],
    formTips: [
      'Elbows stationary',
      'Focus on triceps',
      'Full range of motion'
    ],
    commonMistakes: [
      'Moving elbows',
      'Using momentum',
      'Incomplete extension'
    ]
  },
  {
    id: 'diamond_push_ups',
    name: 'Diamond Push-ups',
    muscle: 'Triceps',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['chest', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'Intermediate',
    instructions: [
      'Start in push-up position',
      'Place hands close together forming diamond',
      'Lower chest to hands',
      'Push up focusing on triceps'
    ],
    formTips: [
      'Hands close together',
      'Focus on triceps',
      'Keep body straight'
    ],
    commonMistakes: [
      'Hands too wide',
      'Poor form',
      'Incomplete range'
    ]
  },
  {
    id: 'lying_tricep_extension',
    name: 'Lying Tricep Extension',
    muscle: 'Triceps',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['core'],
    equipment: ['dumbbells', 'bench'],
    difficulty: 'Intermediate',
    instructions: [
      'Lie on bench with dumbbells',
      'Start with arms extended',
      'Lower weights to sides of head',
      'Extend back up',
      'Keep elbows stable'
    ],
    formTips: [
      'Keep elbows stable',
      'Control the movement',
      'Full range of motion'
    ],
    commonMistakes: [
      'Moving elbows',
      'Using too much weight',
      'Poor control'
    ]
  },

  // SHOULDER EXERCISES
  {
    id: 'overhead_press',
    name: 'Overhead Press',
    muscle: 'Shoulders',
    primaryMuscles: ['anterior_deltoids', 'medial_deltoids'],
    secondaryMuscles: ['triceps', 'core', 'upper_chest'],
    equipment: ['barbell'],
    difficulty: 'Intermediate',
    instructions: [
      'Start with bar at shoulder level',
      'Grip bar slightly wider than shoulders',
      'Press straight up, keeping bar close to face',
      'Lock out overhead with shoulders by ears',
      'Lower with control to starting position'
    ],
    formTips: [
      'Keep core tight throughout',
      'Press straight up, not forward',
      'Full range of motion',
      'Breathe at the top'
    ],
    commonMistakes: [
      'Pressing forward instead of up',
      'Incomplete lockout',
      'Using legs to help (strict press)',
      'Poor core stability'
    ]
  },
  {
    id: 'lateral_raises',
    name: 'Lateral Raises',
    muscle: 'Shoulders',
    primaryMuscles: ['medial_deltoids'],
    secondaryMuscles: ['anterior_deltoids', 'traps'],
    equipment: ['dumbbells'],
    difficulty: 'Beginner',
    instructions: [
      'Stand with dumbbells at sides',
      'Raise arms to shoulder height',
      'Keep slight bend in elbows',
      'Lead with pinkies',
      'Lower with control'
    ],
    formTips: [
      'Don\'t swing the weights',
      'Focus on deltoid contraction',
      'Full range of motion',
      'Control the negative'
    ],
    commonMistakes: [
      'Using momentum',
      'Too heavy weights',
      'Incomplete range',
      'Poor posture'
    ]
  },
  {
    id: 'front_raises',
    name: 'Front Raises',
    muscle: 'Shoulders',
    primaryMuscles: ['anterior_deltoids'],
    secondaryMuscles: ['core'],
    equipment: ['dumbbells'],
    difficulty: 'Beginner',
    instructions: [
      'Stand with dumbbells at thighs',
      'Raise one arm to shoulder height',
      'Keep slight bend in elbow',
      'Lower with control',
      'Alternate arms'
    ],
    formTips: [
      'Control the movement',
      'Don\'t swing',
      'Focus on front deltoids'
    ],
    commonMistakes: [
      'Using momentum',
      'Too heavy weight',
      'Poor posture'
    ]
  },
  {
    id: 'rear_delt_flyes',
    name: 'Rear Delt Flyes',
    muscle: 'Shoulders',
    primaryMuscles: ['posterior_deltoids'],
    secondaryMuscles: ['rhomboids', 'middle_traps'],
    equipment: ['dumbbells'],
    difficulty: 'Beginner',
    instructions: [
      'Bend forward at hips',
      'Hold dumbbells with slight bend',
      'Raise arms to sides',
      'Squeeze shoulder blades',
      'Lower with control'
    ],
    formTips: [
      'Keep slight bend in elbows',
      'Focus on rear delts',
      'Squeeze shoulder blades'
    ],
    commonMistakes: [
      'Using momentum',
      'Too heavy weight',
      'Poor posture'
    ]
  },
  {
    id: 'arnold_press',
    name: 'Arnold Press',
    muscle: 'Shoulders',
    primaryMuscles: ['anterior_deltoids', 'medial_deltoids'],
    secondaryMuscles: ['triceps', 'core'],
    equipment: ['dumbbells'],
    difficulty: 'Intermediate',
    instructions: [
      'Start with dumbbells at chest',
      'Palms facing body',
      'Press up while rotating palms out',
      'End with palms facing forward',
      'Reverse the movement'
    ],
    formTips: [
      'Smooth rotation',
      'Control the movement',
      'Full range of motion'
    ],
    commonMistakes: [
      'Rushing the movement',
      'Poor rotation',
      'Using too much weight'
    ]
  },
  {
    id: 'face_pulls',
    name: 'Face Pulls',
    muscle: 'Shoulders',
    primaryMuscles: ['posterior_deltoids', 'rhomboids'],
    secondaryMuscles: ['middle_traps', 'biceps'],
    equipment: ['cables'],
    difficulty: 'Beginner',
    instructions: [
      'Set cable at face height',
      'Grip rope with both hands',
      'Pull to face level',
      'Squeeze shoulder blades',
      'Return with control'
    ],
    formTips: [
      'Pull to face level',
      'Squeeze shoulder blades',
      'Control the movement'
    ],
    commonMistakes: [
      'Pulling too low',
      'Using momentum',
      'Poor posture'
    ]
  },

  // BACK EXERCISES
  {
    id: 'pull_up',
    name: 'Pull-ups',
    muscle: 'Back',
    primaryMuscles: ['lats', 'rhomboids', 'middle_traps'],
    secondaryMuscles: ['biceps', 'posterior_deltoids', 'core'],
    equipment: ['pull_up_bar'],
    difficulty: 'Intermediate',
    instructions: [
      'Hang from bar with overhand grip',
      'Pull body up until chin over bar',
      'Squeeze shoulder blades together',
      'Lower with control',
      'Keep core engaged'
    ],
    formTips: [
      'Initiate with lats, not biceps',
      'Keep chest up',
      'Full range of motion',
      'Control the negative'
    ],
    commonMistakes: [
      'Kipping or swinging',
      'Incomplete range of motion',
      'Using momentum',
      'Poor grip'
    ]
  },
  {
    id: 'bent_over_row',
    name: 'Bent-Over Row',
    muscle: 'Back',
    primaryMuscles: ['lats', 'rhomboids', 'middle_traps'],
    secondaryMuscles: ['biceps', 'posterior_deltoids', 'core'],
    equipment: ['barbell'],
    difficulty: 'Intermediate',
    instructions: [
      'Hinge at hips, keep back straight',
      'Grip bar overhand, slightly wider than shoulders',
      'Pull bar to lower chest/upper abdomen',
      'Squeeze shoulder blades together at top',
      'Lower with control, maintaining tension'
    ],
    formTips: [
      'Pull with elbows, not hands',
      'Keep core tight throughout',
      'Don\'t round back',
      'Full range of motion'
    ],
    commonMistakes: [
      'Rounded back',
      'Using too much weight',
      'Poor hip hinge',
      'Incomplete range of motion'
    ]
  },
  {
    id: 'lat_pulldown',
    name: 'Lat Pulldown',
    muscle: 'Back',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'rhomboids', 'middle_traps'],
    equipment: ['cables'],
    difficulty: 'Beginner',
    instructions: [
      'Sit at lat pulldown machine',
      'Grip bar wider than shoulders',
      'Pull bar to upper chest',
      'Squeeze shoulder blades together',
      'Return with control'
    ],
    formTips: [
      'Pull to chest, not behind neck',
      'Squeeze shoulder blades',
      'Control the movement'
    ],
    commonMistakes: [
      'Pulling behind neck',
      'Using momentum',
      'Poor posture'
    ]
  },
  {
    id: 'seated_cable_row',
    name: 'Seated Cable Row',
    muscle: 'Back',
    primaryMuscles: ['rhomboids', 'middle_traps', 'lats'],
    secondaryMuscles: ['biceps', 'posterior_deltoids'],
    equipment: ['cables'],
    difficulty: 'Beginner',
    instructions: [
      'Sit at cable row machine',
      'Grip handle with both hands',
      'Pull to lower chest',
      'Squeeze shoulder blades together',
      'Return with control'
    ],
    formTips: [
      'Keep chest up',
      'Squeeze shoulder blades',
      'Control the movement'
    ],
    commonMistakes: [
      'Rounded back',
      'Using momentum',
      'Poor posture'
    ]
  },
  {
    id: 't_bar_row',
    name: 'T-Bar Row',
    muscle: 'Back',
    primaryMuscles: ['lats', 'rhomboids', 'middle_traps'],
    secondaryMuscles: ['biceps', 'posterior_deltoids', 'core'],
    equipment: ['barbell', 't_bar_handle'],
    difficulty: 'Intermediate',
    instructions: [
      'Straddle barbell with T-bar handle',
      'Hinge at hips, keep back straight',
      'Pull handle to chest',
      'Squeeze shoulder blades together',
      'Lower with control'
    ],
    formTips: [
      'Keep core tight',
      'Squeeze shoulder blades',
      'Control the movement'
    ],
    commonMistakes: [
      'Rounded back',
      'Using momentum',
      'Poor hip hinge'
    ]
  },
  {
    id: 'single_arm_dumbbell_row',
    name: 'Single Arm Dumbbell Row',
    muscle: 'Back',
    primaryMuscles: ['lats', 'rhomboids'],
    secondaryMuscles: ['biceps', 'posterior_deltoids', 'core'],
    equipment: ['dumbbell', 'bench'],
    difficulty: 'Beginner',
    instructions: [
      'Place knee and hand on bench',
      'Hold dumbbell in other hand',
      'Pull dumbbell to hip',
      'Squeeze shoulder blade',
      'Lower with control'
    ],
    formTips: [
      'Keep core tight',
      'Squeeze shoulder blade',
      'Control the movement'
    ],
    commonMistakes: [
      'Rounded back',
      'Using momentum',
      'Poor stability'
    ]
  },

  // BICEP EXERCISES
  {
    id: 'barbell_curls',
    name: 'Barbell Curls',
    muscle: 'Biceps',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: ['barbell'],
    difficulty: 'Beginner',
    instructions: [
      'Stand with feet hip-width apart',
      'Hold barbell with underhand grip',
      'Curl bar up to shoulders',
      'Squeeze biceps at top',
      'Lower with control'
    ],
    formTips: [
      'Keep elbows at sides',
      'Control the movement',
      'Full range of motion'
    ],
    commonMistakes: [
      'Swinging the weight',
      'Using momentum',
      'Incomplete range'
    ]
  },
  {
    id: 'dumbbell_curls',
    name: 'Dumbbell Curls',
    muscle: 'Biceps',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: ['dumbbells'],
    difficulty: 'Beginner',
    instructions: [
      'Stand with dumbbells at sides',
      'Curl weights up to shoulders',
      'Squeeze biceps at top',
      'Lower with control',
      'Keep elbows at sides'
    ],
    formTips: [
      'Control the movement',
      'Squeeze at top',
      'Full range of motion'
    ],
    commonMistakes: [
      'Swinging weights',
      'Using momentum',
      'Poor form'
    ]
  },
  {
    id: 'hammer_curls',
    name: 'Hammer Curls',
    muscle: 'Biceps',
    primaryMuscles: ['biceps', 'brachialis'],
    secondaryMuscles: ['forearms'],
    equipment: ['dumbbells'],
    difficulty: 'Beginner',
    instructions: [
      'Hold dumbbells with neutral grip',
      'Curl weights up to shoulders',
      'Keep palms facing each other',
      'Squeeze biceps at top',
      'Lower with control'
    ],
    formTips: [
      'Neutral grip throughout',
      'Control the movement',
      'Focus on biceps'
    ],
    commonMistakes: [
      'Rotating wrists',
      'Using momentum',
      'Poor control'
    ]
  },
  {
    id: 'preacher_curls',
    name: 'Preacher Curls',
    muscle: 'Biceps',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: ['barbell', 'preacher_bench'],
    difficulty: 'Intermediate',
    instructions: [
      'Sit at preacher bench',
      'Rest arms on pad',
      'Curl bar up to shoulders',
      'Squeeze biceps at top',
      'Lower with control'
    ],
    formTips: [
      'Keep arms on pad',
      'Control the movement',
      'Full range of motion'
    ],
    commonMistakes: [
      'Lifting arms off pad',
      'Using momentum',
      'Incomplete range'
    ]
  },
  {
    id: 'cable_curls',
    name: 'Cable Curls',
    muscle: 'Biceps',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: ['cables'],
    difficulty: 'Beginner',
    instructions: [
      'Stand at cable machine',
      'Grip bar with underhand grip',
      'Curl bar up to shoulders',
      'Squeeze biceps at top',
      'Lower with control'
    ],
    formTips: [
      'Keep elbows at sides',
      'Control the movement',
      'Constant tension'
    ],
    commonMistakes: [
      'Moving elbows',
      'Using momentum',
      'Poor posture'
    ]
  },
  {
    id: 'concentration_curls',
    name: 'Concentration Curls',
    muscle: 'Biceps',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: ['dumbbell', 'bench'],
    difficulty: 'Beginner',
    instructions: [
      'Sit on bench with legs apart',
      'Rest elbow on inner thigh',
      'Curl dumbbell up',
      'Squeeze bicep at top',
      'Lower with control'
    ],
    formTips: [
      'Keep elbow stationary',
      'Focus on bicep contraction',
      'Control the movement'
    ],
    commonMistakes: [
      'Moving elbow',
      'Using momentum',
      'Poor isolation'
    ]
  },

  // LEG EXERCISES
  {
    id: 'squat',
    name: 'Squat',
    muscle: 'Legs',
    primaryMuscles: ['quadriceps', 'glutes', 'hamstrings'],
    secondaryMuscles: ['core', 'calves'],
    equipment: ['bodyweight'],
    difficulty: 'Beginner',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower by pushing hips back',
      'Go down until thighs parallel to floor',
      'Drive up through heels'
    ],
    formTips: [
      'Keep chest up',
      'Knees track over toes',
      'Full depth is important'
    ],
    commonMistakes: [
      'Knees caving in',
      'Incomplete depth',
      'Forward lean'
    ]
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    muscle: 'Legs',
    primaryMuscles: ['hamstrings', 'glutes', 'erector_spinae'],
    secondaryMuscles: ['lats', 'traps', 'core', 'calves'],
    equipment: ['barbell'],
    difficulty: 'Advanced',
    instructions: [
      'Stand with feet hip-width apart',
      'Grip bar just outside legs',
      'Keep back straight, chest up',
      'Lift by extending hips and knees'
    ],
    formTips: [
      'Keep bar close to body',
      'Don\'t round back',
      'Drive hips forward'
    ],
    commonMistakes: [
      'Rounded back',
      'Bar drifting away',
      'Hips rising too fast'
    ]
  },
  {
    id: 'lunge',
    name: 'Lunge',
    muscle: 'Legs',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core', 'calves'],
    equipment: ['bodyweight'],
    difficulty: 'Beginner',
    instructions: [
      'Step forward into lunge position',
      'Lower back knee toward ground',
      'Push back to starting position',
      'Alternate legs'
    ],
    formTips: [
      'Keep torso upright',
      'Don\'t let front knee go past toes',
      'Control the movement'
    ],
    commonMistakes: [
      'Knee going past toes',
      'Leaning forward',
      'Incomplete range of motion'
    ]
  },
  {
    id: 'romanian_deadlift',
    name: 'Romanian Deadlift',
    muscle: 'Legs',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['erector_spinae', 'core'],
    equipment: ['barbell'],
    difficulty: 'Intermediate',
    instructions: [
      'Stand with feet hip-width apart',
      'Hinge at hips, keep legs straighter',
      'Lower bar along legs',
      'Feel stretch in hamstrings',
      'Drive hips forward to stand'
    ],
    formTips: [
      'Keep bar close to legs',
      'Hip hinge movement',
      'Feel hamstring stretch',
      'Don\'t round back'
    ],
    commonMistakes: [
      'Rounded back',
      'Bending knees too much',
      'Bar drifting away',
      'Poor hip hinge'
    ]
  },
  {
    id: 'bulgarian_split_squats',
    name: 'Bulgarian Split Squats',
    muscle: 'Legs',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core', 'calves'],
    equipment: ['bodyweight', 'dumbbells'],
    difficulty: 'Intermediate',
    instructions: [
      'Place rear foot on bench/box',
      'Lower into lunge position',
      'Keep front knee over ankle',
      'Drive up through front heel',
      'Complete all reps before switching'
    ],
    formTips: [
      'Keep torso upright',
      'Don\'t let knee go past toes',
      'Control the movement',
      'Full range of motion'
    ],
    commonMistakes: [
      'Knee going past toes',
      'Leaning forward',
      'Incomplete range',
      'Poor balance'
    ]
  },
  {
    id: 'leg_press',
    name: 'Leg Press',
    muscle: 'Legs',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    equipment: ['leg_press_machine'],
    difficulty: 'Beginner',
    instructions: [
      'Sit in machine',
      'Place feet shoulder-width apart',
      'Lower until 90 degrees',
      'Press through heels'
    ],
    formTips: [
      'Full range of motion',
      'Press through heels',
      'Control the movement'
    ],
    commonMistakes: [
      'Incomplete range',
      'Knees caving in',
      'Using too much weight'
    ]
  },
  {
    id: 'leg_curls',
    name: 'Leg Curls',
    muscle: 'Legs',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves'],
    equipment: ['leg_curl_machine'],
    difficulty: 'Beginner',
    instructions: [
      'Lie face down on machine',
      'Position ankles under pads',
      'Curl heels to glutes',
      'Squeeze hamstrings at top',
      'Lower with control'
    ],
    formTips: [
      'Full range of motion',
      'Control the negative',
      'Squeeze at top',
      'Don\'t use momentum'
    ],
    commonMistakes: [
      'Using momentum',
      'Incomplete range',
      'Too heavy weight',
      'Poor positioning'
    ]
  },
  {
    id: 'leg_extensions',
    name: 'Leg Extensions',
    muscle: 'Legs',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['core'],
    equipment: ['leg_extension_machine'],
    difficulty: 'Beginner',
    instructions: [
      'Sit in machine',
      'Position legs under pads',
      'Extend legs to full lockout',
      'Squeeze quads at top',
      'Lower with control'
    ],
    formTips: [
      'Full range of motion',
      'Squeeze at top',
      'Control the movement'
    ],
    commonMistakes: [
      'Using momentum',
      'Incomplete range',
      'Too heavy weight'
    ]
  },
  {
    id: 'calf_raises',
    name: 'Standing Calf Raises',
    muscle: 'Legs',
    primaryMuscles: ['calves'],
    secondaryMuscles: ['soleus'],
    equipment: ['bodyweight', 'dumbbells'],
    difficulty: 'Beginner',
    instructions: [
      'Stand on edge of step or platform',
      'Rise up on toes',
      'Squeeze calves at top',
      'Lower below step level',
      'Feel stretch in calves'
    ],
    formTips: [
      'Full range of motion',
      'Control the movement',
      'Squeeze at top',
      'Stretch at bottom'
    ],
    commonMistakes: [
      'Incomplete range',
      'Using momentum',
      'Poor balance',
      'Not stretching'
    ]
  },
  {
    id: 'goblet_squats',
    name: 'Goblet Squats',
    muscle: 'Legs',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['core', 'calves'],
    equipment: ['dumbbell'],
    difficulty: 'Beginner',
    instructions: [
      'Hold dumbbell at chest',
      'Stand with feet shoulder-width apart',
      'Squat down keeping chest up',
      'Drive up through heels',
      'Keep weight close to body'
    ],
    formTips: [
      'Keep chest up',
      'Full depth',
      'Control the movement'
    ],
    commonMistakes: [
      'Leaning forward',
      'Incomplete depth',
      'Poor posture'
    ]
  },

  // CORE EXERCISES
  {
    id: 'plank',
    name: 'Plank',
    muscle: 'Core',
    primaryMuscles: ['rectus_abdominis', 'transverse_abdominis'],
    secondaryMuscles: ['obliques', 'shoulders', 'glutes'],
    equipment: ['bodyweight'],
    difficulty: 'Beginner',
    instructions: [
      'Start in push-up position',
      'Lower to forearms',
      'Keep body in straight line',
      'Hold position'
    ],
    formTips: [
      'Engage core throughout',
      'Don\'t let hips sag',
      'Breathe normally'
    ],
    commonMistakes: [
      'Hips too high or low',
      'Holding breath',
      'Poor alignment'
    ]
  },
  {
    id: 'mountain_climbers',
    name: 'Mountain Climbers',
    muscle: 'Core',
    primaryMuscles: ['rectus_abdominis', 'obliques'],
    secondaryMuscles: ['shoulders', 'hip_flexors', 'calves'],
    equipment: ['bodyweight'],
    difficulty: 'Intermediate',
    instructions: [
      'Start in plank position',
      'Bring one knee to chest',
      'Quickly switch legs',
      'Maintain plank position'
    ],
    formTips: [
      'Keep core tight',
      'Don\'t let hips rise',
      'Controlled movement'
    ],
    commonMistakes: [
      'Hips bouncing up',
      'Too fast, poor form',
      'Not engaging core'
    ]
  }
];








