"use client";

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Clock, 
  Target, 
  ChefHat, 
  Star, 
  Zap, 
  TrendingUp,
  Users,
  Award,
  Calendar,
  Plus,
  Play,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Food, NutritionGoals } from '@/types/nutrition';

interface MealPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  difficulty: 'easy' | 'intermediate' | 'advanced';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: {
    breakfast: Food[];
    lunch: Food[];
    dinner: Food[];
    snacks: Food[];
  };
  prepTime: number;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  rating: number;
  createdBy: string;
  isPremium: boolean;
}

interface AIMealPlannerProps {
  userGoals: NutritionGoals;
  onMealSelect: (food: Food) => void;
  onPlanSelect: (plan: MealPlan) => void;
}

const AIMealPlanner: React.FC<AIMealPlannerProps> = ({ userGoals, onMealSelect, onPlanSelect }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'plans' | 'recipes' | 'insights'>('generate');
  const [preferences, setPreferences] = useState({
    dietaryRestrictions: [] as string[],
    cuisineTypes: [] as string[],
    cookingTime: 30,
    skillLevel: 'intermediate' as 'easy' | 'intermediate' | 'advanced',
    budget: 'medium' as 'low' | 'medium' | 'high'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null);

  // Mock premium meal plans
  const premiumPlans: MealPlan[] = [
    {
      id: '1',
      name: 'High-Protein Power Plan',
      description: 'Optimized for muscle building with 200g+ protein daily',
      duration: 45,
      difficulty: 'intermediate',
      calories: 2800,
      protein: 220,
      carbs: 200,
      fat: 120,
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      },
      prepTime: 20,
      ingredients: ['Chicken breast', 'Greek yogurt', 'Quinoa', 'Broccoli', 'Almonds'],
      instructions: ['Prep proteins in advance', 'Batch cook grains', 'Store in containers'],
      tags: ['high-protein', 'muscle-building', 'meal-prep'],
      rating: 4.8,
      createdBy: 'AI Coach',
      isPremium: true
    },
    {
      id: '2',
      name: 'Keto Fat Burner',
      description: 'Low-carb, high-fat plan for rapid fat loss',
      duration: 30,
      difficulty: 'easy',
      calories: 1800,
      protein: 120,
      carbs: 50,
      fat: 140,
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      },
      prepTime: 15,
      ingredients: ['Avocado', 'Salmon', 'Spinach', 'Coconut oil', 'Nuts'],
      instructions: ['Focus on healthy fats', 'Limit carbs to 20g', 'Stay hydrated'],
      tags: ['keto', 'fat-loss', 'low-carb'],
      rating: 4.6,
      createdBy: 'AI Coach',
      isPremium: true
    },
    {
      id: '3',
      name: 'Mediterranean Wellness',
      description: 'Heart-healthy plan inspired by Mediterranean diet',
      duration: 40,
      difficulty: 'easy',
      calories: 2200,
      protein: 100,
      carbs: 250,
      fat: 90,
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      },
      prepTime: 25,
      ingredients: ['Olive oil', 'Fish', 'Vegetables', 'Whole grains', 'Nuts'],
      instructions: ['Use olive oil liberally', 'Include fish 3x/week', 'Eat colorful vegetables'],
      tags: ['mediterranean', 'heart-healthy', 'anti-inflammatory'],
      rating: 4.9,
      createdBy: 'AI Coach',
      isPremium: true
    }
  ];

  const generateMealPlan = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockPlan: MealPlan = {
      id: Date.now().toString(),
      name: 'AI Generated Plan',
      description: `Personalized plan based on your ${userGoals.weight_goal} goals`,
      duration: preferences.cookingTime,
      difficulty: preferences.skillLevel,
      calories: userGoals.daily_calories,
      protein: userGoals.daily_protein,
      carbs: userGoals.daily_carbs,
      fat: userGoals.daily_fat,
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      },
      prepTime: Math.floor(preferences.cookingTime * 0.6),
      ingredients: ['Chicken breast', 'Brown rice', 'Broccoli', 'Sweet potato', 'Greek yogurt'],
      instructions: ['Start with protein prep', 'Cook grains in batches', 'Steam vegetables'],
      tags: ['ai-generated', 'personalized', 'balanced'],
      rating: 4.7,
      createdBy: 'AI Coach',
      isPremium: false
    };
    
    setGeneratedPlan(mockPlan);
    setIsGenerating(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Meal Planner</h2>
              <p className="text-gray-400">Personalized nutrition plans powered by AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-400">Premium Feature</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'generate', label: 'Generate Plan', icon: Zap },
            { id: 'plans', label: 'Premium Plans', icon: ChefHat },
            { id: 'recipes', label: 'Recipes', icon: Calendar },
            { id: 'insights', label: 'Insights', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'generate' && (
          <div className="space-y-6">
            {/* Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Dietary Restrictions
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'].map(restriction => (
                    <button
                      key={restriction}
                      onClick={() => {
                        setPreferences(prev => ({
                          ...prev,
                          dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
                            ? prev.dietaryRestrictions.filter(r => r !== restriction)
                            : [...prev.dietaryRestrictions, restriction]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        preferences.dietaryRestrictions.includes(restriction)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {restriction}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Cuisine Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Italian', 'Asian', 'Mexican', 'Mediterranean', 'American', 'Indian'].map(cuisine => (
                    <button
                      key={cuisine}
                      onClick={() => {
                        setPreferences(prev => ({
                          ...prev,
                          cuisineTypes: prev.cuisineTypes.includes(cuisine)
                            ? prev.cuisineTypes.filter(c => c !== cuisine)
                            : [...prev.cuisineTypes, cuisine]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        preferences.cuisineTypes.includes(cuisine)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Cooking Time (minutes)
                </label>
                <input
                  type="range"
                  min="15"
                  max="120"
                  value={preferences.cookingTime}
                  onChange={(e) => setPreferences(prev => ({ ...prev, cookingTime: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>15 min</span>
                  <span className="font-medium">{preferences.cookingTime} min</span>
                  <span>2 hours</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Skill Level
                </label>
                <div className="flex gap-2">
                  {['easy', 'intermediate', 'advanced'].map(level => (
                    <button
                      key={level}
                      onClick={() => setPreferences(prev => ({ ...prev, skillLevel: level as any }))}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        preferences.skillLevel === level
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center">
              <button
                onClick={generateMealPlan}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating AI Plan...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6" />
                    Generate My Plan
                  </div>
                )}
              </button>
            </div>

            {/* Generated Plan */}
            {generatedPlan && (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Your AI-Generated Plan</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{generatedPlan.calories}</div>
                    <div className="text-sm text-gray-400">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-400">{generatedPlan.protein}g</div>
                    <div className="text-sm text-gray-400">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{generatedPlan.carbs}g</div>
                    <div className="text-sm text-gray-400">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{generatedPlan.fat}g</div>
                    <div className="text-sm text-gray-400">Fat</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => onPlanSelect(generatedPlan)}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
                  >
                    Use This Plan
                  </button>
                  <button
                    onClick={() => setGeneratedPlan(null)}
                    className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Premium Meal Plans</h3>
              <p className="text-gray-400">Expert-crafted plans for every goal</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumPlans.map(plan => (
                <div key={plan.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
                      <p className="text-sm text-gray-400">{plan.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-400">{plan.rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{plan.calories}</div>
                      <div className="text-xs text-gray-400">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-teal-400">{plan.protein}g</div>
                      <div className="text-xs text-gray-400">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{plan.carbs}g</div>
                      <div className="text-xs text-gray-400">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">{plan.fat}g</div>
                      <div className="text-xs text-gray-400">Fat</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(plan.difficulty)}`}>
                      {plan.difficulty}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      {plan.prepTime} min prep
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {plan.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => onPlanSelect(plan)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                  >
                    Use This Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Recipe Database</h3>
            <p className="text-gray-400 mb-6">Access thousands of premium recipes</p>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors">
              Browse Recipes
            </button>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nutrition Insights</h3>
            <p className="text-gray-400 mb-6">AI-powered analysis of your eating patterns</p>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors">
              View Insights
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMealPlanner;
