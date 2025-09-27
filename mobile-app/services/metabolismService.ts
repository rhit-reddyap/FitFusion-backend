// Metabolism Calculation Service
// Calculates BMR (Basal Metabolic Rate) and TDEE (Total Daily Energy Expenditure)

export interface MetabolismData {
  bmr: number; // Basal Metabolic Rate (calories at rest)
  tdee: number; // Total Daily Energy Expenditure
  activityLevel: string;
  caloriesFromMetabolism: number; // Daily calories from metabolism
}

export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  height: number; // in cm
  weight: number; // in kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

class MetabolismService {
  private static instance: MetabolismService;

  public static getInstance(): MetabolismService {
    if (!MetabolismService.instance) {
      MetabolismService.instance = new MetabolismService();
    }
    return MetabolismService.instance;
  }

  // Calculate BMR using Mifflin-St Jeor Equation (most accurate)
  calculateBMR(profile: UserProfile): number {
    const { age, gender, height, weight } = profile;
    
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  // Calculate TDEE based on activity level
  calculateTDEE(profile: UserProfile): number {
    const bmr = this.calculateBMR(profile);
    const activityMultipliers = {
      sedentary: 1.2,      // Little to no exercise
      light: 1.375,        // Light exercise 1-3 days/week
      moderate: 1.55,      // Moderate exercise 3-5 days/week
      active: 1.725,       // Heavy exercise 6-7 days/week
      very_active: 1.9     // Very heavy exercise, physical job
    };
    
    return bmr * activityMultipliers[profile.activityLevel];
  }

  // Calculate daily calories from metabolism (BMR portion of TDEE)
  calculateMetabolismCalories(profile: UserProfile): number {
    const bmr = this.calculateBMR(profile);
    const tdee = this.calculateTDEE(profile);
    
    // Return the BMR portion (metabolism) of the total daily energy expenditure
    // This represents calories burned just from basic bodily functions
    return Math.round(bmr);
  }

  // Get comprehensive metabolism data
  getMetabolismData(profile: UserProfile): MetabolismData {
    const bmr = this.calculateBMR(profile);
    const tdee = this.calculateTDEE(profile);
    const caloriesFromMetabolism = this.calculateMetabolismCalories(profile);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      activityLevel: profile.activityLevel,
      caloriesFromMetabolism
    };
  }

  // Calculate metabolism for a user from stored personal info
  async calculateUserMetabolism(): Promise<MetabolismData | null> {
    try {
      const { DataStorage } = await import('../utils/dataStorage');
      const personalInfo = await DataStorage.getPersonalInfo();
      
      if (!personalInfo) {
        return null;
      }

      // Get weekly average weight from body composition logs
      const weeklyAverageWeight = await this.getWeeklyAverageWeight();
      
      const profile: UserProfile = {
        age: personalInfo.age || 25,
        gender: personalInfo.gender || 'male',
        height: personalInfo.height || 175,
        weight: weeklyAverageWeight || personalInfo.weight || 70, // Use weekly average if available
        activityLevel: personalInfo.activityLevel || 'moderate'
      };

      return this.getMetabolismData(profile);
    } catch (error) {
      console.error('Error calculating user metabolism:', error);
      return null;
    }
  }

  // Get weekly average weight from body composition logs
  async getWeeklyAverageWeight(): Promise<number | null> {
    try {
      const { DataStorage } = await import('../utils/dataStorage');
      const bodyCompositionLogs = await DataStorage.getBodyCompositionLogs();
      
      if (!bodyCompositionLogs || bodyCompositionLogs.length === 0) {
        return null;
      }
      
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weeklyLogs = bodyCompositionLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate <= weekEnd && log.weight;
      });
      
      if (weeklyLogs.length === 0) {
        return null;
      }
      
      const totalWeight = weeklyLogs.reduce((sum, log) => sum + log.weight, 0);
      return totalWeight / weeklyLogs.length;
    } catch (error) {
      console.error('Error getting weekly average weight:', error);
      return null;
    }
  }

  // Get activity level description
  getActivityLevelDescription(activityLevel: string): string {
    const descriptions = {
      sedentary: 'Little to no exercise',
      light: 'Light exercise 1-3 days/week',
      moderate: 'Moderate exercise 3-5 days/week',
      active: 'Heavy exercise 6-7 days/week',
      very_active: 'Very heavy exercise, physical job'
    };
    
    return descriptions[activityLevel] || 'Moderate activity';
  }
}

export default MetabolismService;


