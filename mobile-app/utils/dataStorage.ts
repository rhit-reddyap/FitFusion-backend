import AsyncStorage from '@react-native-async-storage/async-storage';

// Data storage keys
const STORAGE_KEYS = {
  USER_STATS: 'user_stats',
  FOOD_LOGS: 'food_logs',
  WORKOUT_LOGS: 'workout_logs',
  STREAK_DATA: 'streak_data',
  DAILY_GOALS: 'daily_goals',
  ACHIEVEMENTS: 'achievements',
  CUSTOM_WORKOUTS: 'custom_workouts',
  WEARABLE_CONNECTIONS: 'wearable_connections',
  WEARABLE_DATA: 'wearable_data',
  USER_RECIPES: 'user_recipes',
  USER_PERSONAL_INFO: 'user_personal_info',
  CALORIE_TARGET: 'calorie_target',
  BODY_COMPOSITION_LOGS: 'body_composition_logs',
  PERSONAL_RECORDS: 'personal_records',
  USER_TEAMS: 'user_teams'
};

// Default user stats - all start at 0
const DEFAULT_STATS = {
  currentStreak: 0,
  longestStreak: 0,
  totalWorkouts: 0,
  totalCaloriesBurned: 0,
  totalProteinConsumed: 0,
  totalCarbsConsumed: 0,
  totalFatConsumed: 0,
  totalTonnage: 0,
  weeklyTonnage: 0,
  currentWeightKg: 0,
  currentWeightLbs: 0,
  heightCm: 0,
  heightFt: 0,
  heightIn: 0,
  waterIntake: 0,
  sleepHours: 0,
  steps: 0,
  heartRate: 0,
  bmi: 0,
  bodyFat: 0,
  muscleMass: 0,
  startDate: new Date().toISOString(),
  lastWorkoutDate: null,
  lastFoodLogDate: null
};

// Default daily goals
const DEFAULT_GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
  workouts: 1,
  water: 8,
  caloriesBurned: 500
};

export class DataStorage {
  // Get user stats
  static async getUserStats() {
    try {
      const stats = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
      return stats ? JSON.parse(stats) : DEFAULT_STATS;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return DEFAULT_STATS;
    }
  }

  // Update user stats
  static async updateUserStats(updates: Partial<typeof DEFAULT_STATS>) {
    try {
      const currentStats = await this.getUserStats();
      const updatedStats = { ...currentStats, ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(updatedStats));
      return updatedStats;
    } catch (error) {
      console.error('Error updating user stats:', error);
      return DEFAULT_STATS;
    }
  }

  // Get food logs for a specific date or all food logs
  static async getFoodLogs(date?: string) {
    try {
      const logs = await AsyncStorage.getItem(STORAGE_KEYS.FOOD_LOGS);
      const allLogs = logs ? JSON.parse(logs) : {};
      
      if (date) {
        // Return logs for specific date
        const dateLogs = allLogs[date];
        
        // Ensure we always return an array
        if (Array.isArray(dateLogs)) {
          return dateLogs;
        } else if (dateLogs && typeof dateLogs === 'object') {
          // If it's an object, convert to array
          return Object.values(dateLogs);
        } else {
          return [];
        }
      } else {
        // Return all food logs as a flat array
        const allFoodLogs: any[] = [];
        Object.values(allLogs).forEach((dateLogs: any) => {
          if (Array.isArray(dateLogs)) {
            allFoodLogs.push(...dateLogs);
          } else if (dateLogs && typeof dateLogs === 'object') {
            allFoodLogs.push(...Object.values(dateLogs));
          }
        });
        return allFoodLogs;
      }
    } catch (error) {
      console.error('Error getting food logs:', error);
      return [];
    }
  }

