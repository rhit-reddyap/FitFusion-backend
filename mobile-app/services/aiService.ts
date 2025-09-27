// AI Service for Fit Fusion AI
// This service will integrate with various AI providers for workout and meal planning

export interface AIWorkoutRequest {
  userGoals: string[];
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  availableEquipment: string[];
  targetMuscles: string[];
  workoutDuration: number; // in minutes
  preferences?: {
    workoutType?: 'strength' | 'cardio' | 'hiit' | 'yoga' | 'mixed';
    intensity?: 'low' | 'medium' | 'high';
    focus?: 'muscle_gain' | 'weight_loss' | 'endurance' | 'flexibility';
  };
}

export interface AIMealPlanRequest {
  userGoals: string[];
  dietaryRestrictions: string[];
  calorieTarget: number;
  mealCount: number; // meals per day
  preferences?: {
    cuisine?: string[];
    cookingTime?: 'quick' | 'moderate' | 'extensive';
    budget?: 'low' | 'medium' | 'high';
  };
}

export interface AIWorkoutResponse {
  workout: {
    name: string;
    description: string;
    duration: number;
    difficulty: string;
    exercises: Array<{
      name: string;
      sets: number;
      reps: number;
      weight?: number;
      restTime: number;
      instructions: string;
      muscleGroups: string[];
    }>;
  };
  reasoning: string;
  tips: string[];
}

export interface AIMealPlanResponse {
  mealPlan: {
    name: string;
    description: string;
    totalCalories: number;
    meals: Array<{
      name: string;
      type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      calories: number;
      ingredients: Array<{
        name: string;
        amount: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      }>;
      instructions: string[];
      prepTime: number;
    }>;
  };
  reasoning: string;
  tips: string[];
}

export interface AIQueryRequest {
  query: string;
  context?: {
    userGoals?: string[];
    fitnessLevel?: string;
    currentWorkouts?: any[];
    mealHistory?: any[];
    bodyStats?: any;
  };
}

export interface AIQueryResponse {
  answer: string;
  suggestions?: string[];
  relatedActions?: Array<{
    type: 'create_workout' | 'create_meal_plan' | 'update_goal' | 'view_analytics';
    description: string;
    data?: any;
  }>;
}

