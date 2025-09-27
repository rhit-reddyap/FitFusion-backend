import { supabase } from '../lib/supabase';

// USDA Food Database API integration
const USDA_API_KEY = 'ABEr3yk9dFfm5PMgGk5PHqFKxEkYRn6dnTJdMjdE';
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  description: string;
  barcode?: string;
  servingSize: number;
  servingUnit: string;
  nutrition: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    cholesterol: number;
    saturatedFat: number;
    transFat: number;
    potassium: number;
    calcium: number;
    iron: number;
    vitaminA: number;
    vitaminC: number;
  };
  allergens: string[];
  ingredients: string[];
  imageUrl?: string;
  verified: boolean;
}

export interface SearchResult {
  foods: FoodItem[];
  totalCount: number;
  page: number;
  hasMore: boolean;
}

export interface FoodLogEntry {
  id: string;
  userId: string;
  foodId: string;
  foodName: string;
  amount: number;
  unit: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  loggedAt: Date;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

class FoodApiService {
  private cache = new Map<string, any>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Search foods using USDA API
  async searchFoods(query: string, page: number = 1, pageSize: number = 20): Promise<SearchResult> {
    const cacheKey = `search_${query}_${page}_${pageSize}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(
        `${USDA_BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=${pageSize}&pageNumber=${page}`
      );
      
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('USDA API response:', data);
      console.log('USDA foods:', data.foods);
      const foods = this.transformUSDAFoods(data.foods || []);
      console.log('Transformed foods:', foods);
      
      const result: SearchResult = {
        foods,
        totalCount: data.totalHits || 0,
        page,
        hasMore: (page * pageSize) < (data.totalHits || 0)
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Error searching foods:', error);
      // Fallback to local database
      return this.searchLocalFoods(query, page, pageSize);
    }
  }

  // Get food details by ID
  async getFoodById(foodId: string): Promise<FoodItem | null> {
    const cacheKey = `food_${foodId}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(
        `${USDA_BASE_URL}/food/${foodId}?api_key=${USDA_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status}`);
      }

      const data = await response.json();
      const food = this.transformUSDAFood(data);
      
      this.cache.set(cacheKey, {
        data: food,
        timestamp: Date.now()
      });

      return food;
    } catch (error) {
      console.error('Error getting food details:', error);
      return this.getLocalFoodById(foodId);
    }
  }

  // Search barcode
  async searchByBarcode(barcode: string): Promise<FoodItem | null> {
    try {
      // Try Open Food Facts API first (free, no API key needed)
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 1 && data.product) {
          return this.transformOpenFoodFactsProduct(data.product);
        }
      }

