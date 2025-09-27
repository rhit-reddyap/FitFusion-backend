import { DataStorage } from '../utils/dataStorage';

export interface WorkoutData {
  id: string;
  date: string;
  exercises: ExerciseData[];
  duration: number; // in minutes
  totalTonnage: number; // total weight lifted
  caloriesBurned: number;
  notes?: string;
}

export interface ExerciseData {
  name: string;
  sets: SetData[];
  muscleGroups: string[];
}

export interface SetData {
  reps: number;
  weight: number;
  restTime?: number;
  completed: boolean;
}

export interface BodyCompositionData {
  date: string;
  weight: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
}

export interface NutritionData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  water: number; // in ml
}

export interface WearableData {
  date: string;
  caloriesBurned: number;
  steps: number;
  heartRate?: {
    average: number;
    max: number;
    resting: number;
  };
  sleep?: {
    duration: number; // in hours
    quality: number; // 1-10
  };
  activeMinutes: number;
}

export interface AnalyticsMetrics {
  // Workout Metrics
  totalWorkouts: number;
  totalTonnage: number;
  averageWorkoutDuration: number;
  weeklyTonnage: number;
  monthlyTonnage: number;
  favoriteExercises: { name: string; count: number }[];
  muscleGroupFrequency: { muscle: string; count: number }[];
  
  // Body Composition
  currentWeight: number;
  weightChange: number; // from last week
  currentBodyFat: number;
  bodyFatChange: number; // from last week
  bodyFatHistory: { date: string; percentage: number }[];
  
  // Nutrition
  averageDailyCalories: number;
  averageDailyProtein: number;
  averageDailyCarbs: number;
  averageDailyFat: number;
  weeklyCalorieDeficit: number;
  waterIntakeAverage: number;
  
  // Wearable Integration
  totalCaloriesBurned: number;
  averageSteps: number;
  averageHeartRate: number;
  sleepQuality: number;
  
  // Progress Tracking
  weeklyProgress: {
    week: string;
    tonnage: number;
    calories: number;
    weight: number;
    bodyFat?: number;
  }[];
  
