"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  ChefHat, 
  Star, 
  Clock, 
  Users, 
  Heart,
  ShoppingCart,
  Lock,
  Check,
  ArrowRight,
  BookOpen,
  Utensils,
  Zap,
  Award,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import PricingCard from '@/components/PricingCard';

interface Recipe {
  id: number;
  name: string;
  description: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty_level: string;
  cuisine_type: string;
  meal_type: string;
  image_url?: string;
  instructions: string[];
  tags: string[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  ingredients: {
    food: {
      name: string;
    };
    amount_g: number;
    notes?: string;
  }[];
}

function CookbookContent() {
  const { user, profile } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasCookbook, setHasCookbook] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [filter, setFilter] = useState({
    meal_type: 'all',
    difficulty: 'all',
    cuisine: 'all'
  });

  useEffect(() => {
    checkCookbookAccess();
    if (hasCookbook) {
      fetchRecipes();
    }
  }, [hasCookbook]);

  const checkCookbookAccess = async () => {
    if (!user) return;

    try {
      // Check if user has purchased cookbook
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('email', profile?.email)
        .single();

      // Check if user has cookbook access (either through subscription or one-time purchase)
      const hasAccess = subscription?.status === 'active' || 
                       profile?.subscription_tier === 'pro' ||
                       profile?.subscription_tier === 'premium';

      setHasCookbook(hasAccess);
    } catch (error) {
      console.error('Error checking cookbook access:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          ingredients:recipe_ingredients(
            amount_g,
            notes,
            food:foods(name)
          )
        `)
        .eq('is_public', true)
        .order('name');

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handlePurchase = async (plan: 'cookbook') => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_COOKBOOK_PRICE_ID,
          userEmail: profile?.email,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    if (filter.meal_type !== 'all' && recipe.meal_type !== filter.meal_type) return false;
    if (filter.difficulty !== 'all' && recipe.difficulty_level !== filter.difficulty) return false;
    if (filter.cuisine !== 'all' && recipe.cuisine_type !== filter.cuisine) return false;
    return true;
  });

  const mealTypes = ['all', ...Array.from(new Set(recipes.map(r => r.meal_type)))];
  const difficulties = ['all', ...Array.from(new Set(recipes.map(r => r.difficulty_level)))];
  const cuisines = ['all', ...Array.from(new Set(recipes.map(r => r.cuisine_type)))];

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar activePage="cookbook" />
        <div className="main-content flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!hasCookbook) {
    return (
      <div className="dashboard-layout">
        <Sidebar activePage="cookbook" />
        
        <div className="main-content">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Fit Fusion AI Cookbook</h1>
              <p className="text-gray-400">100+ healthy recipes designed for your fitness goals</p>
            </div>
            
            <button
              onClick={() => setShowPurchase(true)}
              className="btn flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Purchase Cookbook
            </button>
          </div>

          {/* Cookbook Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-800 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">What's Included</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">100+ healthy recipes</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Macro breakdowns for each recipe</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Shopping lists and meal prep guides</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Difficulty levels and prep times</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Lifetime access</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-4">Sample Recipes</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">High-Protein Chicken Bowl</h4>
                        <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">45 min • 4 servings • 420 cal</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">Quinoa Power Salad</h4>
                        <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">25 min • 2 servings • 380 cal</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">Protein Smoothie Bowl</h4>
                        <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">10 min • 1 serving • 320 cal</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <Utensils className="w-8 h-8 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Meal Planning</h3>
              <p className="text-gray-400 text-sm">Plan your weekly meals with our curated recipes</p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <Zap className="w-8 h-8 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Quick Prep</h3>
              <p className="text-gray-400 text-sm">Most recipes ready in under 30 minutes</p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <Award className="w-8 h-8 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nutrition Focused</h3>
              <p className="text-gray-400 text-sm">Every recipe optimized for your fitness goals</p>
            </div>
          </div>

          {/* Purchase Modal */}
          {showPurchase && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Purchase Cookbook</h2>
                  <button
                    onClick={() => setShowPurchase(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <PricingCard
                  plan="cookbook"
                  isPopular={false}
                  onSelect={() => {
                    handlePurchase('cookbook');
                    setShowPurchase(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activePage="cookbook" />
      
      <div className="main-content">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Fit Fusion AI Cookbook</h1>
            <p className="text-gray-400">100+ healthy recipes for your fitness journey</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">Unlocked</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Meal Type</label>
              <select
                value={filter.meal_type}
                onChange={(e) => setFilter(prev => ({ ...prev, meal_type: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {mealTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
              <select
                value={filter.difficulty}
                onChange={(e) => setFilter(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {diff === 'all' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cuisine</label>
              <select
                value={filter.cuisine}
                onChange={(e) => setFilter(prev => ({ ...prev, cuisine: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine === 'all' ? 'All Cuisines' : cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition">
              <div className="aspect-video bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                {recipe.image_url ? (
                  <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <ChefHat className="w-12 h-12 text-gray-400" />
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">{recipe.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{recipe.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {recipe.prep_time_minutes + recipe.cook_time_minutes} min
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {recipe.servings} servings
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {recipe.difficulty_level}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div className="text-center">
                  <div className="text-green-400 font-semibold">{recipe.total_calories}</div>
                  <div className="text-gray-400">calories</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-semibold">{recipe.total_protein}g</div>
                  <div className="text-gray-400">protein</div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedRecipe(recipe)}
                className="w-full bg-green-400 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-500 transition"
              >
                View Recipe
              </button>
            </div>
          ))}
        </div>

        {/* Recipe Modal */}
        {selectedRecipe && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">{selectedRecipe.name}</h2>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Ingredients</h3>
                    <div className="space-y-2">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-300">{ingredient.food.name}</span>
                          <span className="text-gray-400">{ingredient.amount_g}g</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Instructions</h3>
                    <ol className="space-y-3">
                      {selectedRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="text-gray-300 text-sm flex">
                          <span className="text-green-400 font-semibold mr-3">{index + 1}.</span>
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">{selectedRecipe.total_calories}</div>
                    <div className="text-sm text-gray-400">Calories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{selectedRecipe.total_protein}g</div>
                    <div className="text-sm text-gray-400">Protein</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{selectedRecipe.total_carbs}g</div>
                    <div className="text-sm text-gray-400">Carbs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{selectedRecipe.total_fat}g</div>
                    <div className="text-sm text-gray-400">Fat</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Cookbook() {
  return (
    <AuthGuard>
      <CookbookContent />
    </AuthGuard>
  );
}
