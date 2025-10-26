// Comprehensive Food Database with Search and Auto-complete
export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize: string;
  servingUnit: string;
  commonServing?: string;
  verified: boolean;
  barcode?: string;
}

export const FOOD_CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Grains',
  'Proteins',
  'Dairy',
  'Nuts & Seeds',
  'Beverages',
  'Snacks',
  'Condiments',
  'Frozen Foods',
  'Canned Foods',
  'Bakery',
  'Breakfast',
  'Desserts',
  'Other'
];

export const FOOD_DATABASE: FoodItem[] = [
  // FRUITS
  {
    id: 'apple-red-delicious',
    name: 'Red Delicious Apple',
    category: 'Fruits',
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    fiber: 4,
    sugar: 19,
    servingSize: '1 medium',
    servingUnit: 'piece',
    commonServing: '1 medium apple (182g)',
    verified: true
  },
  {
    id: 'banana-medium',
    name: 'Banana',
    category: 'Fruits',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    fiber: 3,
    sugar: 14,
    servingSize: '1 medium',
    servingUnit: 'piece',
    commonServing: '1 medium banana (118g)',
    verified: true
  },
  {
    id: 'orange-navel',
    name: 'Navel Orange',
    category: 'Fruits',
    calories: 62,
    protein: 1.2,
    carbs: 15.4,
    fat: 0.2,
    fiber: 3.1,
    sugar: 12,
    servingSize: '1 medium',
    servingUnit: 'piece',
    commonServing: '1 medium orange (140g)',
    verified: true
  },
  {
    id: 'strawberries-cup',
    name: 'Strawberries',
    category: 'Fruits',
    calories: 49,
    protein: 1,
    carbs: 12,
    fat: 0.5,
    fiber: 3,
    sugar: 7,
    servingSize: '1 cup',
    servingUnit: 'cup',
    commonServing: '1 cup sliced (152g)',
    verified: true
  },
  {
    id: 'blueberries-cup',
    name: 'Blueberries',
    category: 'Fruits',
    calories: 84,
    protein: 1.1,
    carbs: 21,
    fat: 0.5,
    fiber: 3.6,
    sugar: 15,
    servingSize: '1 cup',
    servingUnit: 'cup',
    commonServing: '1 cup (148g)',
    verified: true
  },
  {
    id: 'avocado-medium',
    name: 'Avocado',
    category: 'Fruits',
    calories: 234,
    protein: 3,
    carbs: 12,
    fat: 21,
    fiber: 10,
    sugar: 1,
    servingSize: '1 medium',
    servingUnit: 'piece',
    commonServing: '1 medium avocado (150g)',
    verified: true
  },

  // VEGETABLES
  {
    id: 'broccoli-cup',
    name: 'Broccoli',
    category: 'Vegetables',
    calories: 55,
    protein: 5.7,
    carbs: 11,
    fat: 0.6,
    fiber: 5,
    sugar: 2.6,
    servingSize: '1 cup',
    servingUnit: 'cup',
    commonServing: '1 cup chopped (91g)',
    verified: true
  },
  {
    id: 'spinach-cup',
    name: 'Spinach',
    category: 'Vegetables',
    calories: 7,
    protein: 0.9,
    carbs: 1.1,
    fat: 0.1,
    fiber: 0.7,
    sugar: 0.1,
    servingSize: '1 cup',
    servingUnit: 'cup',
    commonServing: '1 cup raw (30g)',
    verified: true
  },
  {
    id: 'carrot-medium',
    name: 'Carrot',
    category: 'Vegetables',
    calories: 25,
    protein: 0.5,
    carbs: 6,
    fat: 0.1,
    fiber: 1.7,
    sugar: 4.7,
    servingSize: '1 medium',
    servingUnit: 'piece',
    commonServing: '1 medium carrot (61g)',
    verified: true
  },
  {
    id: 'sweet-potato-medium',
    name: 'Sweet Potato',
    category: 'Vegetables',
    calories: 112,
    protein: 2,
    carbs: 26,
    fat: 0.1,
    fiber: 3.8,
    sugar: 5.4,
    servingSize: '1 medium',
    servingUnit: 'piece',
    commonServing: '1 medium (114g)',
    verified: true
  },
  {
    id: 'bell-pepper-red',
    name: 'Red Bell Pepper',
    category: 'Vegetables',
    calories: 31,
    protein: 1,
    carbs: 7,
    fat: 0.4,
    fiber: 2.5,
    sugar: 4.2,
    servingSize: '1 medium',
    servingUnit: 'piece',
    commonServing: '1 medium pepper (119g)',
    verified: true
  },

  // PROTEINS
  {
    id: 'chicken-breast-4oz',
    name: 'Chicken Breast',
    category: 'Proteins',
    calories: 185,
    protein: 35,
    carbs: 0,
    fat: 4,
    fiber: 0,
    sugar: 0,
    servingSize: '4 oz',
    servingUnit: 'oz',
    commonServing: '4 oz cooked (113g)',
    verified: true
  },
  {
    id: 'salmon-4oz',
    name: 'Salmon',
    category: 'Proteins',
    calories: 206,
    protein: 22,
    carbs: 0,
    fat: 12,
    fiber: 0,
    sugar: 0,
    servingSize: '4 oz',
    servingUnit: 'oz',
    commonServing: '4 oz cooked (113g)',
    verified: true
  },
  {
    id: 'eggs-large',
    name: 'Large Egg',
    category: 'Proteins',
    calories: 70,
    protein: 6,
    carbs: 0.6,
    fat: 5,
    fiber: 0,
    sugar: 0.6,
    servingSize: '1 large',
    servingUnit: 'piece',
    commonServing: '1 large egg (50g)',
    verified: true
  },
  {
    id: 'ground-beef-85-4oz',
    name: 'Ground Beef (85% lean)',
    category: 'Proteins',
    calories: 240,
    protein: 22,
    carbs: 0,
    fat: 17,
    fiber: 0,
    sugar: 0,
    servingSize: '4 oz',
    servingUnit: 'oz',
    commonServing: '4 oz cooked (113g)',
    verified: true
  },
  {
    id: 'tofu-firm-4oz',
    name: 'Firm Tofu',
    category: 'Proteins',
    calories: 88,
    protein: 10,
    carbs: 2.3,
    fat: 5.3,
    fiber: 0.3,
    sugar: 0.6,
    servingSize: '4 oz',
    servingUnit: 'oz',
    commonServing: '4 oz (113g)',
    verified: true
  },
  {
    id: 'greek-yogurt-plain',
    name: 'Greek Yogurt (Plain)',
    category: 'Dairy',
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0,
    fiber: 0,
    sugar: 6,
    servingSize: '1 cup',
    servingUnit: 'cup',
    commonServing: '1 cup (245g)',
    verified: true
  },

  // GRAINS
  {
    id: 'brown-rice-cooked',
    name: 'Brown Rice (Cooked)',
    category: 'Grains',
    calories: 112,
    protein: 2.6,
    carbs: 22,
    fat: 0.9,
    fiber: 1.8,
    sugar: 0.4,
    servingSize: '1/2 cup',
    servingUnit: 'cup',
    commonServing: '1/2 cup cooked (98g)',
    verified: true
  },
  {
    id: 'quinoa-cooked',
    name: 'Quinoa (Cooked)',
    category: 'Grains',
    calories: 111,
    protein: 4,
    carbs: 20,
    fat: 1.8,
    fiber: 2.8,
    sugar: 0.9,
    servingSize: '1/2 cup',
    servingUnit: 'cup',
    commonServing: '1/2 cup cooked (92g)',
    verified: true
  },
  {
    id: 'oats-rolled',
    name: 'Rolled Oats',
    category: 'Grains',
    calories: 154,
    protein: 5.3,
    carbs: 27,
    fat: 2.6,
    fiber: 4,
    sugar: 1,
    servingSize: '1/2 cup',
    servingUnit: 'cup',
    commonServing: '1/2 cup dry (40g)',
    verified: true
  },
  {
    id: 'whole-wheat-bread',
    name: 'Whole Wheat Bread',
    category: 'Grains',
    calories: 81,
    protein: 4,
    carbs: 14,
    fat: 1.1,
    fiber: 2,
    sugar: 1.4,
    servingSize: '1 slice',
    servingUnit: 'slice',
    commonServing: '1 slice (28g)',
    verified: true
  },

  // NUTS & SEEDS
  {
    id: 'almonds-1oz',
    name: 'Almonds',
    category: 'Nuts & Seeds',
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    fiber: 3.5,
    sugar: 1.2,
    servingSize: '1 oz',
    servingUnit: 'oz',
    commonServing: '1 oz (28g)',
    verified: true
  },
  {
    id: 'peanut-butter-2tbsp',
    name: 'Peanut Butter',
    category: 'Nuts & Seeds',
    calories: 188,
    protein: 8,
    carbs: 6,
    fat: 16,
    fiber: 2,
    sugar: 3,
    servingSize: '2 tbsp',
    servingUnit: 'tbsp',
    commonServing: '2 tbsp (32g)',
    verified: true
  },
  {
    id: 'chia-seeds-1oz',
    name: 'Chia Seeds',
    category: 'Nuts & Seeds',
    calories: 137,
    protein: 4.4,
    carbs: 12,
    fat: 8.6,
    fiber: 10.6,
    sugar: 0,
    servingSize: '1 oz',
    servingUnit: 'oz',
    commonServing: '1 oz (28g)',
    verified: true
  },

  // DAIRY
  {
    id: 'milk-2-percent',
    name: '2% Milk',
    category: 'Dairy',
    calories: 122,
    protein: 8,
    carbs: 12,
    fat: 5,
    fiber: 0,
    sugar: 12,
    servingSize: '1 cup',
    servingUnit: 'cup',
    commonServing: '1 cup (244g)',
    verified: true
  },
  {
    id: 'cheddar-cheese-1oz',
    name: 'Cheddar Cheese',
    category: 'Dairy',
    calories: 113,
    protein: 7,
    carbs: 0.4,
    fat: 9,
    fiber: 0,
    sugar: 0.4,
    servingSize: '1 oz',
    servingUnit: 'oz',
    commonServing: '1 oz (28g)',
    verified: true
  },
  {
    id: 'cottage-cheese-1cup',
    name: 'Cottage Cheese (Low-fat)',
    category: 'Dairy',
    calories: 163,
    protein: 28,
    carbs: 6,
    fat: 2,
    fiber: 0,
    sugar: 6,
    servingSize: '1 cup',
    servingUnit: 'cup',
    commonServing: '1 cup (226g)',
    verified: true
  },

  // BEVERAGES
  {
    id: 'water-8oz',
    name: 'Water',
    category: 'Beverages',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    servingSize: '8 fl oz',
    servingUnit: 'fl oz',
    commonServing: '8 fl oz (237ml)',
    verified: true
  },
  {
    id: 'coffee-black',
    name: 'Black Coffee',
    category: 'Beverages',
    calories: 2,
    protein: 0.3,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    servingSize: '8 fl oz',
    servingUnit: 'fl oz',
    commonServing: '8 fl oz (237ml)',
    verified: true
  },
  {
    id: 'green-tea',
    name: 'Green Tea',
    category: 'Beverages',
    calories: 2,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    servingSize: '8 fl oz',
    servingUnit: 'fl oz',
    commonServing: '8 fl oz (237ml)',
    verified: true
  },

  // SNACKS
  {
    id: 'hummus-2tbsp',
    name: 'Hummus',
    category: 'Snacks',
    calories: 50,
    protein: 2,
    carbs: 4,
    fat: 3,
    fiber: 1,
    sugar: 0,
    servingSize: '2 tbsp',
    servingUnit: 'tbsp',
    commonServing: '2 tbsp (30g)',
    verified: true
  },
  {
    id: 'dark-chocolate-1oz',
    name: 'Dark Chocolate (70%)',
    category: 'Snacks',
    calories: 155,
    protein: 2,
    carbs: 15,
    fat: 11,
    fiber: 3,
    sugar: 12,
    servingSize: '1 oz',
    servingUnit: 'oz',
    commonServing: '1 oz (28g)',
    verified: true
  },

  // BREAKFAST
  {
    id: 'eggs-scrambled-2',
    name: 'Scrambled Eggs',
    category: 'Breakfast',
    calories: 140,
    protein: 12,
    carbs: 1.2,
    fat: 10,
    fiber: 0,
    sugar: 1.2,
    servingSize: '2 large',
    servingUnit: 'piece',
    commonServing: '2 large eggs (100g)',
    verified: true
  },
  {
    id: 'pancakes-3',
    name: 'Pancakes',
    category: 'Breakfast',
    calories: 210,
    protein: 6,
    carbs: 30,
    fat: 7,
    fiber: 1,
    sugar: 6,
    servingSize: '3 pancakes',
    servingUnit: 'piece',
    commonServing: '3 pancakes (90g)',
    verified: true
  },

  // FROZEN FOODS
  {
    id: 'frozen-broccoli-cup',
    name: 'Frozen Broccoli',
    category: 'Frozen Foods',
    calories: 25,
    protein: 3,
    carbs: 5,
    fat: 0.3,
    fiber: 3,
    sugar: 2,
    servingSize: '1 cup',
    servingUnit: 'cup',
    commonServing: '1 cup (156g)',
    verified: true
  },
  {
    id: 'frozen-berries-cup',
    name: 'Frozen Mixed Berries',
    category: 'Frozen Foods',
    calories: 70,
    protein: 1,
    carbs: 17,
    fat: 0.5,
    fiber: 4,
    sugar: 12,
    servingSize: '1 cup',
    servingUnit: 'cup',
    commonServing: '1 cup (140g)',
    verified: true
  }
];

