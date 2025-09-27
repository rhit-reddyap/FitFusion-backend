// Nutrition API service for food database integration
import { Food, FoodSearchResult, NutritionData } from '@/types/nutrition';

// Mock nutrition database - replace with real API integration
const MOCK_FOODS: Food[] = [
  {
    id: '1',
    name: 'Chicken Breast',
    brand: 'Generic',
    serving_size: 100,
    serving_unit: 'g',
    nutrition_per_100g: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
      cholesterol: 85,
      saturated_fat: 1,
      trans_fat: 0,
      potassium: 256,
      vitamin_a: 0,
      vitamin_c: 0,
      calcium: 15,
      iron: 1
    },
    verified: true,
    source: 'usda',
    category: 'Protein',
    tags: ['lean', 'high-protein', 'low-carb']
  },
  {
    id: '2',
    name: 'Brown Rice',
    brand: 'Generic',
    serving_size: 100,
    serving_unit: 'g',
    nutrition_per_100g: {
      calories: 111,
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      fiber: 1.8,
      sugar: 0.4,
      sodium: 5,
      cholesterol: 0,
      saturated_fat: 0.2,
      trans_fat: 0,
      potassium: 43,
      vitamin_a: 0,
      vitamin_c: 0,
      calcium: 10,
      iron: 0.4
    },
    verified: true,
    source: 'usda',
    category: 'Grains',
    tags: ['whole-grain', 'complex-carb', 'fiber']
  },
  {
    id: '3',
    name: 'Avocado',
    brand: 'Generic',
    serving_size: 100,
    serving_unit: 'g',
    nutrition_per_100g: {
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
      fiber: 6.7,
      sugar: 0.7,
      sodium: 7,
      cholesterol: 0,
      saturated_fat: 2.1,
      trans_fat: 0,
      potassium: 485,
      vitamin_a: 146,
      vitamin_c: 10,
      calcium: 12,
      iron: 0.6
    },
    verified: true,
    source: 'usda',
    category: 'Fruits',
    tags: ['healthy-fats', 'fiber', 'potassium']
  },
  {
    id: '4',
    name: 'Greek Yogurt',
    brand: 'Chobani',
    serving_size: 170,
    serving_unit: 'g',
    nutrition_per_100g: {
      calories: 59,
      protein: 10,
      carbs: 3.6,
      fat: 0.4,
      fiber: 0,
      sugar: 3.6,
      sodium: 36,
      cholesterol: 5,
      saturated_fat: 0.1,
      trans_fat: 0,
      potassium: 141,
      vitamin_a: 0,
      vitamin_c: 0,
      calcium: 110,
      iron: 0
    },
    verified: true,
    source: 'usda',
    category: 'Dairy',
    tags: ['high-protein', 'probiotics', 'low-fat']
  },
  {
    id: '5',
    name: 'Almonds',
    brand: 'Generic',
    serving_size: 28,
    serving_unit: 'g',
    nutrition_per_100g: {
      calories: 579,
      protein: 21,
      carbs: 22,
      fat: 50,
      fiber: 12,
      sugar: 4.4,
      sodium: 1,
      cholesterol: 0,
      saturated_fat: 3.8,
      trans_fat: 0,
      potassium: 733,
      vitamin_a: 0,
      vitamin_c: 0,
      calcium: 269,
      iron: 3.7
    },
    verified: true,
    source: 'usda',
    category: 'Nuts',
    tags: ['healthy-fats', 'protein', 'vitamin-e']
  }
];

export class NutritionAPI {
  private static instance: NutritionAPI;
  private searchCache: Map<string, FoodSearchResult[]> = new Map();

  static getInstance(): NutritionAPI {
    if (!NutritionAPI.instance) {
      NutritionAPI.instance = new NutritionAPI();
    }
    return NutritionAPI.instance;
  }

