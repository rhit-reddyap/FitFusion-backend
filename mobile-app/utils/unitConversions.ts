// Comprehensive Unit Conversion System
export interface Unit {
  id: string;
  name: string;
  symbol: string;
  category: 'weight' | 'volume' | 'piece' | 'length';
  baseMultiplier: number; // Multiplier to convert to base unit (grams for weight, ml for volume)
}

export const UNITS: Unit[] = [
  // Weight units (base: grams)
  { id: 'g', name: 'Grams', symbol: 'g', category: 'weight', baseMultiplier: 1 },
  { id: 'kg', name: 'Kilograms', symbol: 'kg', category: 'weight', baseMultiplier: 1000 },
  { id: 'oz', name: 'Ounces', symbol: 'oz', category: 'weight', baseMultiplier: 28.3495 },
  { id: 'lb', name: 'Pounds', symbol: 'lb', category: 'weight', baseMultiplier: 453.592 },
  { id: 'mg', name: 'Milligrams', symbol: 'mg', category: 'weight', baseMultiplier: 0.001 },

  // Volume units (base: ml)
  { id: 'ml', name: 'Milliliters', symbol: 'ml', category: 'volume', baseMultiplier: 1 },
  { id: 'l', name: 'Liters', symbol: 'l', category: 'volume', baseMultiplier: 1000 },
  { id: 'cup', name: 'Cups', symbol: 'cup', category: 'volume', baseMultiplier: 236.588 },
  { id: 'tbsp', name: 'Tablespoons', symbol: 'tbsp', category: 'volume', baseMultiplier: 14.7868 },
  { id: 'tsp', name: 'Teaspoons', symbol: 'tsp', category: 'volume', baseMultiplier: 4.92892 },
  { id: 'fl_oz', name: 'Fluid Ounces', symbol: 'fl oz', category: 'volume', baseMultiplier: 29.5735 },
  { id: 'pint', name: 'Pints', symbol: 'pt', category: 'volume', baseMultiplier: 473.176 },
  { id: 'quart', name: 'Quarts', symbol: 'qt', category: 'volume', baseMultiplier: 946.353 },
  { id: 'gallon', name: 'Gallons', symbol: 'gal', category: 'volume', baseMultiplier: 3785.41 },

  // Piece units
  { id: 'piece', name: 'Piece', symbol: 'pc', category: 'piece', baseMultiplier: 1 },
  { id: 'slice', name: 'Slice', symbol: 'slice', category: 'piece', baseMultiplier: 1 },
  { id: 'serving', name: 'Serving', symbol: 'serving', category: 'piece', baseMultiplier: 1 },

  // Length units (for items like bananas)
  { id: 'cm', name: 'Centimeters', symbol: 'cm', category: 'length', baseMultiplier: 1 },
  { id: 'inch', name: 'Inches', symbol: 'in', category: 'length', baseMultiplier: 2.54 },
];

export interface FoodServing {
  id: string;
  name: string;
  amount: number;
  unit: string;
  description?: string;
  isCommon: boolean;
}

export const COMMON_SERVINGS: { [key: string]: FoodServing[] } = {
  'chicken breast': [
    { id: '100g', name: '100g', amount: 100, unit: 'g', description: 'Standard portion', isCommon: true },
    { id: '4oz', name: '4 oz', amount: 4, unit: 'oz', description: 'Small breast', isCommon: true },
    { id: '6oz', name: '6 oz', amount: 6, unit: 'oz', description: 'Medium breast', isCommon: true },
    { id: '8oz', name: '8 oz', amount: 8, unit: 'oz', description: 'Large breast', isCommon: true },
  ],
  'banana': [
    { id: '1medium', name: '1 medium', amount: 1, unit: 'piece', description: '7-8 inches', isCommon: true },
    { id: '1small', name: '1 small', amount: 1, unit: 'piece', description: '6 inches', isCommon: true },
    { id: '1large', name: '1 large', amount: 1, unit: 'piece', description: '8-9 inches', isCommon: true },
    { id: '100g', name: '100g', amount: 100, unit: 'g', description: 'Sliced', isCommon: false },
  ],
  'rice': [
    { id: '1cup', name: '1 cup', amount: 1, unit: 'cup', description: 'Cooked', isCommon: true },
    { id: '0.5cup', name: '1/2 cup', amount: 0.5, unit: 'cup', description: 'Cooked', isCommon: true },
    { id: '100g', name: '100g', amount: 100, unit: 'g', description: 'Cooked', isCommon: true },
    { id: '1serving', name: '1 serving', amount: 1, unit: 'serving', description: 'Package serving', isCommon: true },
  ],
  'milk': [
    { id: '1cup', name: '1 cup', amount: 1, unit: 'cup', description: '8 fl oz', isCommon: true },
    { id: '250ml', name: '250ml', amount: 250, unit: 'ml', description: 'Standard glass', isCommon: true },
    { id: '1pint', name: '1 pint', amount: 1, unit: 'pint', description: '16 fl oz', isCommon: true },
  ],
  'bread': [
    { id: '1slice', name: '1 slice', amount: 1, unit: 'slice', description: 'Standard slice', isCommon: true },
    { id: '2slices', name: '2 slices', amount: 2, unit: 'slice', description: 'Sandwich', isCommon: true },
    { id: '100g', name: '100g', amount: 100, unit: 'g', description: 'Weight', isCommon: false },
  ],
};

