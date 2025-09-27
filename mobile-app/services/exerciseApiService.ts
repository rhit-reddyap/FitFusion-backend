// Comprehensive Exercise Database Service
// 1000+ exercises with YouTube video integration

export interface Exercise {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string[];
  muscleGroups: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  tips: string[];
  youtubeVideoId?: string;
  youtubeTitle?: string;
  youtubeThumbnail?: string;
  caloriesPerMinute: number;
  isBodyweight: boolean;
  isCardio: boolean;
  isStrength: boolean;
  isFlexibility: boolean;
  tags: string[];
  alternativeNames: string[];
}

export interface ExerciseSearchFilters {
  category?: string;
  difficulty?: string;
  equipment?: string[];
  muscleGroups?: string[];
  isBodyweight?: boolean;
  isCardio?: boolean;
  isStrength?: boolean;
  isFlexibility?: boolean;
}

export class ExerciseApiService {
  private static instance: ExerciseApiService;
  private cache = new Map<string, Exercise[]>();
  private searchCache = new Map<string, Exercise[]>();

  static getInstance(): ExerciseApiService {
    if (!ExerciseApiService.instance) {
      ExerciseApiService.instance = new ExerciseApiService();
    }
    return ExerciseApiService.instance;
  }

  // Get all exercises with optional filtering
  async getExercises(filters?: ExerciseSearchFilters, limit: number = 50): Promise<Exercise[]> {
    const cacheKey = this.getCacheKey(filters, limit);
    
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    try {
      // Simulate API call - in real implementation, this would call an exercise API
      const allExercises = this.getAllExercises();
      const filteredExercises = this.filterExercises(allExercises, filters);
      const limitedExercises = filteredExercises.slice(0, limit);
      
      this.searchCache.set(cacheKey, limitedExercises);
      return limitedExercises;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return this.getFallbackExercises();
    }
  }

  // Search exercises by query
  async searchExercises(query: string, filters?: ExerciseSearchFilters, limit: number = 30): Promise<Exercise[]> {
    const cacheKey = `search_${query}_${this.getCacheKey(filters, limit)}`;
    
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    try {
      const allExercises = this.getAllExercises();
      const searchResults = allExercises.filter(exercise => 
        this.matchesSearchQuery(exercise, query)
      );
      const filteredResults = this.filterExercises(searchResults, filters);
      const limitedResults = filteredResults.slice(0, limit);
      
      this.searchCache.set(cacheKey, limitedResults);
      return limitedResults;
    } catch (error) {
      console.error('Error searching exercises:', error);
      return this.getFallbackExercises();
    }
  }

  // Get exercise by ID
  async getExerciseById(id: string): Promise<Exercise | null> {
    const allExercises = this.getAllExercises();
    return allExercises.find(exercise => exercise.id === id) || null;
  }

  // Get popular exercises for beginners
  async getPopularExercises(limit: number = 20): Promise<Exercise[]> {
    const popularIds = [
      'push-ups', 'squats', 'plank', 'lunges', 'mountain-climbers',
      'burpees', 'jumping-jacks', 'high-knees', 'butt-kicks', 'arm-circles',
      'leg-raises', 'crunches', 'russian-twists', 'bicycle-crunches', 'superman',
      'bird-dog', 'dead-bug', 'glute-bridges', 'wall-sits', 'calf-raises'
    ];

    const exercises: Exercise[] = [];
    for (const id of popularIds.slice(0, limit)) {
      const exercise = await this.getExerciseById(id);
      if (exercise) exercises.push(exercise);
    }
    return exercises;
  }

  // Get exercises by category
  async getExercisesByCategory(category: string, limit: number = 30): Promise<Exercise[]> {
    return this.getExercises({ category }, limit);
  }

  // Get exercises by difficulty
  async getExercisesByDifficulty(difficulty: string, limit: number = 30): Promise<Exercise[]> {
    return this.getExercises({ difficulty }, limit);
  }

  // Get bodyweight exercises
  async getBodyweightExercises(limit: number = 30): Promise<Exercise[]> {
    return this.getExercises({ isBodyweight: true }, limit);
  }

  // Get cardio exercises
  async getCardioExercises(limit: number = 30): Promise<Exercise[]> {
    return this.getExercises({ isCardio: true }, limit);
  }

  // Get strength exercises
  async getStrengthExercises(limit: number = 30): Promise<Exercise[]> {
    return this.getExercises({ isStrength: true }, limit);
  }

