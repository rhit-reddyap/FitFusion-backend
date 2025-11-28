// AI Workout Generator - Deep logic paths for all answer combinations
import { expandedExerciseDatabase } from './expandedExerciseDatabase';

export interface WorkoutPreferences {
  goals: string[];
  fitnessLevel: string;
  equipment: string[];
  duration: number;
  targetMuscles: string[];
  workoutType: string;
}

export interface GeneratedExercise {
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
  sets: number;
  reps: number;
  restTime: number;
  weight?: number;
}

export interface GeneratedWorkout {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  duration: number;
  type: string;
  goals: string[];
  equipment: string[];
  muscles: string[];
  exercises: GeneratedExercise[];
  calories: number;
  aiGenerated: boolean;
  confidence: number;
  warmup?: GeneratedExercise[];
  cooldown?: GeneratedExercise[];
}

// Use expanded exercise database
const exerciseDatabase = expandedExerciseDatabase;

// Muscle group mappings - maps AICoach muscle group IDs to actual muscle groups
const muscleGroupMappings = {
  'chest': ['chest'],
  'back': ['back'],
  'legs': ['legs'],
  'core': ['core'],
  'shoulders': ['shoulders'],
  'triceps': ['triceps'],
  'biceps': ['biceps'],
  'arms': ['triceps', 'biceps'],
  // Map AICoach muscle group IDs to actual muscle groups
  'full_body': ['chest', 'back', 'legs', 'core', 'shoulders', 'triceps', 'biceps'],
  'upper_body': ['chest', 'back', 'shoulders', 'triceps', 'biceps'],
  'lower_body': ['legs', 'core'],
  'push': ['chest', 'shoulders', 'triceps'],
  'pull': ['back', 'biceps']
};

// Equipment mappings
const equipmentMappings = {
  'bodyweight': ['push_up', 'squat', 'lunge', 'plank', 'mountain_climbers', 'diamond_push_ups', 'bulgarian_split_squats', 'calf_raises'],
  'barbell': ['bench_press', 'bent_over_row', 'deadlift', 'overhead_press', 'barbell_curls', 'close_grip_bench_press', 'romanian_deadlift', 't_bar_row'],
  'dumbbells': ['incline_dumbbell_press', 'dumbbell_flyes', 'dumbbell_curls', 'hammer_curls', 'concentration_curls', 'lateral_raises', 'front_raises', 'rear_delt_flyes', 'arnold_press', 'overhead_tricep_extension', 'lying_tricep_extension', 'single_arm_dumbbell_row', 'goblet_squats'],
  'pull_up_bar': ['pull_up', 'tricep_dips'],
  'bench': ['bench_press', 'incline_dumbbell_press', 'dumbbell_flyes', 'decline_bench_press', 'preacher_curls', 'lying_tricep_extension', 'concentration_curls'],
  'incline_bench': ['incline_dumbbell_press'],
  'decline_bench': ['decline_bench_press'],
  'cables': ['cable_crossover', 'tricep_pushdowns', 'cable_curls', 'lat_pulldown', 'seated_cable_row', 'face_pulls'],
  'leg_press_machine': ['leg_press'],
  'leg_curl_machine': ['leg_curls'],
  'leg_extension_machine': ['leg_extensions'],
  'preacher_bench': ['preacher_curls'],
  't_bar_handle': ['t_bar_row'],
  'dip_bars': ['tricep_dips']
};

// Difficulty progressions
const difficultyProgressions = {
  'Beginner': {
    sets: [2, 3],
    reps: [8, 12],
    restTime: [30, 60],
    intensity: 0.6
  },
  'Intermediate': {
    sets: [3, 4],
    reps: [8, 15],
    restTime: [60, 90],
    intensity: 0.75
  },
  'Advanced': {
    sets: [4, 5],
    reps: [6, 12],
    restTime: [90, 120],
    intensity: 0.9
  }
};

