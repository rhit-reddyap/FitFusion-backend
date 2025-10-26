// AI Analytics Engine - Processes user data and generates intelligent insights
export interface UserData {
  profile: {
    fitness_goals: string[];
    activity_level: string;
    height_cm: number;
    weight_kg: number;
    age: number;
  };
  workouts: Array<{
    date: string;
    duration: number;
    exercises: Array<{
      name: string;
      sets: Array<{
        weight: number;
        reps: number;
        rpe: number;
      }>;
    }>;
    total_volume: number;
    rpe_avg: number;
    calories_burned: number;
  }>;
  nutrition: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  }>;
  sleep: Array<{
    date: string;
    hours: number;
    quality: number;
  }>;
  body_measurements: Array<{
    date: string;
    weight: number;
    body_fat: number;
    muscle_mass: number;
  }>;
}

export interface AIInsight {
  type: 'strength' | 'volume' | 'recovery' | 'nutrition' | 'progression' | 'warning' | 'achievement';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  action?: string;
  data?: any;
}

export interface AIRecommendation {
  category: 'workout' | 'nutrition' | 'recovery' | 'lifestyle';
  title: string;
  description: string;
  priority: number;
  estimated_impact: string;
  implementation: string[];
  timeline: string;
}

export class AIAnalyticsEngine {
  private userData: UserData;

  constructor(userData: UserData) {
    this.userData = userData;
  }

  // Analyze workout patterns and generate insights
  analyzeWorkoutPatterns(): AIInsight[] {
    const insights: AIInsight[] = [];
    const workouts = this.userData.workouts;
    
    if (workouts.length < 3) return insights;

    // Analyze volume trends
    const recentVolume = this.calculateAverageVolume(workouts.slice(-4));
    const previousVolume = this.calculateAverageVolume(workouts.slice(-8, -4));
    const volumeChange = ((recentVolume - previousVolume) / previousVolume) * 100;

    if (volumeChange > 20) {
      insights.push({
        type: 'volume',
        title: 'Volume Spike Detected',
        message: `Your training volume has increased by ${volumeChange.toFixed(1)}% recently. Consider adding a deload week to prevent overtraining.`,
        priority: 'high',
        actionable: true,
        action: 'Schedule a deload week',
        data: { volumeChange }
      });
    } else if (volumeChange < -15) {
      insights.push({
        type: 'volume',
        title: 'Volume Drop Alert',
        message: `Your training volume has decreased by ${Math.abs(volumeChange).toFixed(1)}%. This might indicate undertraining or recovery issues.`,
        priority: 'medium',
        actionable: true,
        action: 'Gradually increase training volume',
        data: { volumeChange }
      });
    }

    // Analyze RPE trends
    const recentRPE = this.calculateAverageRPE(workouts.slice(-4));
    if (recentRPE > 8.5) {
      insights.push({
        type: 'recovery',
        title: 'High Training Intensity',
        message: `Your average RPE is ${recentRPE.toFixed(1)}, indicating very high intensity. Ensure adequate recovery between sessions.`,
        priority: 'high',
        actionable: true,
        action: 'Increase rest days or reduce intensity',
        data: { recentRPE }
      });
    }

    // Analyze exercise variety
    const exerciseVariety = this.calculateExerciseVariety(workouts.slice(-10));
    if (exerciseVariety < 0.6) {
      insights.push({
        type: 'progression',
        title: 'Limited Exercise Variety',
        message: 'You\'re using a limited set of exercises. Adding variety can prevent plateaus and reduce injury risk.',
        priority: 'medium',
        actionable: true,
        action: 'Add 2-3 new exercises to your routine',
        data: { exerciseVariety }
      });
    }

    return insights;
  }