  // Add food log entry
  static async addFoodLog(date: string, foodEntry: any) {
    try {
      const logs = await AsyncStorage.getItem(STORAGE_KEYS.FOOD_LOGS);
      const allLogs = logs ? JSON.parse(logs) : {};
      
      if (!allLogs[date]) {
        allLogs[date] = [];
      }
      
      allLogs[date].push({
        id: Date.now().toString(),
        ...foodEntry,
        timestamp: new Date().toISOString()
      });
      
      await AsyncStorage.setItem(STORAGE_KEYS.FOOD_LOGS, JSON.stringify(allLogs));
      
      // Update daily stats
      await this.updateDailyStats(date, 'food', foodEntry);
      
      return allLogs[date];
    } catch (error) {
      console.error('Error adding food log:', error);
      return [];
    }
  }

  // Get workout logs for a specific date or all logs
  static async getWorkoutLogs(date?: string) {
    try {
      const logs = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
      const allLogs = logs ? JSON.parse(logs) : {};
      
      if (date) {
        const dateLogs = allLogs[date];
        // Ensure we always return an array
        if (Array.isArray(dateLogs)) {
          return dateLogs;
        } else if (dateLogs && typeof dateLogs === 'object') {
          // If it's an object, convert to array
          return Object.values(dateLogs);
        } else {
          return [];
        }
      }
      
      return allLogs;
    } catch (error) {
      console.error('Error getting workout logs:', error);
      return [];
    }
  }