export class UnitConverter {
  static convert(value: number, fromUnit: string, toUnit: string, foodCategory?: string): number {
    const from = UNITS.find(u => u.id === fromUnit);
    const to = UNITS.find(u => u.id === toUnit);

    if (!from || !to) {
      console.warn(`Unit conversion failed: ${fromUnit} to ${toUnit}`);
      return value;
    }

    // If same category, convert normally
    if (from.category === to.category) {
      const baseValue = value * from.baseMultiplier;
      return baseValue / to.baseMultiplier;
    }

    // For different categories, we need food-specific conversions
    // This would require a food density database in a real app
    console.warn(`Cross-category conversion not supported: ${fromUnit} to ${toUnit}`);
    return value;
  }

  static getCompatibleUnits(unit: string): Unit[] {
    const baseUnit = UNITS.find(u => u.id === unit);
    if (!baseUnit) return [];

    return UNITS.filter(u => u.category === baseUnit.category);
  }

  static getUnitsByCategory(category: 'weight' | 'volume' | 'piece' | 'length'): Unit[] {
    return UNITS.filter(u => u.category === category);
  }

  static formatUnit(unit: string, amount: number): string {
    const unitObj = UNITS.find(u => u.id === unit);
    if (!unitObj) return unit;

    const symbol = unitObj.symbol;
    if (amount === 1) {
      return symbol;
    }
    return symbol + 's';
  }

  static getCommonServings(foodName: string): FoodServing[] {
    const normalizedName = foodName.toLowerCase();
    
    // Try exact match first
    if (COMMON_SERVINGS[normalizedName]) {
      return COMMON_SERVINGS[normalizedName];
    }

    // Try partial matches
    for (const [key, servings] of Object.entries(COMMON_SERVINGS)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return servings;
      }
    }

    // Return default servings
    return [
      { id: '100g', name: '100g', amount: 100, unit: 'g', isCommon: true },
      { id: '1serving', name: '1 serving', amount: 1, unit: 'serving', isCommon: true },
      { id: '1cup', name: '1 cup', amount: 1, unit: 'cup', isCommon: true },
    ];
  }
}

export interface NutritionCalculation {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  amount: number;
  unit: string;
  baseAmount: number; // Amount in base units (grams/ml)
}

export class NutritionCalculator {
  static calculateNutrition(
    food: any,
    amount: number,
    unit: string
  ): NutritionCalculation {
    const baseUnit = UNITS.find(u => u.id === unit);
    if (!baseUnit) {
      throw new Error(`Unknown unit: ${unit}`);
    }

    // Convert to base unit (grams for weight, ml for volume)
    const baseAmount = amount * baseUnit.baseMultiplier;
    
    // Calculate nutrition per base unit
    // Check if food data is per 100g or per serving
    const isPer100g = food.servingSize === 100 && food.servingUnit === 'g';
    const divisor = isPer100g ? 100 : (food.servingSize || 1);
    
    // Access nutrition data from the nutrition object
    const nutrition = food.nutrition || {};
    
    console.log('NutritionCalculator - Food data:', {
      foodName: food.name,
      nutrition,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      isPer100g,
      divisor,
      amount,
      unit,
      baseAmount
    });
    
    const nutritionPerBase = {
      calories: (nutrition.calories || 0) / divisor,
      protein: (nutrition.protein || 0) / divisor,
      carbs: (nutrition.carbs || 0) / divisor,
      fat: (nutrition.fat || 0) / divisor,
      fiber: (nutrition.fiber || 0) / divisor,
      sugar: (nutrition.sugar || 0) / divisor,
      sodium: (nutrition.sodium || 0) / divisor,
    };
    
    console.log('NutritionCalculator - Per base nutrition:', nutritionPerBase);

    return {
      calories: Math.round(nutritionPerBase.calories * baseAmount * 10) / 10,
      protein: Math.round(nutritionPerBase.protein * baseAmount * 10) / 10,
      carbs: Math.round(nutritionPerBase.carbs * baseAmount * 10) / 10,
      fat: Math.round(nutritionPerBase.fat * baseAmount * 10) / 10,
      fiber: Math.round(nutritionPerBase.fiber * baseAmount * 10) / 10,
      sugar: Math.round(nutritionPerBase.sugar * baseAmount * 10) / 10,
      sodium: Math.round(nutritionPerBase.sodium * baseAmount * 10) / 10,
      amount,
      unit,
      baseAmount,
    };
  }

  static calculateMealNutrition(foods: any[]): NutritionCalculation {
    return foods.reduce((total, food) => ({
      calories: total.calories + food.calories,
      protein: total.protein + food.protein,
      carbs: total.carbs + food.carbs,
      fat: total.fat + food.fat,
      fiber: (total.fiber || 0) + (food.fiber || 0),
      sugar: (total.sugar || 0) + (food.sugar || 0),
      sodium: (total.sodium || 0) + (food.sodium || 0),
      amount: 0,
      unit: '',
      baseAmount: 0,
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      amount: 0,
      unit: '',
      baseAmount: 0,
    });
  }
}