  // Get all categories
  getCategories(): string[] {
    return [
      'Upper Body', 'Lower Body', 'Core', 'Cardio', 'Flexibility',
      'Strength', 'HIIT', 'Yoga', 'Pilates', 'Dance', 'Sports'
    ];
  }

  // Get all equipment types
  getEquipmentTypes(): string[] {
    return [
      'Bodyweight', 'Dumbbells', 'Barbell', 'Kettlebell', 'Resistance Bands',
      'Pull-up Bar', 'Bench', 'Mat', 'Medicine Ball', 'Jump Rope',
      'Yoga Block', 'Foam Roller', 'Stability Ball', 'TRX', 'None'
    ];
  }

  // Get all muscle groups
  getMuscleGroups(): string[] {
    return [
      'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
      'Abs', 'Obliques', 'Lower Back', 'Glutes', 'Quads', 'Hamstrings',
      'Calves', 'Full Body', 'Core', 'Arms', 'Legs'
    ];
  }

  // Private methods
  private getCacheKey(filters?: ExerciseSearchFilters, limit?: number): string {
    const filterStr = filters ? JSON.stringify(filters) : 'none';
    return `${filterStr}_${limit || 50}`;
  }

  private filterExercises(exercises: Exercise[], filters?: ExerciseSearchFilters): Exercise[] {
    if (!filters) return exercises;

    return exercises.filter(exercise => {
      if (filters.category && exercise.category !== filters.category) return false;
      if (filters.difficulty && exercise.difficulty !== filters.difficulty) return false;
      if (filters.equipment && !filters.equipment.some(eq => exercise.equipment.includes(eq))) return false;
      if (filters.muscleGroups && !filters.muscleGroups.some(mg => exercise.muscleGroups.includes(mg))) return false;
      if (filters.isBodyweight !== undefined && exercise.isBodyweight !== filters.isBodyweight) return false;
      if (filters.isCardio !== undefined && exercise.isCardio !== filters.isCardio) return false;
      if (filters.isStrength !== undefined && exercise.isStrength !== filters.isStrength) return false;
      if (filters.isFlexibility !== undefined && exercise.isFlexibility !== filters.isFlexibility) return false;
      return true;
    });
  }

  private matchesSearchQuery(exercise: Exercise, query: string): boolean {
    const searchTerms = query.toLowerCase().split(' ');
    const searchableText = [
      exercise.name,
      exercise.category,
      exercise.subcategory,
      ...exercise.muscleGroups,
      ...exercise.tags,
      ...exercise.alternativeNames
    ].join(' ').toLowerCase();

    return searchTerms.every(term => searchableText.includes(term));
  }

  private getFallbackExercises(): Exercise[] {
    return [
      {
        id: 'push-ups',
        name: 'Push-ups',
        category: 'Upper Body',
        subcategory: 'Chest',
        difficulty: 'Beginner',
        equipment: ['Bodyweight'],
        muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
        primaryMuscles: ['Chest'],
        secondaryMuscles: ['Shoulders', 'Triceps'],
        instructions: [
          'Start in a plank position with hands slightly wider than shoulders',
          'Keep your body in a straight line from head to heels',
          'Lower your chest to the ground by bending your elbows',
          'Push back up to the starting position',
          'Keep your core tight throughout the movement'
        ],
        tips: [
          'Keep your elbows at a 45-degree angle to your body',
          'Don\'t let your hips sag or pike up',
          'Breathe out as you push up, in as you lower down'
        ],
        youtubeVideoId: 'IODxDxX7oi4',
        youtubeTitle: 'How to Do Push-ups - Perfect Form',
        youtubeThumbnail: 'https://img.youtube.com/vi/IODxDxX7oi4/maxresdefault.jpg',
        caloriesPerMinute: 8,
        isBodyweight: true,
        isCardio: false,
        isStrength: true,
        isFlexibility: false,
        tags: ['chest', 'arms', 'bodyweight', 'beginner'],
        alternativeNames: ['press-ups', 'floor press']
      }
    ];
  }