  // AI Recommendations
  recommendations: {
    type: 'workout' | 'nutrition' | 'recovery';
    message: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

class AnalyticsService {
  private static instance: AnalyticsService;

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Calculate tonnage for a workout
  calculateTonnage(exercises: ExerciseData[]): number {
    return exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + (set.weight * set.reps);
      }, 0);
    }, 0);
  }

  // Get workout data for analytics
  async getWorkoutData(startDate: Date, endDate: Date): Promise<WorkoutData[]> {
    try {
      // Get all workout logs (without date filter from DataStorage)
      const allWorkouts = await DataStorage.getWorkoutLogs();
      
      // Ensure allWorkouts is an array
      const safeWorkouts = Array.isArray(allWorkouts) ? allWorkouts : [];
      
      return safeWorkouts.filter(workout => {
        if (!workout || !workout.date) return false;
        const workoutDate = new Date(workout.date);
        return workoutDate >= startDate && workoutDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting workout data:', error);
      return [];
    }
  }

  // Get body composition data
  async getBodyCompositionData(startDate: Date, endDate: Date): Promise<BodyCompositionData[]> {
    try {
      const allData = await DataStorage.getBodyCompositionLogs();
      return allData.filter(data => {
        const dataDate = new Date(data.date);
        return dataDate >= startDate && dataDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting body composition data:', error);
      return [];
    }
  }

  // Get nutrition data
  async getNutritionData(startDate: Date, endDate: Date): Promise<NutritionData[]> {
    try {
      // Get all food logs (without date filter from DataStorage)
      const allFoodLogs = await DataStorage.getFoodLogs();
      
      // Ensure allFoodLogs is an array
      const safeFoodLogs = Array.isArray(allFoodLogs) ? allFoodLogs : [];
      
      return safeFoodLogs.filter(log => {
        if (!log || !log.date) return false;
        const logDate = new Date(log.date);
        return logDate >= startDate && logDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting nutrition data:', error);
      return [];
    }
  }

  // Get wearable data
  async getWearableData(startDate: Date, endDate: Date): Promise<WearableData[]> {
    try {
      const allWearableData = await DataStorage.getWearableData();
      
      // Ensure allWearableData is an array
      const safeWearableData = Array.isArray(allWearableData) ? allWearableData : [];
      
      return safeWearableData.filter(data => {
        if (!data || !data.date) return false;
        const dataDate = new Date(data.date);
        return dataDate >= startDate && dataDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting wearable data:', error);
      return [];
    }
  }

  // Calculate comprehensive analytics
  async calculateAnalytics(): Promise<AnalyticsMetrics> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all data
    const [workoutData, bodyCompositionData, nutritionData, wearableData] = await Promise.all([
      this.getWorkoutData(oneMonthAgo, now),
      this.getBodyCompositionData(oneMonthAgo, now),
      this.getNutritionData(oneWeekAgo, now),
      this.getWearableData(oneWeekAgo, now)
    ]);

    // Calculate workout metrics
    const totalWorkouts = workoutData.length;
    const totalTonnage = workoutData.reduce((sum, workout) => sum + workout.totalTonnage, 0);
    const averageWorkoutDuration = workoutData.length > 0 
      ? workoutData.reduce((sum, workout) => sum + workout.duration, 0) / workoutData.length 
      : 0;

    // Weekly and monthly tonnage
    const weeklyWorkouts = workoutData.filter(w => new Date(w.date) >= oneWeekAgo);
    const weeklyTonnage = weeklyWorkouts.reduce((sum, workout) => sum + workout.totalTonnage, 0);
    const monthlyTonnage = workoutData.reduce((sum, workout) => sum + workout.totalTonnage, 0);

    // Favorite exercises
    const exerciseCounts: { [key: string]: number } = {};
    workoutData.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseCounts[exercise.name] = (exerciseCounts[exercise.name] || 0) + 1;
      });
    });
    const favoriteExercises = Object.entries(exerciseCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Muscle group frequency
    const muscleCounts: { [key: string]: number } = {};
    workoutData.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.muscleGroups.forEach(muscle => {
          muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
        });
      });
    });
    const muscleGroupFrequency = Object.entries(muscleCounts)
      .map(([muscle, count]) => ({ muscle, count }))
      .sort((a, b) => b.count - a.count);

    // Body composition metrics
    const latestBodyData = bodyCompositionData.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    const previousBodyData = bodyCompositionData.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[1];

    const currentWeight = latestBodyData?.weight || 0;
    const weightChange = latestBodyData && previousBodyData 
      ? latestBodyData.weight - previousBodyData.weight 
      : 0;

    const currentBodyFat = latestBodyData?.bodyFatPercentage || 0;
    const bodyFatChange = latestBodyData && previousBodyData 
      ? (latestBodyData.bodyFatPercentage || 0) - (previousBodyData.bodyFatPercentage || 0)
      : 0;

    const bodyFatHistory = bodyCompositionData
      .filter(data => data.bodyFatPercentage !== undefined)
      .map(data => ({
        date: data.date,
        percentage: data.bodyFatPercentage!
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Nutrition metrics
    const averageDailyCalories = nutritionData.length > 0
      ? nutritionData.reduce((sum, data) => sum + data.calories, 0) / nutritionData.length
      : 0;
    const averageDailyProtein = nutritionData.length > 0
      ? nutritionData.reduce((sum, data) => sum + data.protein, 0) / nutritionData.length
      : 0;
    const averageDailyCarbs = nutritionData.length > 0
      ? nutritionData.reduce((sum, data) => sum + data.carbs, 0) / nutritionData.length
      : 0;
    const averageDailyFat = nutritionData.length > 0
      ? nutritionData.reduce((sum, data) => sum + data.fat, 0) / nutritionData.length
      : 0;
    const waterIntakeAverage = nutritionData.length > 0
      ? nutritionData.reduce((sum, data) => sum + data.water, 0) / nutritionData.length
      : 0;

    // Calculate calorie deficit
    const totalCaloriesConsumed = nutritionData.reduce((sum, data) => sum + data.calories, 0);
    const totalCaloriesBurned = wearableData.reduce((sum, data) => sum + data.caloriesBurned, 0);
    const weeklyCalorieDeficit = totalCaloriesBurned - totalCaloriesConsumed;

    // Wearable metrics
    const averageSteps = wearableData.length > 0
      ? wearableData.reduce((sum, data) => sum + data.steps, 0) / wearableData.length
      : 0;
    const averageHeartRate = wearableData.length > 0
      ? wearableData.reduce((sum, data) => sum + (data.heartRate?.average || 0), 0) / wearableData.length
      : 0;
    const sleepQuality = wearableData.length > 0
      ? wearableData.reduce((sum, data) => sum + (data.sleep?.quality || 0), 0) / wearableData.length
      : 0;

    // Weekly progress
    const weeklyProgress = this.calculateWeeklyProgress(workoutData, bodyCompositionData, nutritionData);

    // AI Recommendations
    const recommendations = this.generateRecommendations({
      totalWorkouts,
      weeklyTonnage,
      currentBodyFat,
      bodyFatChange,
      averageDailyCalories,
      weeklyCalorieDeficit,
      averageSteps,
      sleepQuality
    });

    return {
      totalWorkouts,
      totalTonnage,
      averageWorkoutDuration,
      weeklyTonnage,
      monthlyTonnage,
      favoriteExercises,
      muscleGroupFrequency,
      currentWeight,
      weightChange,
      currentBodyFat,
      bodyFatChange,
      bodyFatHistory,
      averageDailyCalories,
      averageDailyProtein,
      averageDailyCarbs,
      averageDailyFat,
      weeklyCalorieDeficit,
      waterIntakeAverage,
      totalCaloriesBurned,
      averageSteps,
      averageHeartRate,
      sleepQuality,
      weeklyProgress,
      recommendations
    };
  }

  private calculateWeeklyProgress(
    workoutData: WorkoutData[],
    bodyCompositionData: BodyCompositionData[],
    nutritionData: NutritionData[]
  ) {
    const weeks: { [key: string]: any } = {};
    
    // Group data by week
    [...workoutData, ...bodyCompositionData, ...nutritionData].forEach(item => {
      const date = new Date(item.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          week: weekKey,
          tonnage: 0,
          calories: 0,
          weight: 0,
          bodyFat: 0
        };
      }
      
      if ('totalTonnage' in item) {
        weeks[weekKey].tonnage += item.totalTonnage;
      }
      if ('calories' in item) {
        weeks[weekKey].calories += item.calories;
      }
      if ('weight' in item) {
        weeks[weekKey].weight = item.weight; // Use latest weight
      }
      if ('bodyFatPercentage' in item && item.bodyFatPercentage) {
        weeks[weekKey].bodyFat = item.bodyFatPercentage;
      }
    });
    
    return Object.values(weeks).sort((a: any, b: any) => 
      new Date(a.week).getTime() - new Date(b.week).getTime()
    );
  }

  private generateRecommendations(metrics: any) {
    const recommendations = [];
    
    // Workout recommendations
    if (metrics.totalWorkouts < 3) {
      recommendations.push({
        type: 'workout' as const,
        message: 'Try to work out at least 3 times per week for optimal results.',
        priority: 'high' as const
      });
    }
    
    if (metrics.weeklyTonnage < 10000) {
      recommendations.push({
        type: 'workout' as const,
        message: 'Consider increasing your training volume to build more strength.',
        priority: 'medium' as const
      });
    }
    
    // Nutrition recommendations
    if (metrics.weeklyCalorieDeficit < -500) {
      recommendations.push({
        type: 'nutrition' as const,
        message: 'You\'re in a calorie deficit. Great for fat loss!',
        priority: 'low' as const
      });
    } else if (metrics.weeklyCalorieDeficit > 500) {
      recommendations.push({
        type: 'nutrition' as const,
        message: 'You\'re in a calorie surplus. Consider reducing intake for fat loss.',
        priority: 'high' as const
      });
    }
    
    // Recovery recommendations
    if (metrics.sleepQuality < 7) {
      recommendations.push({
        type: 'recovery' as const,
        message: 'Improve your sleep quality for better recovery and results.',
        priority: 'high' as const
      });
    }
    
    return recommendations;
  }
}

export default AnalyticsService;