  // Analyze nutrition patterns
  analyzeNutritionPatterns(): AIInsight[] {
    const insights: AIInsight[] = [];
    const nutrition = this.userData.nutrition;
    
    if (nutrition.length < 7) return insights;

    const recentNutrition = nutrition.slice(-7);
    const avgProtein = this.calculateAverageProtein(recentNutrition);
    const avgCalories = this.calculateAverageCalories(recentNutrition);
    const proteinConsistency = this.calculateProteinConsistency(recentNutrition);

    // Protein analysis
    const targetProtein = this.userData.profile.weight_kg * 2.2; // 1g per lb
    if (avgProtein < targetProtein * 0.8) {
      insights.push({
        type: 'nutrition',
        title: 'Insufficient Protein Intake',
        message: `Your average protein intake (${avgProtein.toFixed(1)}g) is below the recommended ${targetProtein.toFixed(1)}g for muscle growth.`,
        priority: 'high',
        actionable: true,
        action: 'Increase protein intake by 20-30g daily',
        data: { avgProtein, targetProtein }
      });
    }

    // Calorie analysis
    const estimatedTDEE = this.estimateTDEE();
    if (avgCalories < estimatedTDEE * 0.8) {
      insights.push({
        type: 'nutrition',
        title: 'Potential Caloric Deficit',
        message: `Your calorie intake (${avgCalories.toFixed(0)}) may be too low for your activity level. This could hinder recovery and muscle growth.`,
        priority: 'medium',
        actionable: true,
        action: 'Increase daily calories by 200-300',
        data: { avgCalories, estimatedTDEE }
      });
    }

    // Protein consistency
    if (proteinConsistency < 0.7) {
      insights.push({
        type: 'nutrition',
        title: 'Inconsistent Protein Intake',
        message: 'Your protein intake varies significantly day-to-day. Consistent protein distribution improves muscle protein synthesis.',
        priority: 'medium',
        actionable: true,
        action: 'Plan protein-rich meals in advance',
        data: { proteinConsistency }
      });
    }

    return insights;
  }

  // Analyze recovery patterns
  analyzeRecoveryPatterns(): AIInsight[] {
    const insights: AIInsight[] = [];
    const sleep = this.userData.sleep;
    const workouts = this.userData.workouts;
    
    if (sleep.length < 7) return insights;

    const recentSleep = sleep.slice(-7);
    const avgSleepHours = this.calculateAverageSleepHours(recentSleep);
    const sleepQuality = this.calculateAverageSleepQuality(recentSleep);

    // Sleep duration analysis
    if (avgSleepHours < 7) {
      insights.push({
        type: 'recovery',
        title: 'Insufficient Sleep',
        message: `You're averaging ${avgSleepHours.toFixed(1)} hours of sleep. Aim for 7-9 hours for optimal recovery and muscle growth.`,
        priority: 'high',
        actionable: true,
        action: 'Improve sleep hygiene and bedtime routine',
        data: { avgSleepHours }
      });
    }

    // Sleep quality analysis
    if (sleepQuality < 3) {
      insights.push({
        type: 'recovery',
        title: 'Poor Sleep Quality',
        message: 'Your sleep quality is below optimal. Poor sleep significantly impacts recovery and performance.',
        priority: 'high',
        actionable: true,
        action: 'Optimize sleep environment and routine',
        data: { sleepQuality }
      });
    }

    // Workout frequency analysis
    const workoutFrequency = this.calculateWorkoutFrequency(workouts.slice(-14));
    if (workoutFrequency > 6) {
      insights.push({
        type: 'recovery',
        title: 'High Training Frequency',
        message: `You're training ${workoutFrequency} times per week. Consider if you're allowing adequate recovery between sessions.`,
        priority: 'medium',
        actionable: true,
        action: 'Review training split and recovery needs',
        data: { workoutFrequency }
      });
    }

    return insights;
  }

  // Generate personalized recommendations
  generateRecommendations(): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    const insights = [
      ...this.analyzeWorkoutPatterns(),
      ...this.analyzeNutritionPatterns(),
      ...this.analyzeRecoveryPatterns()
    ];

    // High priority insights become recommendations
    const highPriorityInsights = insights.filter(i => i.priority === 'high');
    
    highPriorityInsights.forEach(insight => {
      switch (insight.type) {
        case 'volume':
          recommendations.push({
            category: 'workout',
            title: 'Volume Management',
            description: 'Implement periodization to manage training volume and prevent overtraining.',
            priority: 9,
            estimated_impact: 'High - Prevents overtraining and improves long-term progress',
            implementation: [
              'Reduce training volume by 20% for one week',
              'Focus on technique and mobility',
              'Gradually increase volume over 2-3 weeks'
            ],
            timeline: '1-4 weeks'
          });
          break;
        
        case 'nutrition':
          recommendations.push({
            category: 'nutrition',
            title: 'Optimize Protein Intake',
            description: 'Increase and distribute protein intake throughout the day for better muscle protein synthesis.',
            priority: 8,
            estimated_impact: 'High - Improves muscle growth and recovery',
            implementation: [
              'Add 20-30g protein to each meal',
              'Include protein-rich snacks between meals',
              'Consider protein supplementation if needed'
            ],
            timeline: '2-4 weeks'
          });
          break;
        
        case 'recovery':
          recommendations.push({
            category: 'recovery',
            title: 'Improve Sleep Quality',
            description: 'Optimize sleep duration and quality for better recovery and performance.',
            priority: 9,
            estimated_impact: 'Very High - Critical for recovery and muscle growth',
            implementation: [
              'Establish consistent bedtime routine',
              'Create optimal sleep environment',
              'Limit screen time before bed',
              'Consider sleep tracking'
            ],
            timeline: '1-2 weeks'
          });
          break;
      }
    });