// Goal-specific exercise preferences
const goalPreferences = {
  'weight_loss': {
    focusMuscles: ['legs', 'core'],
    preferredTypes: ['cardio', 'hiit'],
    repRange: [12, 20],
    restTime: [30, 60],
    intensity: 'high'
  },
  'muscle_gain': {
    focusMuscles: ['chest', 'back', 'legs'],
    preferredTypes: ['strength', 'hypertrophy'],
    repRange: [6, 12],
    restTime: [90, 180],
    intensity: 'high'
  },
  'strength': {
    focusMuscles: ['legs', 'back', 'chest'],
    preferredTypes: ['strength', 'power'],
    repRange: [1, 6],
    restTime: [180, 300],
    intensity: 'very_high'
  },
  'endurance': {
    focusMuscles: ['legs', 'core'],
    preferredTypes: ['cardio', 'endurance'],
    repRange: [15, 30],
    restTime: [30, 60],
    intensity: 'moderate'
  },
  'flexibility': {
    focusMuscles: ['core'],
    preferredTypes: ['mobility', 'stretching'],
    repRange: [1, 1],
    restTime: [30, 60],
    intensity: 'low'
  },
  'general': {
    focusMuscles: ['chest', 'back', 'legs', 'core'],
    preferredTypes: ['strength', 'cardio'],
    repRange: [8, 15],
    restTime: [60, 90],
    intensity: 'moderate'
  }
};

export class AIWorkoutGenerator {
  static generateWorkout(preferences: WorkoutPreferences): GeneratedWorkout {
    const generator = new AIWorkoutGenerator();
    return generator.createWorkout(preferences);
  }

  private mapMuscleGroups(targetMuscles: string[]): string[] {
    const mappedMuscles: string[] = [];
    
    targetMuscles.forEach(muscle => {
      if (muscleGroupMappings[muscle]) {
        // If it's a mapped group, add all the individual muscles
        mappedMuscles.push(...muscleGroupMappings[muscle]);
      } else {
        // If it's already an individual muscle, add it directly
        mappedMuscles.push(muscle);
      }
    });
    
    // Remove duplicates
    return [...new Set(mappedMuscles)];
  }

  private createWorkout(preferences: WorkoutPreferences): GeneratedWorkout {
    // Map muscle groups from AICoach format to actual muscle groups
    const mappedMuscles = this.mapMuscleGroups(preferences.targetMuscles);
    const mappedPreferences = {
      ...preferences,
      targetMuscles: mappedMuscles
    };
    
    // Determine workout structure based on duration and type
    const workoutStructure = this.determineWorkoutStructure(mappedPreferences);
    
    // Select exercises based on preferences
    const selectedExercises = this.selectExercises(mappedPreferences, workoutStructure);
    
    // Generate warmup and cooldown
    const warmup = this.generateWarmup(mappedPreferences);
    const cooldown = this.generateCooldown(mappedPreferences);
    
    // Calculate calories based on duration and intensity
    const calories = this.calculateCalories(mappedPreferences, selectedExercises);
    
    // Generate workout name and description
    const name = this.generateWorkoutName(mappedPreferences);
    const description = this.generateWorkoutDescription(mappedPreferences, selectedExercises);
    
    // Calculate confidence based on how well preferences match
    const confidence = this.calculateConfidence(mappedPreferences, selectedExercises);

    return {
      id: `ai_workout_${Date.now()}`,
      name,
      description,
      difficulty: mappedPreferences.fitnessLevel,
      duration: mappedPreferences.duration,
      type: mappedPreferences.workoutType,
      goals: mappedPreferences.goals,
      equipment: mappedPreferences.equipment,
      muscles: preferences.targetMuscles, // Use original muscle group names
      exercises: selectedExercises,
      calories,
      aiGenerated: true,
      confidence,
      warmup,
      cooldown
    };
  }