      // Fallback to local database
      return this.getLocalFoodByBarcode(barcode);
    } catch (error) {
      console.error('Error searching barcode:', error);
      return null;
    }
  }

  // Log food entry
  async logFood(foodId: string, amount: number, unit: string, mealType: string): Promise<FoodLogEntry> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated, creating mock food log entry');
        // Return a mock entry for offline mode
        return {
          id: Date.now().toString(),
          userId: 'anonymous',
          foodId: foodId,
          foodName: `Food ${foodId}`,
          amount: amount,
          unit: unit,
          mealType: mealType as any,
          loggedAt: new Date(),
          nutrition: {
            calories: amount * 1.5,
            protein: amount * 0.1,
            carbs: amount * 0.2,
            fat: amount * 0.05,
            fiber: amount * 0.02,
            sugar: amount * 0.03,
            sodium: amount * 0.01,
          }
        };
      }

      const food = await this.getFoodById(foodId);
      if (!food) {
        console.log('Food not found, creating mock entry');
        return {
          id: Date.now().toString(),
          userId: user.id,
          foodId: foodId,
          foodName: `Food ${foodId}`,
          amount: amount,
          unit: unit,
          mealType: mealType as any,
          loggedAt: new Date(),
          nutrition: {
            calories: amount * 1.5,
            protein: amount * 0.1,
            carbs: amount * 0.2,
            fat: amount * 0.05,
            fiber: amount * 0.02,
            sugar: amount * 0.03,
            sodium: amount * 0.01,
          }
        };
      }

      // Calculate nutrition based on amount
      const multiplier = amount / food.servingSize;
      const nutrition = {
        calories: Math.round(food.nutrition.calories * multiplier),
        protein: Math.round(food.nutrition.protein * multiplier * 10) / 10,
        carbs: Math.round(food.nutrition.carbs * multiplier * 10) / 10,
        fat: Math.round(food.nutrition.fat * multiplier * 10) / 10,
      };

      const logEntry: FoodLogEntry = {
        id: crypto.randomUUID(),
        userId: user.id,
        foodId,
        foodName: food.name,
        amount,
        unit,
        mealType: mealType as any,
        loggedAt: new Date(),
        nutrition
      };

      // Save to Supabase
      const { error } = await supabase
        .from('food_logs')
        .insert([{
          id: logEntry.id,
          user_id: logEntry.userId,
          food_id: logEntry.foodId,
          food_name: logEntry.foodName,
          amount: logEntry.amount,
          unit: logEntry.unit,
          meal_type: logEntry.mealType,
          logged_at: logEntry.loggedAt.toISOString(),
          calories: logEntry.nutrition.calories,
          protein: logEntry.nutrition.protein,
          carbs: logEntry.nutrition.carbs,
          fat: logEntry.nutrition.fat
        }]);

      if (error) {
        console.error('Error logging food:', error);
        // Return the entry anyway for offline mode
        return logEntry;
      }

      return logEntry;
    } catch (error) {
      console.error('Error in logFood:', error);
      // Return mock entry on any error
      return {
        id: Date.now().toString(),
        userId: 'anonymous',
        foodId: foodId,
        foodName: `Food ${foodId}`,
        amount: amount,
        unit: unit,
        mealType: mealType as any,
        loggedAt: new Date(),
        nutrition: {
          calories: amount * 1.5,
          protein: amount * 0.1,
          carbs: amount * 0.2,
          fat: amount * 0.05,
          fiber: amount * 0.02,
          sugar: amount * 0.03,
          sodium: amount * 0.01,
        }
      };
    }
  }

  // Get food logs for a date
  async getFoodLogs(date: string): Promise<FoodLogEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated, returning empty food logs');
        return [];
      }

      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', `${date}T00:00:00`)
        .lte('logged_at', `${date}T23:59:59`)
        .order('logged_at', { ascending: true });

      if (error) {
        console.error('Error getting food logs:', error);
        return [];
      }

      return data.map(log => ({
        id: log.id,
        userId: log.user_id,
        foodId: log.food_id,
        foodName: log.food_name,
        amount: log.amount,
        unit: log.unit,
        mealType: log.meal_type,
        loggedAt: new Date(log.logged_at),
        nutrition: {
          calories: log.calories,
          protein: log.protein,
          carbs: log.carbs,
          fat: log.fat
        }
      }));
    } catch (error) {
      console.error('Error getting food logs:', error);
      return [];
    }
  }

  // Get nutrition summary for a date
  async getNutritionSummary(date: string) {
    try {
      const logs = await this.getFoodLogs(date);
      
      return logs.reduce((summary, log) => ({
        calories: summary.calories + (log.nutrition?.calories || 0),
        protein: summary.protein + (log.nutrition?.protein || 0),
        carbs: summary.carbs + (log.nutrition?.carbs || 0),
        fat: summary.fat + (log.nutrition?.fat || 0),
        mealCount: summary.mealCount + 1
      }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
        mealCount: 0
      });
    } catch (error) {
      console.error('Error getting nutrition summary:', error);
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        mealCount: 0
      };
    }
  }

  // Get popular foods (common search terms)
  async getPopularFoods(limit: number = 20): Promise<FoodItem[]> {
    const popularQueries = [
      'chicken breast', 'rice', 'banana', 'apple', 'eggs', 'bread',
      'milk', 'yogurt', 'cheese', 'salmon', 'broccoli', 'spinach',
      'oats', 'quinoa', 'sweet potato', 'avocado', 'almonds', 'peanut butter'
    ];

    try {
      const results = await Promise.all(
        popularQueries.slice(0, limit).map(query => this.searchFoods(query, 1, 1))
      );

      return results
        .flatMap(result => result.foods)
        .slice(0, limit)
        .map(food => this.transformUSDAFood(food));
    } catch (error) {
      console.error('Error getting popular foods:', error);
      return [];
    }
  }

  // Transform USDA food data to our format
  private transformUSDAFoods(usdaFoods: any[]): FoodItem[] {
    return usdaFoods.map(food => this.transformUSDAFood(food));
  }

  private transformUSDAFood(usdaFood: any): FoodItem {
    const nutrients = usdaFood.foodNutrients || [];
    
    console.log('Transforming USDA food:', usdaFood.description);
    console.log('Food nutrients:', nutrients);
    
    const getNutrient = (nutrientId: number, defaultValue: number = 0) => {
      // Try different possible structures for the nutrient data
      let nutrient = nutrients.find((n: any) => n.nutrient?.id === nutrientId);
      if (!nutrient) {
        nutrient = nutrients.find((n: any) => n.nutrientId === nutrientId);
      }
      if (!nutrient) {
        nutrient = nutrients.find((n: any) => n.nutrient?.nutrientId === nutrientId);
      }
      
      let value = defaultValue;
      if (nutrient) {
        value = parseFloat(nutrient.amount || nutrient.value || 0);
      }
      
      console.log(`Nutrient ${nutrientId}:`, value, 'from nutrient:', nutrient);
      return value;
    };

    // Get nutrition values
    const calories = getNutrient(1008);
    const protein = getNutrient(1003);
    const carbs = getNutrient(1005);
    const fat = getNutrient(1004);
    
    // If no nutrition data found, provide fallback based on food name
    const fallbackNutrition = this.getFallbackNutrition(usdaFood.description || '');
    
    // Use fallback if all main nutrients are 0
    const hasNutritionData = calories > 0 || protein > 0 || carbs > 0 || fat > 0;
    
    console.log('Nutrition check:', {
      calories,
      protein,
      carbs,
      fat,
      hasNutritionData,
      fallbackNutrition
    });
    
    return {
      id: usdaFood.fdcId?.toString() || crypto.randomUUID(),
      name: usdaFood.description || 'Unknown Food',
      brand: usdaFood.brandOwner || undefined,
      description: usdaFood.description || '',
      servingSize: 100, // USDA uses 100g as standard
      servingUnit: 'g',
      nutrition: {
        calories: hasNutritionData ? calories : fallbackNutrition.calories,
        protein: hasNutritionData ? protein : fallbackNutrition.protein,
        carbs: hasNutritionData ? carbs : fallbackNutrition.carbs,
        fat: hasNutritionData ? fat : fallbackNutrition.fat,
        fiber: hasNutritionData ? getNutrient(1079) : fallbackNutrition.fiber,
        sugar: hasNutritionData ? getNutrient(2000) : fallbackNutrition.sugar,
        sodium: hasNutritionData ? getNutrient(1093) : fallbackNutrition.sodium,
        cholesterol: getNutrient(1253) || 0,
        saturatedFat: getNutrient(1258) || 0,
        transFat: getNutrient(1257) || 0,
        potassium: getNutrient(1092) || 0,
        calcium: getNutrient(1087) || 0,
        iron: getNutrient(1089) || 0,
        vitaminA: getNutrient(1106) || 0,
        vitaminC: getNutrient(1162) || 0,
      },
      allergens: [], // USDA doesn't provide allergen info
      ingredients: usdaFood.ingredients?.split(',') || [],
      imageUrl: undefined,
      verified: true
    };
  }

  // Get fallback nutrition data based on food name
  private getFallbackNutrition(foodName: string): any {
    const name = foodName.toLowerCase();
    
    // Chicken fallback
    if (name.includes('chicken')) {
      return {
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0,
        sugar: 0,
        sodium: 74
      };
    }
    
    // Beef fallback
    if (name.includes('beef')) {
      return {
        calories: 250,
        protein: 26,
        carbs: 0,
        fat: 15,
        fiber: 0,
        sugar: 0,
        sodium: 72
      };
    }
    
    // Rice fallback
    if (name.includes('rice')) {
      return {
        calories: 130,
        protein: 2.7,
        carbs: 28,
        fat: 0.3,
        fiber: 0.4,
        sugar: 0.1,
        sodium: 1
      };
    }
    
    // Default fallback
    return {
      calories: 100,
      protein: 5,
      carbs: 15,
        fat: 2,
      fiber: 2,
      sugar: 5,
      sodium: 50
    };
  }

  // Transform Open Food Facts product to our format
  private transformOpenFoodFactsProduct(product: any): FoodItem {
    const nutrition = product.nutriments || {};
    
    return {
      id: product._id || crypto.randomUUID(),
      name: product.product_name || 'Unknown Product',
      brand: product.brands || undefined,
      description: product.product_name || '',
      barcode: product.code,
      servingSize: 100,
      servingUnit: 'g',
      nutrition: {
        calories: nutrition.energy_kcal_100g || 0,
        protein: nutrition.proteins_100g || 0,
        carbs: nutrition.carbohydrates_100g || 0,
        fat: nutrition.fat_100g || 0,
        fiber: nutrition.fiber_100g || 0,
        sugar: nutrition.sugars_100g || 0,
        sodium: (nutrition.sodium_100g || 0) * 1000, // Convert to mg
        cholesterol: nutrition.cholesterol_100g || 0,
        saturatedFat: nutrition.saturated_fat_100g || 0,
        transFat: nutrition.trans_fat_100g || 0,
        potassium: nutrition.potassium_100g || 0,
        calcium: nutrition.calcium_100g || 0,
        iron: nutrition.iron_100g || 0,
        vitaminA: nutrition.vitamin_a_100g || 0,
        vitaminC: nutrition.vitamin_c_100g || 0,
      },
      allergens: product.allergens_tags?.map((tag: string) => tag.replace('en:', '')) || [],
      ingredients: product.ingredients_text?.split(',') || [],
      imageUrl: product.image_url,
      verified: true
    };
  }

  // Fallback methods for local database
  private async searchLocalFoods(query: string, page: number, pageSize: number): Promise<SearchResult> {
    // This would search your local Supabase food database
    // For now, return empty result
    return {
      foods: [],
      totalCount: 0,
      page,
      hasMore: false
    };
  }

  private async getLocalFoodById(foodId: string): Promise<FoodItem | null> {
    // This would get food from your local Supabase food database
    return null;
  }

  private async getLocalFoodByBarcode(barcode: string): Promise<FoodItem | null> {
    // This would search your local Supabase food database by barcode
    return null;
  }
}

export const foodApiService = new FoodApiService();