    // Generate additional recommendations based on goals
    const goals = this.userData.profile.fitness_goals;
    
    if (goals.includes('muscle_gain')) {
      recommendations.push({
        category: 'workout',
        title: 'Hypertrophy Focus',
        description: 'Optimize your training for muscle growth with proper volume and intensity.',
        priority: 7,
        estimated_impact: 'High - Maximizes muscle growth potential',
        implementation: [
          'Increase training volume to 10-20 sets per muscle group per week',
          'Focus on 6-12 rep range for most exercises',
          'Ensure progressive overload',
          'Include compound movements'
        ],
        timeline: '4-8 weeks'
      });
    }

    if (goals.includes('strength')) {
      recommendations.push({
        category: 'workout',
        title: 'Strength Progression',
        description: 'Implement a structured strength program focusing on the big three lifts.',
        priority: 8,
        estimated_impact: 'High - Improves strength and power',
        implementation: [
          'Focus on squat, bench press, and deadlift',
          'Use 3-5 rep range for strength work',
          'Implement linear progression',
          'Include deload weeks'
        ],
        timeline: '8-12 weeks'
      });
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  // Generate personalized workout plan
  generateWorkoutPlan(): any {
    const goals = this.userData.profile.fitness_goals;
    const experience = this.userData.profile.activity_level;
    const recentWorkouts = this.userData.workouts.slice(-10);
    
    // Analyze current training patterns
    const avgWorkoutDuration = this.calculateAverageWorkoutDuration(recentWorkouts);
    const preferredExercises = this.getMostUsedExercises(recentWorkouts);
    const volumePerSession = this.calculateAverageVolume(recentWorkouts);
    
    // Generate plan based on goals and patterns
    let plan: any = {
      name: '',
      duration: 8,
      frequency: 4,
      focus: goals,
      workouts: []
    };

    if (goals.includes('muscle_gain')) {
      plan.name = 'Hypertrophy Focus Program';
      plan.frequency = 5;
      plan.workouts = this.generateHypertrophyWorkouts(preferredExercises, avgWorkoutDuration);
    } else if (goals.includes('strength')) {
      plan.name = 'Strength Progression Program';
      plan.frequency = 4;
      plan.workouts = this.generateStrengthWorkouts(preferredExercises, avgWorkoutDuration);
    } else {
      plan.name = 'Balanced Fitness Program';
      plan.frequency = 4;
      plan.workouts = this.generateBalancedWorkouts(preferredExercises, avgWorkoutDuration);
    }

    return plan;
  }

  // Generate nutrition recommendations
  generateNutritionPlan(): any {
    const profile = this.userData.profile;
    const recentNutrition = this.userData.nutrition.slice(-7);
    const avgCalories = this.calculateAverageCalories(recentNutrition);
    const avgProtein = this.calculateAverageProtein(recentNutrition);
    
    const tdee = this.estimateTDEE();
    const goals = profile.fitness_goals;
    const targetCalories = goals.includes('muscle_gain') ? tdee + 300 : tdee;
    const targetProtein = profile.weight_kg * 2.2;
    const targetCarbs = (targetCalories * 0.45) / 4;
    const targetFat = (targetCalories * 0.25) / 9;

    return {
      daily_targets: {
        calories: Math.round(targetCalories),
        protein: Math.round(targetProtein),
        carbs: Math.round(targetCarbs),
        fat: Math.round(targetFat)
      },
      current_averages: {
        calories: Math.round(avgCalories),
        protein: Math.round(avgProtein)
      },
      recommendations: [
        `Increase protein intake by ${Math.round(targetProtein - avgProtein)}g daily`,
        `Adjust calories by ${Math.round(targetCalories - avgCalories)} daily`,
        'Distribute protein evenly across meals',
        'Include complex carbs around workouts'
      ]
    };
  }

  // Helper methods
  private calculateAverageVolume(workouts: any[]): number {
    return workouts.reduce((sum, w) => sum + w.total_volume, 0) / workouts.length;
  }

  private calculateAverageRPE(workouts: any[]): number {
    return workouts.reduce((sum, w) => sum + w.rpe_avg, 0) / workouts.length;
  }

  private calculateExerciseVariety(workouts: any[]): number {
    const allExercises = new Set();
    workouts.forEach(w => {
      w.exercises.forEach((e: any) => allExercises.add(e.name));
    });
    return allExercises.size / (workouts.length * 6); // Assuming 6 exercises per workout
  }

  private calculateAverageProtein(nutrition: any[]): number {
    return nutrition.reduce((sum, n) => sum + n.protein, 0) / nutrition.length;
  }

  private calculateAverageCalories(nutrition: any[]): number {
    return nutrition.reduce((sum, n) => sum + n.calories, 0) / nutrition.length;
  }

  private calculateProteinConsistency(nutrition: any[]): number {
    const proteinValues = nutrition.map(n => n.protein);
    const mean = proteinValues.reduce((sum, p) => sum + p, 0) / proteinValues.length;
    const variance = proteinValues.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / proteinValues.length;
    const stdDev = Math.sqrt(variance);
    return 1 - (stdDev / mean); // Higher is more consistent
  }

  private calculateAverageSleepHours(sleep: any[]): number {
    return sleep.reduce((sum, s) => sum + s.hours, 0) / sleep.length;
  }

  private calculateAverageSleepQuality(sleep: any[]): number {
    return sleep.reduce((sum, s) => sum + s.quality, 0) / sleep.length;
  }

  private calculateWorkoutFrequency(workouts: any[]): number {
    const days = new Set(workouts.map(w => w.date)).size;
    return workouts.length / (days / 7);
  }

  private estimateTDEE(): number {
    const { weight_kg, height_cm, age, activity_level } = this.userData.profile;
    const bmr = 88.362 + (13.397 * weight_kg) + (4.799 * height_cm) - (5.677 * age);
    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very_active': 1.9
    };
    return bmr * (activityMultipliers[activity_level as keyof typeof activityMultipliers] || 1.55);
  }