  private determineWorkoutStructure(preferences: WorkoutPreferences) {
    const duration = preferences.duration;
    const type = preferences.workoutType;
    
    if (type === 'hiit' || type === 'cardio') {
      return {
        warmupTime: Math.min(5, duration * 0.1),
        mainTime: duration * 0.8,
        cooldownTime: Math.min(10, duration * 0.1),
        exerciseCount: Math.min(8, Math.floor(duration / 5))
      };
    } else if (type === 'strength') {
      return {
        warmupTime: Math.min(10, duration * 0.15),
        mainTime: duration * 0.7,
        cooldownTime: Math.min(10, duration * 0.15),
        exerciseCount: Math.min(6, Math.floor(duration / 8))
      };
    } else {
      return {
        warmupTime: Math.min(5, duration * 0.1),
        mainTime: duration * 0.8,
        cooldownTime: Math.min(5, duration * 0.1),
        exerciseCount: Math.min(8, Math.floor(duration / 6))
      };
    }
  }

  private selectExercises(preferences: WorkoutPreferences, structure: any): GeneratedExercise[] {
    const exercises: GeneratedExercise[] = [];
    const availableExercises = this.getAvailableExercises(preferences);
    
    console.log('🔍 AI Workout Generator Debug:');
    console.log('Target Muscles:', preferences.targetMuscles);
    console.log('Available Exercises Count:', availableExercises.length);
    console.log('Exercise Count Needed:', structure.exerciseCount);
    
    if (availableExercises.length === 0) {
      console.log('❌ No exercises available! Using fallback...');
      // Fallback: return some basic exercises
      const fallbackExercises = exerciseDatabase.slice(0, Math.min(4, structure.exerciseCount));
      return fallbackExercises.map(exercise => this.generateExerciseData(exercise, preferences));
    }
    
    // Prioritize exercises based on goals and target muscles
    const prioritizedExercises = this.prioritizeExercises(availableExercises, preferences);
    
    console.log('Prioritized Exercises Count:', prioritizedExercises.length);
    
    // Select exercises ensuring variety
    const selectedIds = new Set<string>();
    let remainingCount = structure.exerciseCount;
    
    for (const exercise of prioritizedExercises) {
      if (remainingCount <= 0) break;
      if (selectedIds.has(exercise.id)) continue;
      
      const generatedExercise = this.generateExerciseData(exercise, preferences);
      exercises.push(generatedExercise);
      selectedIds.add(exercise.id);
      remainingCount--;
    }
    
    console.log('Selected Exercises Count:', exercises.length);
    console.log('Selected Exercise Names:', exercises.map(e => e.name));
    
    return exercises;
  }

  private getAvailableExercises(preferences: WorkoutPreferences) {
    let available = exerciseDatabase;
    
    console.log('🔍 getAvailableExercises Debug:');
    console.log('Total exercises in database:', available.length);
    console.log('Target muscles:', preferences.targetMuscles);
    console.log('Equipment:', preferences.equipment);
    console.log('Fitness level:', preferences.fitnessLevel);
    
    // Filter by equipment
    if (preferences.equipment.length > 0) {
      const beforeEquipment = available.length;
      available = available.filter(exercise => 
        exercise.equipment.some(eq => preferences.equipment.includes(eq))
      );
      console.log(`After equipment filter: ${beforeEquipment} -> ${available.length}`);
    }
    
    // Filter by target muscles - use the main muscle group from the 'muscle' field
    if (preferences.targetMuscles.length > 0) {
      const beforeMuscle = available.length;
      available = available.filter(exercise => {
        const exerciseMuscle = exercise.muscle.toLowerCase();
        return preferences.targetMuscles.some(targetMuscle => {
          // Direct match
          if (exerciseMuscle === targetMuscle.toLowerCase()) return true;
          
          // Check if target muscle is contained in exercise muscle
          if (exerciseMuscle.includes(targetMuscle.toLowerCase())) return true;
          
          // Check if exercise muscle is contained in target muscle
          if (targetMuscle.toLowerCase().includes(exerciseMuscle)) return true;
          
          // Special mappings
          if (targetMuscle === 'chest' && exerciseMuscle === 'chest') return true;
          if (targetMuscle === 'back' && exerciseMuscle === 'back') return true;
          if (targetMuscle === 'legs' && exerciseMuscle === 'legs') return true;
          if (targetMuscle === 'core' && exerciseMuscle === 'core') return true;
          if (targetMuscle === 'shoulders' && exerciseMuscle === 'shoulders') return true;
          if (targetMuscle === 'triceps' && exerciseMuscle === 'triceps') return true;
          if (targetMuscle === 'biceps' && exerciseMuscle === 'biceps') return true;
          
          return false;
        });
      });
      console.log(`After muscle filter: ${beforeMuscle} -> ${available.length}`);
      console.log('Available exercise muscles:', [...new Set(available.map(e => e.muscle))]);
    }
    
    // Filter by difficulty
    const difficultyLevels = this.getDifficultyLevels(preferences.fitnessLevel);
    const beforeDifficulty = available.length;
    available = available.filter(exercise => 
      difficultyLevels.includes(exercise.difficulty)
    );
    console.log(`After difficulty filter: ${beforeDifficulty} -> ${available.length}`);
    console.log('Difficulty levels:', difficultyLevels);
    
    return available;
  }

