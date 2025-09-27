import { DataStorage } from '../utils/dataStorage';

export interface CalorieTarget {
  dailyTarget: number;
  weeklyTarget: number;
  goal: 'lose' | 'maintain' | 'gain';
  targetWeight: number;
  currentWeight: number;
  weeklyAdjustment: number;
  lastUpdated: string;
  reasoning: string;
}

export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  height: number; // in cm
  weight: number; // in kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  targetWeight?: number;
  targetDate?: string;
}

class CalorieTargetService {
  private static instance: CalorieTargetService;

  public static getInstance(): CalorieTargetService {
    if (!CalorieTargetService.instance) {
      CalorieTargetService.instance = new CalorieTargetService();
    }
    return CalorieTargetService.instance;
  }

  // Calculate BMR using Mifflin-St Jeor Equation
  private calculateBMR(profile: UserProfile): number {
    const { age, gender, height, weight } = profile;
    
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  // Calculate TDEE (Total Daily Energy Expenditure)
  private calculateTDEE(profile: UserProfile): number {
    const bmr = this.calculateBMR(profile);
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    return bmr * activityMultipliers[profile.activityLevel];
  }

  // Calculate calorie target based on goal
  private calculateCalorieTarget(profile: UserProfile, tdee: number): number {
    const { goal, targetWeight, weight } = profile;
    
    switch (goal) {
      case 'lose':
        // 1 lb = 3500 calories, aim for 1-2 lbs per week
        const weightToLose = (targetWeight || weight) - weight;
        const weeklyDeficit = Math.min(Math.abs(weightToLose) * 3500, 7000); // Max 2 lbs per week
        return Math.max(tdee - (weeklyDeficit / 7), tdee * 0.8); // Never go below 80% of TDEE
      
      case 'gain':
        // Aim for 0.5-1 lb per week
        const weightToGain = (targetWeight || weight) - weight;
        const weeklySurplus = Math.min(Math.abs(weightToGain) * 3500, 3500); // Max 1 lb per week
        return tdee + (weeklySurplus / 7);
      
      case 'maintain':
      default:
        return tdee;
    }
  }

  // Generate AI reasoning for calorie target
  private generateReasoning(profile: UserProfile, target: number, tdee: number): string {
    const { goal, weight, targetWeight, activityLevel } = profile;
    
    let reasoning = `Based on your profile (${profile.age}yo ${profile.gender}, ${profile.height}cm, ${profile.weight}kg, ${activityLevel} activity):\n\n`;
    
    reasoning += `• Your BMR is ${this.calculateBMR(profile).toFixed(0)} calories/day\n`;
    reasoning += `• Your TDEE is ${tdee.toFixed(0)} calories/day\n\n`;
    
    switch (goal) {
      case 'lose':
        if (targetWeight && targetWeight < weight) {
          const weeklyDeficit = (tdee - target) * 7;
          const weeklyLoss = weeklyDeficit / 3500;
          reasoning += `• For weight loss: ${target.toFixed(0)} calories/day\n`;
          reasoning += `• Expected loss: ${weeklyLoss.toFixed(1)} lbs/week\n`;
          reasoning += `• Time to goal: ${Math.ceil((weight - targetWeight) / weeklyLoss)} weeks\n`;
        } else {
          reasoning += `• For weight loss: ${target.toFixed(0)} calories/day\n`;
          reasoning += `• Moderate deficit for sustainable results\n`;
        }
        break;
        
      case 'gain':
        if (targetWeight && targetWeight > weight) {
          const weeklySurplus = (target - tdee) * 7;
          const weeklyGain = weeklySurplus / 3500;
          reasoning += `• For weight gain: ${target.toFixed(0)} calories/day\n`;
          reasoning += `• Expected gain: ${weeklyGain.toFixed(1)} lbs/week\n`;
          reasoning += `• Time to goal: ${Math.ceil((targetWeight - weight) / weeklyGain)} weeks\n`;
        } else {
          reasoning += `• For weight gain: ${target.toFixed(0)} calories/day\n`;
          reasoning += `• Moderate surplus for lean gains\n`;
        }
        break;
        
      case 'maintain':
        reasoning += `• For maintenance: ${target.toFixed(0)} calories/day\n`;
        reasoning += `• Matches your TDEE for weight stability\n`;
        break;
    }
    
    reasoning += `\nThis target will be adjusted weekly based on your progress.`;
    
    return reasoning;
  }

  // Calculate weekly adjustment based on progress
  private calculateWeeklyAdjustment(
    currentTarget: number,
    actualCalories: number[],
    weightChange: number,
    goal: string
  ): number {
    const avgCalories = actualCalories.reduce((sum, cal) => sum + cal, 0) / actualCalories.length;
    const calorieDifference = avgCalories - currentTarget;
    
    // If weight change is not as expected, adjust calories
    let adjustment = 0;
    
    if (goal === 'lose' && weightChange > 0.5) {
      // Not losing weight, reduce calories
      adjustment = -200;
    } else if (goal === 'lose' && weightChange < -2) {
      // Losing too fast, increase calories
      adjustment = 200;
    } else if (goal === 'gain' && weightChange < 0.5) {
      // Not gaining weight, increase calories
      adjustment = 200;
    } else if (goal === 'gain' && weightChange > 2) {
      // Gaining too fast, reduce calories
      adjustment = -200;
    } else if (goal === 'maintain' && Math.abs(weightChange) > 1) {
      // Not maintaining, adjust based on direction
      adjustment = weightChange > 0 ? -150 : 150;
    }
    
    // Also adjust based on calorie adherence
    if (Math.abs(calorieDifference) > 300) {
      adjustment += calorieDifference > 0 ? -100 : 100;
    }
    
    return Math.max(Math.min(adjustment, 300), -300); // Limit adjustments to ±300 calories
  }

  // Generate calorie target for user
  async generateCalorieTarget(userProfile: UserProfile): Promise<CalorieTarget> {
    const tdee = this.calculateTDEE(userProfile);
    const dailyTarget = this.calculateCalorieTarget(userProfile, tdee);
    const weeklyTarget = dailyTarget * 7;
    
    const reasoning = this.generateReasoning(userProfile, dailyTarget, tdee);
    
    return {
      dailyTarget: Math.round(dailyTarget),
      weeklyTarget: Math.round(weeklyTarget),
      goal: userProfile.goal,
      targetWeight: userProfile.targetWeight || userProfile.weight,
      currentWeight: userProfile.weight,
      weeklyAdjustment: 0,
      lastUpdated: new Date().toISOString(),
      reasoning
    };
  }

  // Update calorie target based on weekly progress
  async updateCalorieTarget(
    currentTarget: CalorieTarget,
    weeklyData: {
      actualCalories: number[];
      weightChange: number;
      adherence: number; // percentage of days meeting target
    }
  ): Promise<CalorieTarget> {
    const adjustment = this.calculateWeeklyAdjustment(
      currentTarget.dailyTarget,
      weeklyData.actualCalories,
      weeklyData.weightChange,
      currentTarget.goal
    );
    
    const newTarget = Math.max(
      currentTarget.dailyTarget + adjustment,
      1200 // Minimum safe calorie intake
    );
    
    let newReasoning = currentTarget.reasoning;
    
    if (adjustment !== 0) {
      newReasoning += `\n\nWeekly Adjustment (${new Date().toLocaleDateString()}):\n`;
      newReasoning += `• Previous target: ${currentTarget.dailyTarget} calories\n`;
      newReasoning += `• Weight change: ${weeklyData.weightChange.toFixed(1)} lbs\n`;
      newReasoning += `• Adherence: ${weeklyData.adherence.toFixed(0)}%\n`;
      newReasoning += `• Adjustment: ${adjustment > 0 ? '+' : ''}${adjustment} calories\n`;
      newReasoning += `• New target: ${newTarget} calories\n`;
      
      if (adjustment > 0) {
        newReasoning += `• Reason: Progress slower than expected\n`;
      } else {
        newReasoning += `• Reason: Progress faster than expected\n`;
      }
    }
    
    return {
      ...currentTarget,
      dailyTarget: Math.round(newTarget),
      weeklyTarget: Math.round(newTarget * 7),
      weeklyAdjustment: adjustment,
      lastUpdated: new Date().toISOString(),
      reasoning: newReasoning
    };
  }

  // Get user profile from stored data
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const personalInfo = await DataStorage.getPersonalInfo();
      if (!personalInfo) return null;
      
      return {
        age: personalInfo.age || 25,
        gender: personalInfo.gender || 'male',
        height: personalInfo.height || 175,
        weight: personalInfo.weight || 70,
        activityLevel: personalInfo.activityLevel || 'moderate',
        goal: personalInfo.goal || 'maintain',
        targetWeight: personalInfo.targetWeight,
        targetDate: personalInfo.targetDate
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Save calorie target
  async saveCalorieTarget(target: CalorieTarget): Promise<void> {
    try {
      await DataStorage.saveCalorieTarget(target);
    } catch (error) {
      console.error('Error saving calorie target:', error);
    }
  }

  // Get current calorie target
  async getCurrentCalorieTarget(): Promise<CalorieTarget | null> {
    try {
      return await DataStorage.getCalorieTarget();
    } catch (error) {
      console.error('Error getting calorie target:', error);
      return null;
    }
  }
}

export default CalorieTargetService;