class AIService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.openai.com/v1'; // Default to OpenAI, can be changed

  constructor() {
    // Initialize with API key from environment or user settings
    this.initializeAPIKey();
  }

  private initializeAPIKey() {
    // TODO: Get API key from user settings or environment
    // For now, we'll use a placeholder
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || null;
  }

  setAPIKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  setProvider(provider: 'openai' | 'anthropic' | 'google', apiKey?: string) {
    switch (provider) {
      case 'openai':
        this.baseUrl = 'https://api.openai.com/v1';
        break;
      case 'anthropic':
        this.baseUrl = 'https://api.anthropic.com/v1';
        break;
      case 'google':
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1';
        break;
    }
    
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }

  async generateWorkout(request: AIWorkoutRequest): Promise<AIWorkoutResponse> {
    if (!this.apiKey) {
      throw new Error('AI API key not configured. Please set up your AI provider in settings.');
    }

    try {
      const prompt = this.buildWorkoutPrompt(request);
      const response = await this.callAI(prompt);
      
      // Parse the AI response into our structured format
      return this.parseWorkoutResponse(response);
    } catch (error) {
      console.error('Error generating workout:', error);
      throw new Error('Failed to generate workout. Please try again.');
    }
  }

  async generateMealPlan(request: AIMealPlanRequest): Promise<AIMealPlanResponse> {
    if (!this.apiKey) {
      throw new Error('AI API key not configured. Please set up your AI provider in settings.');
    }

    try {
      const prompt = this.buildMealPlanPrompt(request);
      const response = await this.callAI(prompt);
      
      // Parse the AI response into our structured format
      return this.parseMealPlanResponse(response);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw new Error('Failed to generate meal plan. Please try again.');
    }
  }

  async answerQuery(request: AIQueryRequest): Promise<AIQueryResponse> {
    if (!this.apiKey) {
      throw new Error('AI API key not configured. Please set up your AI provider in settings.');
    }

    try {
      const prompt = this.buildQueryPrompt(request);
      const response = await this.callAI(prompt);
      
      // Parse the AI response
      return this.parseQueryResponse(response);
    } catch (error) {
      console.error('Error answering query:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  private buildWorkoutPrompt(request: AIWorkoutRequest): string {
    return `You are a professional fitness trainer and exercise physiologist. Create a personalized workout plan based on the following user information:

User Goals: ${request.userGoals.join(', ')}
Fitness Level: ${request.fitnessLevel}
Available Equipment: ${request.availableEquipment.join(', ')}
Target Muscles: ${request.targetMuscles.join(', ')}
Workout Duration: ${request.workoutDuration} minutes
Workout Type: ${request.preferences?.workoutType || 'mixed'}
Intensity: ${request.preferences?.intensity || 'medium'}
Focus: ${request.preferences?.focus || 'general fitness'}

Please create a comprehensive workout plan that includes:
1. A creative workout name
2. A brief description of the workout
3. A list of exercises with sets, reps, weight suggestions, rest times, and detailed instructions
4. The reasoning behind your exercise selection
5. Helpful tips for the user

Format your response as a JSON object with the following structure:
{
  "workout": {
    "name": "Workout Name",
    "description": "Brief description",
    "duration": ${request.workoutDuration},
    "difficulty": "${request.fitnessLevel}",
    "exercises": [
      {
        "name": "Exercise Name",
        "sets": 3,
        "reps": 10,
        "weight": 135,
        "restTime": 90,
        "instructions": "Detailed instructions",
        "muscleGroups": ["chest", "shoulders", "triceps"]
      }
    ]
  },
  "reasoning": "Why you selected these exercises",
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}

Make sure the workout is safe, effective, and appropriate for the user's fitness level.`;
  }

  private buildMealPlanPrompt(request: AIMealPlanRequest): string {
    return `You are a professional nutritionist and dietitian. Create a personalized meal plan based on the following user information:

User Goals: ${request.userGoals.join(', ')}
Dietary Restrictions: ${request.dietaryRestrictions.join(', ') || 'None'}
Calorie Target: ${request.calorieTarget} calories per day
Meals Per Day: ${request.mealCount}
Cuisine Preferences: ${request.preferences?.cuisine?.join(', ') || 'Any'}
Cooking Time: ${request.preferences?.cookingTime || 'moderate'}
Budget: ${request.preferences?.budget || 'medium'}

Please create a comprehensive meal plan that includes:
1. A creative meal plan name
2. A brief description
3. Detailed meals with ingredients, nutritional information, and cooking instructions
4. The reasoning behind your meal selection
5. Helpful nutrition tips

Format your response as a JSON object with the following structure:
{
  "mealPlan": {
    "name": "Meal Plan Name",
    "description": "Brief description",
    "totalCalories": ${request.calorieTarget},
    "meals": [
      {
        "name": "Meal Name",
        "type": "breakfast",
        "calories": 400,
        "ingredients": [
          {
            "name": "Ingredient Name",
            "amount": "1 cup",
            "calories": 100,
            "protein": 10,
            "carbs": 20,
            "fat": 5
          }
        ],
        "instructions": ["Step 1", "Step 2"],
        "prepTime": 15
      }
    ]
  },
  "reasoning": "Why you selected these meals",
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}

Make sure the meal plan is balanced, nutritious, and meets the user's calorie and dietary requirements.`;
  }

  private buildQueryPrompt(request: AIQueryRequest): string {
    return `You are a personal fitness and nutrition AI assistant. Answer the user's question with helpful, accurate, and personalized advice.

User Question: ${request.query}

User Context:
- Goals: ${request.context?.userGoals?.join(', ') || 'Not specified'}
- Fitness Level: ${request.context?.fitnessLevel || 'Not specified'}
- Current Workouts: ${request.context?.currentWorkouts?.length || 0} workouts logged
- Meal History: ${request.context?.mealHistory?.length || 0} meals logged
- Body Stats: ${request.context?.bodyStats ? 'Available' : 'Not available'}

Please provide:
1. A comprehensive answer to their question
2. Relevant suggestions for follow-up actions
3. Any related actions they might want to take

Format your response as a JSON object:
{
  "answer": "Your detailed answer here",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "relatedActions": [
    {
      "type": "create_workout",
      "description": "Create a new workout plan",
      "data": {}
    }
  ]
}

Be helpful, encouraging, and provide actionable advice.`;
  }

  private async callAI(prompt: string): Promise<string> {
    // This is a placeholder implementation
    // In a real implementation, you would call the actual AI API
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional fitness and nutrition AI assistant. Always respond with valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private parseWorkoutResponse(response: string): AIWorkoutResponse {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing workout response:', error);
      throw new Error('Invalid AI response format');
    }
  }

  private parseMealPlanResponse(response: string): AIMealPlanResponse {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing meal plan response:', error);
      throw new Error('Invalid AI response format');
    }
  }

  private parseQueryResponse(response: string): AIQueryResponse {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing query response:', error);
      throw new Error('Invalid AI response format');
    }
  }
}

export default new AIService();




