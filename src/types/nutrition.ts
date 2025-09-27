// Core nutrition types for the food tracker
export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  saturated_fat: number;
  trans_fat: number;
  potassium: number;
  vitamin_a: number;
  vitamin_c: number;
  calcium: number;
  iron: number;
}

export interface Food {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  serving_size: number;
  serving_unit: 'g' | 'ml' | 'cup' | 'tbsp' | 'tsp' | 'piece' | 'slice';
  nutrition_per_100g: NutritionData;
  verified: boolean;
  source: 'usda' | 'openfoodfacts' | 'user' | 'barcode';
  image_url?: string;
  category?: string;
  tags?: string[];
}

export interface FoodLog {
  id: string;
  food_id: string;
  food?: Food;
  amount: number;
  unit: 'g' | 'ml' | 'cup' | 'tbsp' | 'tsp' | 'piece' | 'slice';
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  created_at: string;
  user_id: string;
}

export interface NutritionGoals {
  id: string;
  user_id: string;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  daily_fiber: number;
  daily_sodium: number;
  weight_goal: 'lose' | 'maintain' | 'gain';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  created_at: string;
  updated_at: string;
}

export interface DailyNutrition {
  date: string;
  total: NutritionData;
  meals: {
    breakfast: NutritionData;
    lunch: NutritionData;
    dinner: NutritionData;
    snack: NutritionData;
  };
  goals: NutritionGoals;
  progress: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
}

export interface FoodSearchResult {
  food: Food;
  score: number;
  match_type: 'exact' | 'partial' | 'fuzzy';
}

export interface RecentFood {
  food: Food;
  last_logged: string;
  frequency: number;
  is_favorite: boolean;
}

export interface NutritionStreak {
  current_streak: number;
  longest_streak: number;
  last_logged: string;
  streak_type: 'daily_logging' | 'goal_achievement' | 'macro_balance';
}

export interface NutritionBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  category: 'logging' | 'goals' | 'streaks' | 'achievements';
}

export interface NutritionInsight {
  type: 'macro_balance' | 'calorie_trend' | 'nutrient_deficiency' | 'goal_progress';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'success' | 'error';
  actionable: boolean;
  action_text?: string;
  action_url?: string;
}