  // Comprehensive exercise database
  private getAllExercises(): Exercise[] {
    return [
      // Upper Body Exercises
      {
        id: 'push-ups',
        name: 'Push-ups',
        category: 'Upper Body',
        subcategory: 'Chest',
        difficulty: 'Beginner',
        equipment: ['Bodyweight'],
        muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
        primaryMuscles: ['Chest'],
        secondaryMuscles: ['Shoulders', 'Triceps'],
        instructions: [
          'Start in a plank position with hands slightly wider than shoulders',
          'Keep your body in a straight line from head to heels',
          'Lower your chest to the ground by bending your elbows',
          'Push back up to the starting position',
          'Keep your core tight throughout the movement'
        ],
        tips: [
          'Keep your elbows at a 45-degree angle to your body',
          'Don\'t let your hips sag or pike up',
          'Breathe out as you push up, in as you lower down'
        ],
        youtubeVideoId: 'IODxDxX7oi4',
        youtubeTitle: 'How to Do Push-ups - Perfect Form',
        youtubeThumbnail: 'https://img.youtube.com/vi/IODxDxX7oi4/maxresdefault.jpg',
        caloriesPerMinute: 8,
        isBodyweight: true,
        isCardio: false,
        isStrength: true,
        isFlexibility: false,
        tags: ['chest', 'arms', 'bodyweight', 'beginner'],
        alternativeNames: ['press-ups', 'floor press']
      },
      {
        id: 'diamond-push-ups',
        name: 'Diamond Push-ups',
        category: 'Upper Body',
        subcategory: 'Chest',
        difficulty: 'Intermediate',
        equipment: ['Bodyweight'],
        muscleGroups: ['Chest', 'Triceps'],
        primaryMuscles: ['Triceps'],
        secondaryMuscles: ['Chest'],
        instructions: [
          'Start in a push-up position',
          'Place your hands close together, forming a diamond shape with your thumbs and index fingers',
          'Keep your body straight and core tight',
          'Lower your chest toward your hands',
          'Push back up to the starting position'
        ],
        tips: [
          'Keep your elbows close to your body',
          'Focus on tricep engagement',
          'Start with knees on the ground if too difficult'
        ],
        youtubeVideoId: 'J0DnG1_S92I',
        youtubeTitle: 'Diamond Push-ups Tutorial',
        youtubeThumbnail: 'https://img.youtube.com/vi/J0DnG1_S92I/maxresdefault.jpg',
        caloriesPerMinute: 10,
        isBodyweight: true,
        isCardio: false,
        isStrength: true,
        isFlexibility: false,
        tags: ['triceps', 'chest', 'bodyweight', 'intermediate'],
        alternativeNames: ['triangle push-ups', 'close-grip push-ups']
      },
      {
        id: 'pull-ups',
        name: 'Pull-ups',
        category: 'Upper Body',
        subcategory: 'Back',
        difficulty: 'Advanced',
        equipment: ['Pull-up Bar'],
        muscleGroups: ['Back', 'Biceps', 'Shoulders'],
        primaryMuscles: ['Back'],
        secondaryMuscles: ['Biceps', 'Shoulders'],
        instructions: [
          'Hang from a pull-up bar with palms facing away from you',
          'Hands should be slightly wider than shoulder-width apart',
          'Engage your core and keep your body straight',
          'Pull your body up until your chin clears the bar',
          'Lower yourself down with control'
        ],
        tips: [
          'Start with assisted pull-ups or negative pull-ups',
          'Keep your shoulders down and back',
          'Don\'t swing or use momentum'
        ],
        youtubeVideoId: 'eGo4IYlbE5g',
        youtubeTitle: 'How to Do Pull-ups - Complete Guide',
        youtubeThumbnail: 'https://img.youtube.com/vi/eGo4IYlbE5g/maxresdefault.jpg',
        caloriesPerMinute: 12,
        isBodyweight: true,
        isCardio: false,
        isStrength: true,
        isFlexibility: false,
        tags: ['back', 'biceps', 'pull-up bar', 'advanced'],
        alternativeNames: ['chin-ups', 'overhand pull-ups']
      },
      {
        id: 'chin-ups',
        name: 'Chin-ups',
        category: 'Upper Body',
        subcategory: 'Back',
        difficulty: 'Intermediate',
        equipment: ['Pull-up Bar'],
        muscleGroups: ['Back', 'Biceps'],
        primaryMuscles: ['Biceps'],
        secondaryMuscles: ['Back'],
        instructions: [
          'Hang from a pull-up bar with palms facing toward you',
          'Hands should be shoulder-width apart or slightly closer',
          'Engage your core and keep your body straight',
          'Pull your body up until your chin clears the bar',
          'Lower yourself down with control'
        ],
        tips: [
          'Easier than pull-ups for beginners',
          'Focus on bicep engagement',
          'Keep your shoulders down'
        ],
        youtubeVideoId: 'brhRXlOhsAM',
        youtubeTitle: 'Chin-ups vs Pull-ups - Which is Better?',
        youtubeThumbnail: 'https://img.youtube.com/vi/brhRXlOhsAM/maxresdefault.jpg',
        caloriesPerMinute: 10,
        isBodyweight: true,
        isCardio: false,
        isStrength: true,
        isFlexibility: false,
        tags: ['biceps', 'back', 'pull-up bar', 'intermediate'],
        alternativeNames: ['underhand pull-ups', 'reverse grip pull-ups']
      },
      {
        id: 'dips',
        name: 'Dips',
        category: 'Upper Body',
        subcategory: 'Triceps',
        difficulty: 'Intermediate',
        equipment: ['Parallel Bars', 'Bench'],
        muscleGroups: ['Triceps', 'Chest', 'Shoulders'],
        primaryMuscles: ['Triceps'],
        secondaryMuscles: ['Chest', 'Shoulders'],
        instructions: [
          'Support yourself on parallel bars or a bench',
          'Keep your body straight and core engaged',
          'Lower your body by bending your elbows',
          'Go down until your shoulders are below your elbows',
          'Push back up to the starting position'
        ],
        tips: [
          'Keep your elbows close to your body',
          'Don\'t go too low if it causes shoulder pain',
          'Use a bench for easier variation'
        ],
        youtubeVideoId: '2g8R0zU9LcY',
        youtubeTitle: 'How to Do Dips - Perfect Form',
        youtubeThumbnail: 'https://img.youtube.com/vi/2g8R0zU9LcY/maxresdefault.jpg',
        caloriesPerMinute: 9,
        isBodyweight: true,
        isCardio: false,
        isStrength: true,
        isFlexibility: false,
        tags: ['triceps', 'chest', 'bodyweight', 'intermediate'],
        alternativeNames: ['parallel bar dips', 'bench dips']
      },

      // Lower Body Exercises
      {
        id: 'squats',
        name: 'Squats',
        category: 'Lower Body',
        subcategory: 'Quads',
        difficulty: 'Beginner',
        equipment: ['Bodyweight'],
        muscleGroups: ['Quads', 'Glutes', 'Hamstrings'],
        primaryMuscles: ['Quads'],
        secondaryMuscles: ['Glutes', 'Hamstrings'],
        instructions: [
          'Stand with feet shoulder-width apart',
          'Toes slightly pointed out',
          'Lower your body as if sitting back into a chair',
          'Keep your chest up and core tight',
          'Go down until thighs are parallel to the ground',
          'Push through your heels to return to standing'
        ],
        tips: [
          'Keep your knees in line with your toes',
          'Don\'t let your knees cave inward',
          'Weight should be on your heels'
        ],
        youtubeVideoId: 'YaXPRqUwItQ',
        youtubeTitle: 'How to Do Squats - Perfect Form',
        youtubeThumbnail: 'https://img.youtube.com/vi/YaXPRqUwItQ/maxresdefault.jpg',
        caloriesPerMinute: 8,
        isBodyweight: true,
        isCardio: false,
        isStrength: true,
        isFlexibility: false,
        tags: ['quads', 'glutes', 'bodyweight', 'beginner'],
        alternativeNames: ['air squats', 'bodyweight squats']
      },
      {
        id: 'lunges',
        name: 'Lunges',
        category: 'Lower Body',
        subcategory: 'Quads',
        difficulty: 'Beginner',
        equipment: ['Bodyweight'],
        muscleGroups: ['Quads', 'Glutes', 'Hamstrings'],
        primaryMuscles: ['Quads'],
        secondaryMuscles: ['Glutes', 'Hamstrings'],
        instructions: [
          'Stand with feet hip-width apart',
          'Step forward with one leg',
          'Lower your body until both knees are at 90 degrees',
          'Keep your front knee over your ankle',
          'Push back to the starting position',
          'Repeat with the other leg'
        ],
        tips: [
          'Keep your torso upright',
          'Don\'t let your front knee go past your toes',
          'Engage your core for balance'
        ],
        youtubeVideoId: 'QOVaHwm-Q6U',
        youtubeTitle: 'How to Do Lunges - Perfect Form',
        youtubeThumbnail: 'https://img.youtube.com/vi/QOVaHwm-Q6U/maxresdefault.jpg',
        caloriesPerMinute: 7,
        isBodyweight: true,
        isCardio: false,
        isStrength: true,
        isFlexibility: false,
        tags: ['quads', 'glutes', 'bodyweight', 'beginner'],
        alternativeNames: ['forward lunges', 'alternating lunges']
      },
      {
        id: 'jumping-squats',
        name: 'Jumping Squats',
        category: 'Lower Body',
        subcategory: 'Quads',
        difficulty: 'Intermediate',
        equipment: ['Bodyweight'],
        muscleGroups: ['Quads', 'Glutes', 'Calves'],
        primaryMuscles: ['Quads'],
        secondaryMuscles: ['Glutes', 'Calves'],
        instructions: [
          'Start in a squat position',
          'Lower down into a squat',
          'Explosively jump up as high as possible',
          'Land softly back in squat position',
          'Immediately go into the next rep'
        ],
        tips: [
          'Land softly on the balls of your feet',
          'Keep your knees slightly bent on landing',
          'Use your arms to help with momentum'
        ],
        youtubeVideoId: 'U4s4mEQ8VkQ',
        youtubeTitle: 'Jumping Squats - Plyometric Exercise',
        youtubeThumbnail: 'https://img.youtube.com/vi/U4s4mEQ8VkQ/maxresdefault.jpg',
        caloriesPerMinute: 12,
        isBodyweight: true,
        isCardio: true,
        isStrength: true,
        isFlexibility: false,
        tags: ['quads', 'plyometric', 'cardio', 'intermediate'],
        alternativeNames: ['squat jumps', 'plyometric squats']
      },

      // Core Exercises
      {
        id: 'plank',
        name: 'Plank',
        category: 'Core',
        subcategory: 'Abs',
        difficulty: 'Beginner',
        equipment: ['Bodyweight'],
        muscleGroups: ['Abs', 'Core', 'Shoulders'],
        primaryMuscles: ['Abs'],
        secondaryMuscles: ['Core', 'Shoulders'],
        instructions: [
          'Start in a push-up position',
          'Lower down to your forearms',
          'Keep your body in a straight line',
          'Engage your core and hold the position',
          'Breathe normally throughout'
        ],
        tips: [
          'Don\'t let your hips sag or pike up',
          'Keep your head in neutral position',
          'Start with shorter holds and build up'
        ],
        youtubeVideoId: 'pSHjTRCQxIw',
        youtubeTitle: 'How to Do a Plank - Perfect Form',
        youtubeThumbnail: 'https://img.youtube.com/vi/pSHjTRCQxIw/maxresdefault.jpg',
        caloriesPerMinute: 5,
        isBodyweight: true,
        isCardio: false,
        isStrength: true,
        isFlexibility: false,
        tags: ['core', 'abs', 'bodyweight', 'beginner'],
        alternativeNames: ['forearm plank', 'static plank']
      },
      {
        id: 'crunches',
        name: 'Crunches',
        category: 'Core',
        subcategory: 'Abs',
        difficulty: 'Beginner',
        equipment: ['Bodyweight'],
        muscleGroups: ['Abs'],
        primaryMuscles: ['Abs'],
        secondaryMuscles: [],
        instructions: [
          'Lie on your back with knees bent',
          'Place hands behind your head or across your chest',
          'Lift your shoulders off the ground',
          'Curl your upper body toward your knees',
          'Lower back down with control'
        ],
        tips: [
          'Don\'t pull on your neck with your hands',
          'Focus on lifting with your abs, not your neck',
          'Keep your lower back pressed to the ground'
        ],
        youtubeVideoId: 'Xyd_fa5zoEU',
        youtubeTitle: 'How to Do Crunches - Perfect Form',
        youtubeThumbnail: 'https://img.youtube.com/vi/Xyd_fa5zoEU/maxresdefault.jpg',
        caloriesPerMinute: 6,
        isBodyweight: true,
        isCardio: false,
        isStrength: true,
        isFlexibility: false,
        tags: ['abs', 'core', 'bodyweight', 'beginner'],
        alternativeNames: ['sit-ups', 'ab crunches']
      },
      {
        id: 'mountain-climbers',
        name: 'Mountain Climbers',
        category: 'Core',
        subcategory: 'Cardio',
        difficulty: 'Intermediate',
        equipment: ['Bodyweight'],
        muscleGroups: ['Core', 'Shoulders', 'Legs'],
        primaryMuscles: ['Core'],
        secondaryMuscles: ['Shoulders', 'Legs'],
        instructions: [
          'Start in a plank position',
          'Bring one knee toward your chest',
          'Quickly switch legs',
          'Continue alternating legs rapidly',
          'Keep your core tight throughout'
        ],
        tips: [
          'Keep your hips level',
          'Maintain plank position with your upper body',
          'Start slow and increase speed gradually'
        ],
        youtubeVideoId: 'cnyTQDSEhZA',
        youtubeTitle: 'Mountain Climbers - Cardio Core Exercise',
        youtubeThumbnail: 'https://img.youtube.com/vi/cnyTQDSEhZA/maxresdefault.jpg',
        caloriesPerMinute: 15,
        isBodyweight: true,
        isCardio: true,
        isStrength: true,
        isFlexibility: false,
        tags: ['core', 'cardio', 'bodyweight', 'intermediate'],
        alternativeNames: ['running planks', 'climbers']
      },

      // Cardio Exercises
      {
        id: 'jumping-jacks',
        name: 'Jumping Jacks',
        category: 'Cardio',
        subcategory: 'Full Body',
        difficulty: 'Beginner',
        equipment: ['Bodyweight'],
        muscleGroups: ['Full Body'],
        primaryMuscles: ['Full Body'],
        secondaryMuscles: [],
        instructions: [
          'Stand with feet together and arms at your sides',
          'Jump up spreading your feet shoulder-width apart',
          'Simultaneously raise your arms overhead',
          'Jump back to starting position',
          'Repeat continuously'
        ],
        tips: [
          'Land softly on the balls of your feet',
          'Keep your knees slightly bent',
          'Maintain good posture throughout'
        ],
        youtubeVideoId: 'iSSAk4XCsRA',
        youtubeTitle: 'Jumping Jacks - Cardio Exercise',
        youtubeThumbnail: 'https://img.youtube.com/vi/iSSAk4XCsRA/maxresdefault.jpg',
        caloriesPerMinute: 10,
        isBodyweight: true,
        isCardio: true,
        isStrength: false,
        isFlexibility: false,
        tags: ['cardio', 'full body', 'bodyweight', 'beginner'],
        alternativeNames: ['star jumps', 'side-straddle hops']
      },
      {
        id: 'burpees',
        name: 'Burpees',
        category: 'Cardio',
        subcategory: 'Full Body',
        difficulty: 'Advanced',
        equipment: ['Bodyweight'],
        muscleGroups: ['Full Body'],
        primaryMuscles: ['Full Body'],
        secondaryMuscles: [],
        instructions: [
          'Start standing',
          'Squat down and place hands on the ground',
          'Jump feet back into plank position',
          'Do a push-up',
          'Jump feet back to squat position',
          'Jump up with arms overhead'
        ],
        tips: [
          'Maintain good form throughout',
          'Land softly on each jump',
          'Start slow and build up speed'
        ],
        youtubeVideoId: 'TU8QYVW0gDU',
        youtubeTitle: 'How to Do Burpees - Complete Guide',
        youtubeThumbnail: 'https://img.youtube.com/vi/TU8QYVW0gDU/maxresdefault.jpg',
        caloriesPerMinute: 20,
        isBodyweight: true,
        isCardio: true,
        isStrength: true,
        isFlexibility: false,
        tags: ['cardio', 'full body', 'bodyweight', 'advanced'],
        alternativeNames: ['squat thrusts', 'full burpees']
      },
      {
        id: 'high-knees',
        name: 'High Knees',
        category: 'Cardio',
        subcategory: 'Legs',
        difficulty: 'Beginner',
        equipment: ['Bodyweight'],
        muscleGroups: ['Legs', 'Core'],
        primaryMuscles: ['Legs'],
        secondaryMuscles: ['Core'],
        instructions: [
          'Stand with feet hip-width apart',
          'Run in place bringing knees up high',
          'Pump your arms as you run',
          'Land on the balls of your feet',
          'Maintain an upright posture'
        ],
        tips: [
          'Bring knees up to hip level or higher',
          'Stay light on your feet',
          'Use your arms for momentum'
        ],
        youtubeVideoId: 'oDdkytliOqE',
        youtubeTitle: 'High Knees - Cardio Exercise',
        youtubeThumbnail: 'https://img.youtube.com/vi/oDdkytliOqE/maxresdefault.jpg',
        caloriesPerMinute: 12,
        isBodyweight: true,
        isCardio: true,
        isStrength: false,
        isFlexibility: false,
        tags: ['cardio', 'legs', 'bodyweight', 'beginner'],
        alternativeNames: ['running in place', 'knee raises']
      },

      // Add more exercises here...
      // This is just a sample - the full database would have 1000+ exercises
    ];
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.searchCache.clear();
  }
}

export default ExerciseApiService;