  private calculateAverageWorkoutDuration(workouts: any[]): number {
    return workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length;
  }

  private getMostUsedExercises(workouts: any[]): string[] {
    const exerciseCount: { [key: string]: number } = {};
    workouts.forEach(w => {
      w.exercises.forEach((e: any) => {
        exerciseCount[e.name] = (exerciseCount[e.name] || 0) + 1;
      });
    });
    return Object.entries(exerciseCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name]) => name);
  }

  private generateHypertrophyWorkouts(exercises: string[], duration: number): any[] {
    // Generate hypertrophy-focused workout structure
    return [
      { name: 'Push Day', exercises: exercises.slice(0, 6), duration: Math.round(duration) },
      { name: 'Pull Day', exercises: exercises.slice(6, 12), duration: Math.round(duration) },
      { name: 'Leg Day', exercises: exercises.slice(12, 18), duration: Math.round(duration) },
      { name: 'Upper Body', exercises: exercises.slice(0, 8), duration: Math.round(duration) },
      { name: 'Lower Body', exercises: exercises.slice(12, 20), duration: Math.round(duration) }
    ];
  }

  private generateStrengthWorkouts(exercises: string[], duration: number): any[] {
    // Generate strength-focused workout structure
    return [
      { name: 'Squat Day', exercises: ['Back Squat', 'Front Squat', 'Romanian Deadlift'], duration: Math.round(duration) },
      { name: 'Bench Day', exercises: ['Bench Press', 'Incline Press', 'Close-Grip Press'], duration: Math.round(duration) },
      { name: 'Deadlift Day', exercises: ['Deadlift', 'Rack Pulls', 'Good Mornings'], duration: Math.round(duration) },
      { name: 'Accessory Day', exercises: exercises.slice(0, 6), duration: Math.round(duration) }
    ];
  }

  private generateBalancedWorkouts(exercises: string[], duration: number): any[] {
    // Generate balanced workout structure
    return [
      { name: 'Full Body A', exercises: exercises.slice(0, 6), duration: Math.round(duration) },
      { name: 'Full Body B', exercises: exercises.slice(6, 12), duration: Math.round(duration) },
      { name: 'Upper Body', exercises: exercises.slice(0, 8), duration: Math.round(duration) },
      { name: 'Lower Body', exercises: exercises.slice(12, 20), duration: Math.round(duration) }
    ];
  }
}