  // Search foods with intelligent matching
  async searchFoods(query: string, limit: number = 20): Promise<FoodSearchResult[]> {
    if (!query.trim()) return [];

    // Check cache first
    const cacheKey = `${query.toLowerCase()}_${limit}`;
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    const results: FoodSearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const food of MOCK_FOODS) {
      let score = 0;
      let matchType: 'exact' | 'partial' | 'fuzzy' = 'fuzzy';

      // Exact name match (highest priority)
      if (food.name.toLowerCase() === queryLower) {
        score = 100;
        matchType = 'exact';
      }
      // Partial name match
      else if (food.name.toLowerCase().includes(queryLower)) {
        score = 80;
        matchType = 'partial';
      }
      // Brand match
      else if (food.brand?.toLowerCase().includes(queryLower)) {
        score = 60;
        matchType = 'partial';
      }
      // Category match
      else if (food.category?.toLowerCase().includes(queryLower)) {
        score = 40;
        matchType = 'fuzzy';
      }
      // Tag match
      else if (food.tags?.some(tag => tag.toLowerCase().includes(queryLower))) {
        score = 30;
        matchType = 'fuzzy';
      }

      if (score > 0) {
        results.push({
          food,
          score,
          match_type: matchType
        });
      }
    }

    // Sort by score and limit results
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Cache results
    this.searchCache.set(cacheKey, sortedResults);

    return sortedResults;
  }

  // Get food by barcode
  async getFoodByBarcode(barcode: string): Promise<Food | null> {
    // Mock barcode lookup - replace with real barcode API
    const food = MOCK_FOODS.find(f => f.barcode === barcode);
    return food || null;
  }

  // Get recent foods for user
  async getRecentFoods(userId: string, limit: number = 10): Promise<Food[]> {
    // Mock recent foods - replace with real database query
    return MOCK_FOODS.slice(0, limit);
  }

  // Get favorite foods for user
  async getFavoriteFoods(userId: string): Promise<Food[]> {
    // Mock favorite foods - replace with real database query
    return MOCK_FOODS.slice(0, 5);
  }

  // Add custom food
  async addCustomFood(food: Omit<Food, 'id' | 'verified' | 'source'>): Promise<Food> {
    const newFood: Food = {
      ...food,
      id: Date.now().toString(),
      verified: false,
      source: 'user'
    };

    // In a real implementation, this would save to database
    MOCK_FOODS.push(newFood);
    
    return newFood;
  }

  // Calculate nutrition for specific amount
  calculateNutrition(food: Food, amount: number, unit: string): NutritionData {
    let multiplier = 1;

    // Convert to grams for calculation
    if (unit === 'g' || unit === 'ml') {
      multiplier = amount / food.serving_size;
    } else {
      // Handle other units (cups, tbsp, etc.) - simplified conversion
      const unitMultipliers: Record<string, number> = {
        'cup': 240, // ml
        'tbsp': 15, // ml
        'tsp': 5,   // ml
        'piece': 1,
        'slice': 1
      };
      multiplier = (amount * (unitMultipliers[unit] || 1)) / food.serving_size;
    }

    const nutrition: NutritionData = {
      calories: Math.round(food.nutrition_per_100g.calories * multiplier),
      protein: Math.round(food.nutrition_per_100g.protein * multiplier * 10) / 10,
      carbs: Math.round(food.nutrition_per_100g.carbs * multiplier * 10) / 10,
      fat: Math.round(food.nutrition_per_100g.fat * multiplier * 10) / 10,
      fiber: Math.round(food.nutrition_per_100g.fiber * multiplier * 10) / 10,
      sugar: Math.round(food.nutrition_per_100g.sugar * multiplier * 10) / 10,
      sodium: Math.round(food.nutrition_per_100g.sodium * multiplier),
      cholesterol: Math.round(food.nutrition_per_100g.cholesterol * multiplier),
      saturated_fat: Math.round(food.nutrition_per_100g.saturated_fat * multiplier * 10) / 10,
      trans_fat: Math.round(food.nutrition_per_100g.trans_fat * multiplier * 10) / 10,
      potassium: Math.round(food.nutrition_per_100g.potassium * multiplier),
      vitamin_a: Math.round(food.nutrition_per_100g.vitamin_a * multiplier),
      vitamin_c: Math.round(food.nutrition_per_100g.vitamin_c * multiplier),
      calcium: Math.round(food.nutrition_per_100g.calcium * multiplier),
      iron: Math.round(food.nutrition_per_100g.iron * multiplier * 10) / 10
    };

    return nutrition;
  }

  // Clear search cache
  clearCache(): void {
    this.searchCache.clear();
  }
}

export const nutritionAPI = NutritionAPI.getInstance();