  private getDifficultyLevels(fitnessLevel: string): string[] {
    switch (fitnessLevel) {
      case 'Beginner':
        return ['Beginner'];
      case 'Intermediate':
        return ['Beginner', 'Intermediate'];
      case 'Advanced':
        return ['Beginner', 'Intermediate', 'Advanced'];
      default:
        return ['Beginner', 'Intermediate'];
    }
  }

  private prioritizeExercises(exercises: any[], preferences: WorkoutPreferences) {
    return exercises.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      // Score based on goal preferences
      preferences.goals.forEach(goal => {
        const goalPrefs = goalPreferences[goal];
        if (goalPrefs) {
          if (goalPrefs.focusMuscles.some(muscle => a.primaryMuscles.includes(muscle))) scoreA += 3;
          if (goalPrefs.focusMuscles.some(muscle => b.primaryMuscles.includes(muscle))) scoreB += 3;
          if (goalPrefs.focusMuscles.some(muscle => a.secondaryMuscles.includes(muscle))) scoreA += 1;
          if (goalPrefs.focusMuscles.some(muscle => b.secondaryMuscles.includes(muscle))) scoreB += 1;
        }
      });
      
      // Score based on target muscles
      preferences.targetMuscles.forEach(muscle => {
        if (a.primaryMuscles.includes(muscle)) scoreA += 2;
        if (b.primaryMuscles.includes(muscle)) scoreB += 2;
        if (a.secondaryMuscles.includes(muscle)) scoreA += 1;
        if (b.secondaryMuscles.includes(muscle)) scoreB += 1;
      });
      
      return scoreB - scoreA;
    });
  }

  private generateExerciseData(exercise: any, preferences: WorkoutPreferences): GeneratedExercise {
    const progression = difficultyProgressions[preferences.fitnessLevel];
    const goalPrefs = this.getPrimaryGoalPreferences(preferences.goals);
    
    // Determine sets and reps based on workout type and goals
    let sets, reps, restTime;
    
    if (preferences.workoutType === 'strength') {
      sets = this.randomBetween(progression.sets[0], progression.sets[1]);
      reps = this.randomBetween(4, 8);
      restTime = this.randomBetween(120, 180);
    } else if (preferences.workoutType === 'hiit' || preferences.workoutType === 'cardio') {
      sets = this.randomBetween(3, 5);
      reps = this.randomBetween(goalPrefs.repRange[0], goalPrefs.repRange[1]);
      restTime = this.randomBetween(30, 60);
    } else {
      sets = this.randomBetween(progression.sets[0], progression.sets[1]);
      reps = this.randomBetween(goalPrefs.repRange[0], goalPrefs.repRange[1]);
      restTime = this.randomBetween(goalPrefs.restTime[0], goalPrefs.restTime[1]);
    }
    
    return {
      id: exercise.id,
      name: exercise.name,
      muscle: exercise.muscle,
      primaryMuscles: exercise.primaryMuscles,
      secondaryMuscles: exercise.secondaryMuscles,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      instructions: exercise.instructions,
      formTips: exercise.formTips,
      commonMistakes: exercise.commonMistakes,
      sets,
      reps,
      restTime,
      weight: preferences.fitnessLevel === 'Advanced' ? this.randomBetween(20, 50) : undefined
    };
  }

  private getPrimaryGoalPreferences(goals: string[]) {
    if (goals.length === 0) return goalPreferences.general;
    
    // Return preferences for the first goal, or combine if multiple
    const primaryGoal = goals[0];
    return goalPreferences[primaryGoal] || goalPreferences.general;
  }

  private generateWarmup(preferences: WorkoutPreferences): GeneratedExercise[] {
    const warmupExercises = [
      {
        id: 'arm_circles',
        name: 'Arm Circles',
        muscle: 'Shoulders',
        primaryMuscles: ['shoulders'],
        secondaryMuscles: ['chest', 'back'],
        equipment: ['bodyweight'],
        difficulty: 'Beginner',
        instructions: ['Stand with arms extended', 'Make small circles forward', 'Reverse direction'],
        formTips: ['Keep movements controlled', 'Don\'t rush'],
        commonMistakes: ['Too fast', 'Too large circles'],
        sets: 1,
        reps: 10,
        restTime: 0
      },
      {
        id: 'leg_swings',
        name: 'Leg Swings',
        muscle: 'Legs',
        primaryMuscles: ['hip_flexors', 'glutes'],
        secondaryMuscles: ['hamstrings', 'calves'],
        equipment: ['bodyweight'],
        difficulty: 'Beginner',
        instructions: ['Hold wall for support', 'Swing leg forward and back', 'Switch legs'],
        formTips: ['Controlled movement', 'Keep core engaged'],
        commonMistakes: ['Too much momentum', 'Poor balance'],
        sets: 1,
        reps: 10,
        restTime: 0
      }
    ];
    
    return warmupExercises.map(ex => ({
      ...ex,
      id: `warmup_${ex.id}`,
      name: `Warmup: ${ex.name}`
    }));
  }

  private generateCooldown(preferences: WorkoutPreferences): GeneratedExercise[] {
    const cooldownExercises = [
      {
        id: 'standing_quad_stretch',
        name: 'Standing Quad Stretch',
        muscle: 'Legs',
        primaryMuscles: ['quadriceps'],
        secondaryMuscles: ['hip_flexors'],
        equipment: ['bodyweight'],
        difficulty: 'Beginner',
        instructions: ['Stand on one leg', 'Pull heel to glute', 'Hold stretch', 'Switch legs'],
        formTips: ['Keep knees together', 'Don\'t overstretch'],
        commonMistakes: ['Poor balance', 'Too aggressive'],
        sets: 1,
        reps: 1,
        restTime: 30
      },
      {
        id: 'shoulder_stretch',
        name: 'Shoulder Stretch',
        muscle: 'Shoulders',
        primaryMuscles: ['anterior_deltoids', 'chest'],
        secondaryMuscles: ['biceps'],
        equipment: ['bodyweight'],
        difficulty: 'Beginner',
        instructions: ['Extend arm across chest', 'Pull with other arm', 'Hold stretch', 'Switch arms'],
        formTips: ['Don\'t force the stretch', 'Breathe deeply'],
        commonMistakes: ['Too aggressive', 'Poor posture'],
        sets: 1,
        reps: 1,
        restTime: 30
      }
    ];
    
    return cooldownExercises.map(ex => ({
      ...ex,
      id: `cooldown_${ex.id}`,
      name: `Cooldown: ${ex.name}`
    }));
  }

  private calculateCalories(preferences: WorkoutPreferences, exercises: GeneratedExercise[]): number {
    const baseCaloriesPerMinute = 8; // Base calories per minute
    const intensityMultiplier = this.getIntensityMultiplier(preferences);
    const duration = preferences.duration;
    
    return Math.floor(baseCaloriesPerMinute * duration * intensityMultiplier);
  }

  private getIntensityMultiplier(preferences: WorkoutPreferences): number {
    const goalPrefs = this.getPrimaryGoalPreferences(preferences.goals);
    
    switch (goalPrefs.intensity) {
      case 'low': return 0.7;
      case 'moderate': return 1.0;
      case 'high': return 1.3;
      case 'very_high': return 1.6;
      default: return 1.0;
    }
  }

  private generateWorkoutName(preferences: WorkoutPreferences): string {
    const goal = preferences.goals[0] || 'Fitness';
    const level = preferences.fitnessLevel;
    const type = preferences.workoutType;
    const duration = preferences.duration;
    
    const goalNames = {
      'weight_loss': 'Fat Burn',
      'muscle_gain': 'Muscle Builder',
      'strength': 'Strength',
      'endurance': 'Endurance',
      'flexibility': 'Flexibility',
      'general': 'Fitness'
    };
    
    const typeNames = {
      'strength': 'Strength',
      'cardio': 'Cardio',
      'hiit': 'HIIT',
      'flexibility': 'Flexibility',
      'general': 'Workout'
    };
    
    const goalName = goalNames[goal] || 'Fitness';
    const typeName = typeNames[type] || 'Workout';
    
    return `${goalName} ${typeName} - ${level} (${duration}min)`;
  }

  private generateWorkoutDescription(preferences: WorkoutPreferences, exercises: GeneratedExercise[]): string {
    const goal = preferences.goals[0] || 'fitness';
    const level = preferences.fitnessLevel.toLowerCase();
    const muscleGroups = preferences.targetMuscles.join(', ') || 'full body';
    const exerciseCount = exercises.length;
    
    return `A ${level}-level ${goal} workout targeting ${muscleGroups}. This ${preferences.duration}-minute session includes ${exerciseCount} carefully selected exercises designed to help you achieve your fitness goals. Perfect for ${preferences.equipment.join(', ')} equipment.`;
  }

  private calculateConfidence(preferences: WorkoutPreferences, exercises: GeneratedExercise[]): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on equipment match
    const equipmentMatch = preferences.equipment.length > 0 ? 
      exercises.filter(ex => ex.equipment.some(eq => preferences.equipment.includes(eq))).length / exercises.length : 1;
    confidence += equipmentMatch * 0.2;
    
    // Increase confidence based on muscle group match
    const muscleMatch = preferences.targetMuscles.length > 0 ?
      exercises.filter(ex => 
        ex.primaryMuscles.some(muscle => preferences.targetMuscles.includes(muscle)) ||
        ex.secondaryMuscles.some(muscle => preferences.targetMuscles.includes(muscle))
      ).length / exercises.length : 1;
    confidence += muscleMatch * 0.2;
    
    // Increase confidence based on goal alignment
    const goalAlignment = this.calculateGoalAlignment(preferences.goals, exercises);
    confidence += goalAlignment * 0.1;
    
    return Math.min(0.99, confidence);
  }

  private calculateGoalAlignment(goals: string[], exercises: GeneratedExercise[]): number {
    if (goals.length === 0) return 0.5;
    
    let alignment = 0;
    goals.forEach(goal => {
      const goalPrefs = goalPreferences[goal];
      if (goalPrefs) {
        const focusMuscleMatches = exercises.filter(ex => 
          ex.primaryMuscles.some(muscle => goalPrefs.focusMuscles.includes(muscle))
        ).length;
        alignment += focusMuscleMatches / exercises.length;
      }
    });
    
    return alignment / goals.length;
  }

  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