  // Add workout log entry
  static async addWorkoutLog(date: string, workoutEntry: any) {
    try {
      const logs = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
      const allLogs = logs ? JSON.parse(logs) : {};
      
      if (!allLogs[date]) {
        allLogs[date] = [];
      }
      
      allLogs[date].push({
        id: Date.now().toString(),
        ...workoutEntry,
        timestamp: new Date().toISOString()
      });
      
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(allLogs));
      
      // Update daily stats
      await this.updateDailyStats(date, 'workout', workoutEntry);
      
      return allLogs[date];
    } catch (error) {
      console.error('Error adding workout log:', error);
      return [];
    }
  }

  // Update daily stats based on food or workout logs
  static async updateDailyStats(date: string, type: 'food' | 'workout', entry: any) {
    try {
      const stats = await this.getUserStats();
      const today = new Date().toISOString().split('T')[0];
      
      if (type === 'food') {
        const updates = {
          totalProteinConsumed: stats.totalProteinConsumed + (entry.protein || 0),
          totalCarbsConsumed: stats.totalCarbsConsumed + (entry.carbs || 0),
          totalFatConsumed: stats.totalFatConsumed + (entry.fat || 0),
          lastFoodLogDate: today
        };
        await this.updateUserStats(updates);
      } else if (type === 'workout') {
        const updates = {
          totalWorkouts: stats.totalWorkouts + 1,
          totalCaloriesBurned: stats.totalCaloriesBurned + (entry.caloriesBurned || 0),
          totalWorkoutTime: stats.totalWorkoutTime + (entry.duration || 0),
          lastWorkoutDate: today
        };
        await this.updateUserStats(updates);
      }
      
      // Update streak
      await this.updateStreak();
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  }

  // Update streak based on login activity
  static async updateStreak() {
    try {
      const stats = await this.getUserStats();
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Check if user was active today (logged in today)
      const todayWorkouts = await this.getWorkoutLogs(today);
      const todayFood = await this.getFoodLogs(today);
      const wasActiveToday = (Array.isArray(todayWorkouts) ? todayWorkouts.length : 0) > 0 || (Array.isArray(todayFood) ? todayFood.length : 0) > 0;
      
      // Check if user was active yesterday
      const yesterdayWorkouts = await this.getWorkoutLogs(yesterday);
      const yesterdayFood = await this.getFoodLogs(yesterday);
      const wasActiveYesterday = (Array.isArray(yesterdayWorkouts) ? yesterdayWorkouts.length : 0) > 0 || (Array.isArray(yesterdayFood) ? yesterdayFood.length : 0) > 0;
      
      // Check if we already updated streak for today
      const lastStreakUpdate = stats.lastStreakUpdate || '';
      
      if (lastStreakUpdate !== today) {
        if (wasActiveToday) {
          if (wasActiveYesterday) {
            // Continue streak
            const newStreak = stats.currentStreak + 1;
            await this.updateUserStats({
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, stats.longestStreak),
              lastStreakUpdate: today
            });
          } else {
            // Start new streak (user was active today but not yesterday)
            await this.updateUserStats({
              currentStreak: 1,
              longestStreak: Math.max(1, stats.longestStreak),
              lastStreakUpdate: today
            });
          }
        } else {
          // User not active today, but if they were active yesterday, keep current streak
          // Don't reset streak if user just hasn't been active today yet
          await this.updateUserStats({
            lastStreakUpdate: today
          });
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }

  // Get daily goals
  static async getDailyGoals() {
    try {
      const goals = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOALS);
      return goals ? JSON.parse(goals) : DEFAULT_GOALS;
    } catch (error) {
      console.error('Error getting daily goals:', error);
      return DEFAULT_GOALS;
    }
  }

  // Update daily goals
  static async updateDailyGoals(goals: Partial<typeof DEFAULT_GOALS>) {
    try {
      const currentGoals = await this.getDailyGoals();
      const updatedGoals = { ...currentGoals, ...goals };
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_GOALS, JSON.stringify(updatedGoals));
      return updatedGoals;
    } catch (error) {
      console.error('Error updating daily goals:', error);
      return DEFAULT_GOALS;
    }
  }

  // Save daily goals
  static async saveDailyGoals(goals: typeof DEFAULT_GOALS) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_GOALS, JSON.stringify(goals));
      return goals;
    } catch (error) {
      console.error('Error saving daily goals:', error);
      return DEFAULT_GOALS;
    }
  }

  // Calculate tonnage for a workout
  static calculateWorkoutTonnage(workout: any): number {
    if (!workout || !workout.exercises) return 0;
    
    let totalTonnage = 0;
    workout.exercises.forEach((exercise: any) => {
      if (exercise.sets && Array.isArray(exercise.sets)) {
        exercise.sets.forEach((set: any) => {
          const weight = parseFloat(set.weight) || 0;
          const reps = parseInt(set.reps) || 0;
          totalTonnage += weight * reps;
        });
      }
    });
    
    return totalTonnage;
  }

  // Calculate daily tonnage
  static async calculateDailyTonnage(date?: string): Promise<number> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const dayWorkouts = await this.getWorkoutLogs(targetDate);
      let dailyTonnage = 0;
      
      // Ensure dayWorkouts is an array before using forEach
      if (Array.isArray(dayWorkouts)) {
        dayWorkouts.forEach(workout => {
          dailyTonnage += this.calculateWorkoutTonnage(workout);
        });
      }
      
      return dailyTonnage;
    } catch (error) {
      console.error('Error calculating daily tonnage:', error);
      return 0;
    }
  }

  // Get metabolism data for user
  static async getMetabolismData() {
    try {
      const MetabolismService = (await import('../services/metabolismService')).default;
      const metabolismService = MetabolismService.getInstance();
      return await metabolismService.calculateUserMetabolism();
    } catch (error) {
      console.error('Error getting metabolism data:', error);
      return null;
    }
  }

  // Calculate weekly tonnage
  static async calculateWeeklyTonnage(): Promise<number> {
    try {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      let weeklyTonnage = 0;
      
      // Get all workout logs for the week
      for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayWorkouts = await this.getWorkoutLogs(dateStr);
        
        // Ensure dayWorkouts is an array before using forEach
        if (Array.isArray(dayWorkouts)) {
          dayWorkouts.forEach(workout => {
            weeklyTonnage += this.calculateWorkoutTonnage(workout);
          });
        }
      }
      
      return weeklyTonnage;
    } catch (error) {
      console.error('Error calculating weekly tonnage:', error);
      return 0;
    }
  }

  // Update tonnage statistics
  static async updateTonnageStats(workoutTonnage: number) {
    try {
      const stats = await this.getUserStats();
      const newTotalTonnage = stats.totalTonnage + workoutTonnage;
      const weeklyTonnage = await this.calculateWeeklyTonnage();
      
      await this.updateUserStats({
        totalTonnage: newTotalTonnage,
        weeklyTonnage: weeklyTonnage
      });
    } catch (error) {
      console.error('Error updating tonnage stats:', error);
    }
  }

  // Update workout streak specifically
  static async updateWorkoutStreak() {
    try {
      const stats = await this.getUserStats();
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      let newStreak = stats.workoutStreak || 0;
      
      if (stats.lastWorkoutDate === yesterday) {
        // Consecutive day - increment streak
        newStreak += 1;
      } else if (stats.lastWorkoutDate !== today) {
        // Not consecutive - reset streak
        newStreak = 1;
      }
      // If lastWorkoutDate is today, keep current streak
      
      await this.updateUserStats({
        workoutStreak: newStreak,
        lastWorkoutDate: today
      });
    } catch (error) {
      console.error('Error updating workout streak:', error);
    }
  }

  // Get today's progress
  static async getTodaysProgress() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [foodLogs, workoutLogs, goals, wearableData, dailyTonnage, metabolismData] = await Promise.all([
        this.getFoodLogs(today),
        this.getWorkoutLogs(today),
        this.getDailyGoals(),
        this.getWearableData(today),
        this.calculateDailyTonnage(today),
        this.getMetabolismData()
      ]);
      
      // Ensure all variables are arrays before using reduce
      const safeFoodLogs = Array.isArray(foodLogs) ? foodLogs : [];
      const safeWorkoutLogs = Array.isArray(workoutLogs) ? workoutLogs : [];
      const safeWearableData = Array.isArray(wearableData) ? wearableData : [];
      
      const totalCalories = safeFoodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
      const totalProtein = safeFoodLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
      const totalCarbs = safeFoodLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
      const totalFat = safeFoodLogs.reduce((sum, log) => sum + (log.fat || 0), 0);
      const totalWorkouts = safeWorkoutLogs.length;
      
      // Calculate calories burned from workouts
      const workoutCaloriesBurned = safeWorkoutLogs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0);
      
      // Calculate calories burned from wearable devices (like Whoop)
      const wearableCaloriesBurned = safeWearableData.reduce((sum, data) => sum + (data.caloriesBurned || 0), 0);
      
      // Calculate metabolism calories (BMR)
      const metabolismCalories = metabolismData?.caloriesFromMetabolism || 0;
      
      // Total calories burned logic:
      // 1. If wearable data exists, use it (it should include metabolism + activity)
      // 2. If no wearable data, use metabolism + workout calories
      let totalCaloriesBurned;
      if (wearableCaloriesBurned > 0) {
        // Wearable data overrides everything (includes metabolism + activity)
        totalCaloriesBurned = wearableCaloriesBurned;
      } else {
        // No wearable data, use metabolism + workout calories
        totalCaloriesBurned = metabolismCalories + workoutCaloriesBurned;
      }
      
      return {
        calories: { current: totalCalories, goal: goals.calories, percentage: (totalCalories / goals.calories) * 100 },
        protein: { current: totalProtein, goal: goals.protein, percentage: (totalProtein / goals.protein) * 100 },
        carbs: { current: totalCarbs, goal: goals.carbs, percentage: (totalCarbs / goals.carbs) * 100 },
        fat: { current: totalFat, goal: goals.fat, percentage: (totalFat / goals.fat) * 100 },
        workouts: { current: totalWorkouts, goal: goals.workouts, percentage: (totalWorkouts / goals.workouts) * 100 },
        caloriesBurned: totalCaloriesBurned,
        caloriesBurnedGoal: goals.caloriesBurned || 500,
        dailyTonnage: dailyTonnage,
        metabolismCalories: metabolismCalories,
        workoutCaloriesBurned: workoutCaloriesBurned,
        wearableCaloriesBurned: wearableCaloriesBurned
      };
    } catch (error) {
      console.error('Error getting today\'s progress:', error);
      return null;
    }
  }

  // Add water intake
  static async addWaterIntake(amount: number) {
    try {
      const stats = await this.getUserStats();
      const newWaterIntake = stats.waterIntake + amount;
      await this.updateUserStats({ waterIntake: newWaterIntake });
      return newWaterIntake;
    } catch (error) {
      console.error('Error adding water intake:', error);
      return 0;
    }
  }

  // Update weight in both units
  static async updateWeight(weightKg: number) {
    try {
      const weightLbs = Math.round(weightKg * 2.20462 * 10) / 10; // Convert to lbs with 1 decimal
      await this.updateUserStats({ 
        currentWeightKg: weightKg,
        currentWeightLbs: weightLbs
      });
      return { weightKg, weightLbs };
    } catch (error) {
      console.error('Error updating weight:', error);
      return { weightKg: 0, weightLbs: 0 };
    }
  }

  // Update height in both units
  static async updateHeight(heightCm: number) {
    try {
      const totalInches = Math.round(heightCm / 2.54);
      const heightFt = Math.floor(totalInches / 12);
      const heightIn = totalInches % 12;
      
      await this.updateUserStats({ 
        heightCm,
        heightFt,
        heightIn
      });
      return { heightCm, heightFt, heightIn };
    } catch (error) {
      console.error('Error updating height:', error);
      return { heightCm: 0, heightFt: 0, heightIn: 0 };
    }
  }

  // Calculate BMI
  static async calculateBMI() {
    try {
      const stats = await this.getUserStats();
      if (stats.currentWeightKg > 0 && stats.heightCm > 0) {
        const heightM = stats.heightCm / 100;
        const bmi = Math.round((stats.currentWeightKg / (heightM * heightM)) * 10) / 10;
        await this.updateUserStats({ bmi });
        return bmi;
      }
      return 0;
    } catch (error) {
      console.error('Error calculating BMI:', error);
      return 0;
    }
  }

  // Get water intake for today
  static async getTodaysWaterIntake() {
    try {
      const stats = await this.getUserStats();
      return stats.waterIntake || 0;
    } catch (error) {
      console.error('Error getting water intake:', error);
      return 0;
    }
  }

  // Reset daily water intake
  static async resetDailyWaterIntake() {
    try {
      await this.updateUserStats({ waterIntake: 0 });
    } catch (error) {
      console.error('Error resetting water intake:', error);
    }
  }

  // Custom Workouts
  static async getCustomWorkouts() {
    try {
      const workouts = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_WORKOUTS);
      return workouts ? JSON.parse(workouts) : [];
    } catch (error) {
      console.error('Error getting custom workouts:', error);
      return [];
    }
  }

  static async saveCustomWorkouts(workouts) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_WORKOUTS, JSON.stringify(workouts));
    } catch (error) {
      console.error('Error saving custom workouts:', error);
    }
  }

  static async addCustomWorkout(workout) {
    try {
      const workouts = await this.getCustomWorkouts();
      workouts.push(workout);
      await this.saveCustomWorkouts(workouts);
    } catch (error) {
      console.error('Error adding custom workout:', error);
    }
  }

  static async updateCustomWorkout(workoutId, updatedWorkout) {
    try {
      const workouts = await this.getCustomWorkouts();
      const index = workouts.findIndex(w => w.id === workoutId);
      if (index !== -1) {
        workouts[index] = updatedWorkout;
        await this.saveCustomWorkouts(workouts);
      }
    } catch (error) {
      console.error('Error updating custom workout:', error);
    }
  }

  static async deleteCustomWorkout(workoutId) {
    try {
      const workouts = await this.getCustomWorkouts();
      const filteredWorkouts = workouts.filter(w => w.id !== workoutId);
      await this.saveCustomWorkouts(filteredWorkouts);
    } catch (error) {
      console.error('Error deleting custom workout:', error);
    }
  }

  // Generic data storage methods
  static async getData(key: string) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  }

  static async saveData(key: string, data: any) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Wearable Data Methods
  static async getWearableData(date?: string) {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WEARABLE_DATA);
      const allData = data ? JSON.parse(data) : {};
      
      if (date) {
        return allData[date] || [];
      }
      
      return allData;
    } catch (error) {
      console.error('Error getting wearable data:', error);
      return date ? [] : {};
    }
  }

  static async addWearableData(date: string, wearableEntry: any) {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WEARABLE_DATA);
      const allData = data ? JSON.parse(data) : {};
      
      if (!allData[date]) {
        allData[date] = [];
      }
      
      allData[date].push({
        id: Date.now().toString(),
        ...wearableEntry,
        timestamp: new Date().toISOString()
      });
      
      await AsyncStorage.setItem(STORAGE_KEYS.WEARABLE_DATA, JSON.stringify(allData));
      
      // Update daily stats with wearable data
      await this.updateDailyStatsFromWearable(date, wearableEntry);
      
      return allData[date];
    } catch (error) {
      console.error('Error adding wearable data:', error);
      return [];
    }
  }

  static async updateDailyStatsFromWearable(date: string, wearableEntry: any) {
    try {
      const stats = await this.getUserStats();
      const today = new Date().toISOString().split('T')[0];
      
      const updates = {
        totalCaloriesBurned: stats.totalCaloriesBurned + (wearableEntry.caloriesBurned || 0),
        steps: Math.max(stats.steps, wearableEntry.steps || 0),
        heartRate: wearableEntry.heartRate?.average || stats.heartRate,
        sleepHours: wearableEntry.sleep?.duration ? wearableEntry.sleep.duration / 60 : stats.sleepHours
      };
      
      await this.updateUserStats(updates);
    } catch (error) {
      console.error('Error updating daily stats from wearable:', error);
    }
  }

  static async getWearableConnections() {
    try {
      const connections = await AsyncStorage.getItem(STORAGE_KEYS.WEARABLE_CONNECTIONS);
      return connections ? JSON.parse(connections) : [];
    } catch (error) {
      console.error('Error getting wearable connections:', error);
      return [];
    }
  }

  static async saveWearableConnections(connections: any[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WEARABLE_CONNECTIONS, JSON.stringify(connections));
    } catch (error) {
      console.error('Error saving wearable connections:', error);
    }
  }

  // User Recipes Methods
  static async getUserRecipes() {
    try {
      const recipes = await AsyncStorage.getItem(STORAGE_KEYS.USER_RECIPES);
      return recipes ? JSON.parse(recipes) : [];
    } catch (error) {
      console.error('Error getting user recipes:', error);
      return [];
    }
  }

  static async addUserRecipe(recipe: any) {
    try {
      const recipes = await this.getUserRecipes();
      const newRecipe = {
        id: Date.now().toString(),
        ...recipe,
        createdAt: new Date().toISOString(),
        createdBy: 'user'
      };
      
      recipes.push(newRecipe);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_RECIPES, JSON.stringify(recipes));
      return newRecipe;
    } catch (error) {
      console.error('Error adding user recipe:', error);
      return null;
    }
  }

  static async updateUserRecipe(recipeId: string, updates: any) {
    try {
      const recipes = await this.getUserRecipes();
      const index = recipes.findIndex((r: any) => r.id === recipeId);
      
      if (index !== -1) {
        recipes[index] = { ...recipes[index], ...updates, updatedAt: new Date().toISOString() };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_RECIPES, JSON.stringify(recipes));
        return recipes[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating user recipe:', error);
      return null;
    }
  }

  static async deleteUserRecipe(recipeId: string) {
    try {
      const recipes = await this.getUserRecipes();
      const filteredRecipes = recipes.filter((r: any) => r.id !== recipeId);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_RECIPES, JSON.stringify(filteredRecipes));
      return true;
    } catch (error) {
      console.error('Error deleting user recipe:', error);
      return false;
    }
  }

  static async logRecipeToFoodDiary(recipe: any, mealType: string = 'lunch', servings: number = 1) {
    try {
      const foodEntry = {
        id: Date.now().toString(),
        name: recipe.name,
        brand: 'Homemade',
        amount: servings,
        unit: 'serving',
        calories: (recipe.calories || 0) * servings,
        protein: (recipe.protein || 0) * servings,
        carbs: (recipe.carbs || 0) * servings,
        fat: (recipe.fat || 0) * servings,
        fiber: (recipe.fiber || 0) * servings,
        sugar: (recipe.sugar || 0) * servings,
        sodium: (recipe.sodium || 0) * servings,
        mealType: mealType,
        loggedAt: new Date().toISOString(),
        isRecipe: true,
        recipeId: recipe.id
      };

      await this.addFoodLog(new Date().toISOString().split('T')[0], foodEntry);
      return foodEntry;
    } catch (error) {
      console.error('Error logging recipe to food diary:', error);
      return null;
    }
  }

  // Clear all data (for testing)
  static async clearAllData() {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      console.log('All data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  // Personal Information
  static async getPersonalInfo(): Promise<any> {
    try {
      const personalInfo = await AsyncStorage.getItem(STORAGE_KEYS.USER_PERSONAL_INFO);
      return personalInfo ? JSON.parse(personalInfo) : null;
    } catch (error) {
      console.error('Error getting personal info:', error);
      return null;
    }
  }

  static async savePersonalInfo(personalInfo: any): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PERSONAL_INFO, JSON.stringify(personalInfo));
      return true;
    } catch (error) {
      console.error('Error saving personal info:', error);
      return false;
    }
  }

  // Body Composition methods
  static async getBodyCompositionLogs(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BODY_COMPOSITION_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting body composition logs:', error);
      return [];
    }
  }

  static async addBodyCompositionLog(bodyData: any): Promise<void> {
    try {
      const logs = await this.getBodyCompositionLogs();
      logs.push({
        ...bodyData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      });
      await AsyncStorage.setItem(STORAGE_KEYS.BODY_COMPOSITION_LOGS, JSON.stringify(logs));
    } catch (error) {
      console.error('Error adding body composition log:', error);
    }
  }

  // Personal Records methods
  static async getPersonalRecords(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PERSONAL_RECORDS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting personal records:', error);
      return {};
    }
  }

  static async savePersonalRecord(exerciseKey: string, record: any): Promise<void> {
    try {
      const records = await this.getPersonalRecords();
      records[exerciseKey] = record;
      await AsyncStorage.setItem(STORAGE_KEYS.PERSONAL_RECORDS, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving personal record:', error);
    }
  }

  // User Teams methods
  static async getUserTeams(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_TEAMS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting user teams:', error);
      return [];
    }
  }

  static async saveUserTeams(teams: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TEAMS, JSON.stringify(teams));
    } catch (error) {
      console.error('Error saving user teams:', error);
    }
  }




  // Save workout logs
  static async saveWorkoutLogs(workoutLogs: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(workoutLogs));
    } catch (error) {
      console.error('Error saving workout logs:', error);
    }
  }

  // Save user stats
  static async saveUserStats(stats: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving user stats:', error);
    }
  }

  // Calorie Target methods
  static async getCalorieTarget(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CALORIE_TARGET);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting calorie target:', error);
      return null;
    }
  }

  static async saveCalorieTarget(target: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CALORIE_TARGET, JSON.stringify(target));
    } catch (error) {
      console.error('Error saving calorie target:', error);
    }
  }
}
