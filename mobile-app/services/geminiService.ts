// Google Gemini AI Service
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyBQsrGPexKhL0wuSPU_2F46hLWsMd9RG2Q';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  // Generate personalized workout plan
  async generateWorkoutPlan(preferences: {
    goals: string[];
    fitnessLevel: string;
    equipment: string[];
    duration: number;
    targetMuscles: string[];
    workoutType: string;
  }) {
    try {
      const prompt = `You are an expert fitness trainer and AI coach. Generate a personalized workout plan based on the following user preferences:

User Profile:
- Goals: ${preferences.goals.join(', ')}
- Fitness Level: ${preferences.fitnessLevel}
- Available Equipment: ${preferences.equipment.join(', ')}
- Workout Duration: ${preferences.duration} minutes
- Target Muscle Groups: ${preferences.targetMuscles.join(', ')}
- Workout Type: ${preferences.workoutType}

Please provide a detailed workout plan in the following JSON format:
{
  "name": "Workout Name",
  "description": "Brief description of the workout",
  "difficulty": "Beginner/Intermediate/Advanced",
  "duration": ${preferences.duration},
  "exercises": [
    {
      "name": "Exercise Name",
      "muscle": "Primary muscle group",
      "equipment": "Required equipment",
      "sets": 3,
      "reps": "8-12",
      "restTime": 60,
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "formTips": ["Tip 1", "Tip 2"],
      "commonMistakes": ["Mistake 1", "Mistake 2"]
    }
  ],
  "warmup": [
    {
      "name": "Warmup Exercise",
      "duration": "2-3 minutes",
      "instructions": ["Instruction 1", "Instruction 2"]
    }
  ],
  "cooldown": [
    {
      "name": "Cooldown Exercise", 
      "duration": "2-3 minutes",
      "instructions": ["Instruction 1", "Instruction 2"]
    }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}

Make sure the workout is appropriate for the user's fitness level and available equipment. Focus on exercises that target the specified muscle groups and align with their goals.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON from the response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
      }
      
      // Fallback: return a structured response
      return {
        name: `${preferences.goals[0] || 'Fitness'} Workout`,
        description: `AI-generated ${preferences.fitnessLevel} workout for ${preferences.duration} minutes`,
        difficulty: preferences.fitnessLevel,
        duration: preferences.duration,
        exercises: [],
        warmup: [],
        cooldown: [],
        tips: ['Focus on proper form', 'Listen to your body', 'Stay hydrated'],
        rawResponse: text
      };
    } catch (error) {
      console.error('Error generating workout with Gemini:', error);
      throw error;
    }
  }

  // Generate nutrition advice
  async generateNutritionAdvice(userData: {
    goals: string[];
    currentWeight?: number;
    targetWeight?: number;
    activityLevel: string;
    dietaryRestrictions?: string[];
  }) {
    try {
      const prompt = `You are an expert nutritionist and AI coach. Provide personalized nutrition advice based on the following user data:

User Profile:
- Goals: ${userData.goals.join(', ')}
- Current Weight: ${userData.currentWeight || 'Not specified'} lbs
- Target Weight: ${userData.targetWeight || 'Not specified'} lbs
- Activity Level: ${userData.activityLevel}
- Dietary Restrictions: ${userData.dietaryRestrictions?.join(', ') || 'None'}

Please provide comprehensive nutrition advice including:
1. Daily calorie target
2. Macronutrient breakdown (protein, carbs, fat)
3. Meal timing recommendations
4. Hydration guidelines
5. Supplement suggestions (if applicable)
6. Foods to focus on
7. Foods to limit/avoid

Format your response as clear, actionable advice that the user can implement immediately.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating nutrition advice with Gemini:', error);
      throw error;
    }
  }

  // Generate fitness insights and recommendations
  async generateFitnessInsights(userData: {
    workoutHistory: any[];
    nutritionLogs: any[];
    goals: string[];
    currentStats: any;
  }) {
    try {
      const prompt = `You are an expert fitness coach and AI analyst. Analyze the following user data and provide personalized insights and recommendations:

User Data:
- Goals: ${userData.goals.join(', ')}
- Workout History: ${JSON.stringify(userData.workoutHistory.slice(0, 5))}
- Current Stats: ${JSON.stringify(userData.currentStats)}

Please provide:
1. Key insights about their progress
2. Areas for improvement
3. Specific recommendations
4. Motivation and encouragement
5. Next steps to achieve their goals

Be encouraging, specific, and actionable in your advice.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating fitness insights with Gemini:', error);
      throw error;
    }
  }

  // Generate workout modifications
  async generateWorkoutModifications(workout: any, userFeedback: string) {
    try {
      const prompt = `You are an expert fitness trainer. A user has provided feedback about their workout and needs modifications:

Original Workout: ${JSON.stringify(workout)}
User Feedback: ${userFeedback}

Please suggest specific modifications to improve the workout based on their feedback. Consider:
- Exercise substitutions
- Intensity adjustments
- Duration changes
- Equipment alternatives
- Form improvements

Provide clear, actionable recommendations.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating workout modifications with Gemini:', error);
      throw error;
    }
  }

  // Generate motivational content
  async generateMotivation(userProgress: any, userGoals: string[]) {
    try {
      const prompt = `You are a motivational fitness coach. Generate encouraging and personalized motivational content based on:

User Progress: ${JSON.stringify(userProgress)}
User Goals: ${userGoals.join(', ')}

Provide:
1. Celebration of achievements
2. Encouragement for continued progress
3. Motivational quotes or tips
4. Reminder of their goals
5. Next milestone suggestions

Be positive, inspiring, and personalized.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating motivation with Gemini:', error);
      throw error;
    }
  }
}

export default new GeminiService();