// Search and filter functions
export const searchFoods = (query: string, category?: string): FoodItem[] => {
  let results = FOOD_DATABASE;
  
  // Filter by category if specified
  if (category && category !== 'All') {
    results = results.filter(food => food.category === category);
  }
  
  // Search by name or brand
  if (query.trim()) {
    const searchTerm = query.toLowerCase();
    results = results.filter(food => 
      food.name.toLowerCase().includes(searchTerm) ||
      (food.brand && food.brand.toLowerCase().includes(searchTerm)) ||
      food.category.toLowerCase().includes(searchTerm)
    );
  }
  
  // Sort by relevance (exact matches first, then partial matches)
  return results.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const searchTerm = query.toLowerCase();
    
    if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
    if (!aName.startsWith(searchTerm) && bName.startsWith(searchTerm)) return 1;
    return aName.localeCompare(bName);
  });
};

export const getFoodById = (id: string): FoodItem | undefined => {
  return FOOD_DATABASE.find(food => food.id === id);
};

export const getFoodsByCategory = (category: string): FoodItem[] => {
  return FOOD_DATABASE.filter(food => food.category === category);
};

export const getPopularFoods = (limit: number = 20): FoodItem[] => {
  // Return most commonly searched/used foods
  const popularIds = [
    'chicken-breast-4oz',
    'brown-rice-cooked',
    'broccoli-cup',
    'eggs-large',
    'banana-medium',
    'almonds-1oz',
    'greek-yogurt-plain',
    'salmon-4oz',
    'sweet-potato-medium',
    'avocado-medium',
    'quinoa-cooked',
    'spinach-cup',
    'oats-rolled',
    'peanut-butter-2tbsp',
    'apple-red-delicious',
    'bell-pepper-red',
    'carrot-medium',
    'tofu-firm-4oz',
    'cottage-cheese-1cup',
    'hummus-2tbsp'
  ];
  
  return popularIds
    .map(id => getFoodById(id))
    .filter(Boolean)
    .slice(0, limit) as FoodItem[];
};


















