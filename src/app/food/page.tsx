"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import FoodSearch from '@/components/food/FoodSearch';
import MealCard from '@/components/food/MealCard';
import DailySummary from '@/components/food/DailySummary';
import FoodLogForm from '@/components/food/FoodLogForm';
import BarcodeScanner from '@/components/food/BarcodeScanner';
import AIMealPlanner from '@/components/ai/AIMealPlanner';
import NutritionAnalytics from '@/components/analytics/NutritionAnalytics';
import MetabolismTracker from '@/components/analytics/MetabolismTracker';
import CommunityFeatures from '@/components/social/CommunityFeatures';
import PremiumSubscription from '@/components/subscription/PremiumSubscription';
import PaywallGate from '@/components/subscription/PaywallGate';
import { 
  Plus, 
  Search, 
  Barcode, 
  Calendar,
  Target,
  TrendingUp,
  Award,
  Star,
  Clock,
  Filter,
  Brain,
  BarChart3,
  Users,
  Apple,
  Activity
} from 'lucide-react';
import { 
  Food, 
  FoodLog, 
  DailyNutrition, 
  NutritionGoals,
  NutritionData 
} from '@/types/nutrition';
import { nutritionAPI } from '@/lib/nutritionApi';

function FoodTrackerContent() {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>({
    id: '1',
    user_id: profile?.id || 'user',
    daily_calories: 2000,
    daily_protein: 150,
    daily_carbs: 250,
    daily_fat: 67,
    daily_fiber: 25,
    daily_sodium: 2300,
    weight_goal: 'maintain',
    activity_level: 'moderate',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // UI State
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showGoalsEditor, setShowGoalsEditor] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [editingLog, setEditingLog] = useState<FoodLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tracker' | 'ai' | 'analytics' | 'metabolism' | 'community'>('tracker');
  const [showSubscription, setShowSubscription] = useState(false);
  const [isPremium, setIsPremium] = useState(false); // Mock premium status

  // Mock data for demonstration
  useEffect(() => {
    loadMockData();
  }, [selectedDate]);

  const loadMockData = async () => {
    setLoading(true);
    
    // Mock food logs for demonstration
    const mockLogs: FoodLog[] = [
      {
        id: '1',
        food_id: '1',
        food: {
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
        amount: 150,
        unit: 'g',
        date: selectedDate,
        meal_type: 'breakfast',
        created_at: new Date().toISOString(),
        user_id: profile?.id || 'user'
      },
      {
        id: '2',
        food_id: '2',
        food: {
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
        amount: 200,
        unit: 'g',
        date: selectedDate,
        meal_type: 'lunch',
        created_at: new Date().toISOString(),
        user_id: profile?.id || 'user'
      }
    ];

    setFoodLogs(mockLogs);
    setLoading(false);
  };

  const calculateDailyNutrition = (): DailyNutrition => {
    const total: NutritionData = foodLogs.reduce((totals, log) => {
      if (!log.food) return totals;
      
      const nutrition = nutritionAPI.calculateNutrition(log.food, log.amount, log.unit);
      
      return {
        calories: totals.calories + nutrition.calories,
        protein: totals.protein + nutrition.protein,
        carbs: totals.carbs + nutrition.carbs,
        fat: totals.fat + nutrition.fat,
        fiber: totals.fiber + nutrition.fiber,
        sugar: totals.sugar + nutrition.sugar,
        sodium: totals.sodium + nutrition.sodium,
        cholesterol: totals.cholesterol + nutrition.cholesterol,
        saturated_fat: totals.saturated_fat + nutrition.saturated_fat,
        trans_fat: totals.trans_fat + nutrition.trans_fat,
        potassium: totals.potassium + nutrition.potassium,
        vitamin_a: totals.vitamin_a + nutrition.vitamin_a,
        vitamin_c: totals.vitamin_c + nutrition.vitamin_c,
        calcium: totals.calcium + nutrition.calcium,
        iron: totals.iron + nutrition.iron
      };
    }, {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0,
      sodium: 0, cholesterol: 0, saturated_fat: 0, trans_fat: 0,
      potassium: 0, vitamin_a: 0, vitamin_c: 0, calcium: 0, iron: 0
    });

    const meals = {
      breakfast: calculateMealNutrition('breakfast'),
      lunch: calculateMealNutrition('lunch'),
      dinner: calculateMealNutrition('dinner'),
      snack: calculateMealNutrition('snack')
    };

    const progress = {
      calories: (total.calories / nutritionGoals.daily_calories) * 100,
      protein: (total.protein / nutritionGoals.daily_protein) * 100,
      carbs: (total.carbs / nutritionGoals.daily_carbs) * 100,
      fat: (total.fat / nutritionGoals.daily_fat) * 100,
      fiber: (total.fiber / nutritionGoals.daily_fiber) * 100,
      sodium: (total.sodium / nutritionGoals.daily_sodium) * 100
    };

    return {
      date: selectedDate,
      total,
      meals,
      goals: nutritionGoals,
      progress
    };
  };

  const calculateMealNutrition = (mealType: string): NutritionData => {
    return foodLogs
      .filter(log => log.meal_type === mealType)
      .reduce((totals, log) => {
        if (!log.food) return totals;
        
        const nutrition = nutritionAPI.calculateNutrition(log.food, log.amount, log.unit);
        
        return {
          calories: totals.calories + nutrition.calories,
          protein: totals.protein + nutrition.protein,
          carbs: totals.carbs + nutrition.carbs,
          fat: totals.fat + nutrition.fat,
          fiber: totals.fiber + nutrition.fiber,
          sugar: totals.sugar + nutrition.sugar,
          sodium: totals.sodium + nutrition.sodium,
          cholesterol: totals.cholesterol + nutrition.cholesterol,
          saturated_fat: totals.saturated_fat + nutrition.saturated_fat,
          trans_fat: totals.trans_fat + nutrition.trans_fat,
          potassium: totals.potassium + nutrition.potassium,
          vitamin_a: totals.vitamin_a + nutrition.vitamin_a,
          vitamin_c: totals.vitamin_c + nutrition.vitamin_c,
          calcium: totals.calcium + nutrition.calcium,
          iron: totals.iron + nutrition.iron
        };
      }, {
        calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0,
        sodium: 0, cholesterol: 0, saturated_fat: 0, trans_fat: 0,
        potassium: 0, vitamin_a: 0, vitamin_c: 0, calcium: 0, iron: 0
      });
  };

  const getMealLogs = (mealType: string) => {
    return foodLogs.filter(log => log.meal_type === mealType);
  };

  const handleFoodSelect = (food: Food) => {
    setSelectedMealType('breakfast'); // Default to breakfast
    setEditingLog(null);
    // In a real implementation, this would open the FoodLogForm
    console.log('Selected food:', food);
  };

  const handleBarcodeDetected = async (barcode: string) => {
    try {
      const food = await nutritionAPI.getFoodByBarcode(barcode);
      if (food) {
        handleFoodSelect(food);
      } else {
        alert('Food not found for this barcode');
      }
    } catch (error) {
      console.error('Error looking up barcode:', error);
      alert('Error looking up barcode');
    }
    setShowBarcodeScanner(false);
  };

  const handleAddFood = (mealType: string) => {
    setSelectedMealType(mealType);
    setShowFoodSearch(true);
  };

  const handleSaveLog = (log: Omit<FoodLog, 'id' | 'created_at' | 'user_id'>) => {
    const newLog: FoodLog = {
      ...log,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      user_id: profile?.id || 'user'
    };

    if (editingLog) {
      setFoodLogs(prev => prev.map(l => l.id === editingLog.id ? newLog : l));
    } else {
      setFoodLogs(prev => [...prev, newLog]);
    }

    setEditingLog(null);
  };

  const handleRemoveLog = (logId: string) => {
    setFoodLogs(prev => prev.filter(log => log.id !== logId));
  };

  const handleEditLog = (log: FoodLog) => {
    setEditingLog(log);
    setSelectedMealType(log.meal_type);
  };

  const dailyNutrition = calculateDailyNutrition();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your nutrition data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        <Sidebar activePage="food-tracker" />

        <div className="flex-1">
          <div className="main-content">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Food Tracker</h1>
                <p className="text-gray-400 text-lg">Track your nutrition and reach your goals</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBarcodeScanner(true)}
                    className="p-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
                    title="Scan Barcode"
                  >
                    <Barcode className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowFoodSearch(true)}
                    className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-teal-700 hover:to-blue-700 transition-all duration-300"
                  >
                    <Plus className="w-5 h-5" />
                    Add Food
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
              {[
                { id: 'tracker', label: 'Food Tracker', icon: Apple },
                { id: 'ai', label: 'AI Planner', icon: Brain },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'metabolism', label: 'Metabolism', icon: Activity },
                { id: 'community', label: 'Community', icon: Users }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                  {tab.id !== 'tracker' && (
                    <Star className="w-4 h-4 text-yellow-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'tracker' && (
              <>
                {/* Daily Summary */}
                <div className="mb-8">
                  <DailySummary 
                    nutrition={dailyNutrition}
                    onEditGoals={() => setShowGoalsEditor(true)}
                  />
                </div>

                {/* Meal Cards */}
                <div className="space-y-6">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
                    <MealCard
                      key={mealType}
                      mealType={mealType as any}
                      logs={getMealLogs(mealType)}
                      onAddFood={handleAddFood}
                      onRemoveLog={handleRemoveLog}
                      onEditLog={handleEditLog}
                    />
                  ))}
                </div>
              </>
            )}

            {activeTab === 'ai' && (
              <PaywallGate
                feature="AI Meal Planner"
                description="Get personalized meal plans powered by AI"
                onUpgrade={() => setShowSubscription(true)}
              >
                <AIMealPlanner
                  userGoals={nutritionGoals}
                  onMealSelect={handleFoodSelect}
                  onPlanSelect={(plan) => console.log('Selected plan:', plan)}
                />
              </PaywallGate>
            )}

            {activeTab === 'analytics' && (
              <PaywallGate
                feature="Advanced Analytics"
                description="Deep insights into your nutrition patterns"
                onUpgrade={() => setShowSubscription(true)}
              >
                <NutritionAnalytics
                  userGoals={nutritionGoals}
                  onInsightAction={(insight) => console.log('Insight action:', insight)}
                />
              </PaywallGate>
            )}

            {activeTab === 'metabolism' && (
              <PaywallGate
                feature="Metabolism Tracker"
                description="AI-powered BMR estimation and optimization"
                onUpgrade={() => setShowSubscription(true)}
              >
                <MetabolismTracker
                  userId={profile?.id || 'user'}
                  onRecommendationAction={(recommendation) => console.log('Recommendation action:', recommendation)}
                />
              </PaywallGate>
            )}

            {activeTab === 'community' && (
              <PaywallGate
                feature="Community Features"
                description="Connect with others and join challenges"
                onUpgrade={() => setShowSubscription(true)}
              >
                <CommunityFeatures
                  onJoinChallenge={(challengeId) => console.log('Join challenge:', challengeId)}
                  onViewProfile={(userId) => console.log('View profile:', userId)}
                />
              </PaywallGate>
            )}

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Award className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Streak</h3>
                    <p className="text-sm text-gray-400">Days logged in a row</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">7</div>
                <div className="text-sm text-gray-400">Keep it up!</div>
              </div>

              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">This Week</h3>
                    <p className="text-sm text-gray-400">Average daily calories</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">1,847</div>
                <div className="text-sm text-gray-400">vs 2,000 goal</div>
              </div>

              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Star className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Nutrition Score</h3>
                    <p className="text-sm text-gray-400">Today's performance</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">85</div>
                <div className="text-sm text-gray-400">Great job!</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFoodSearch && (
        <FoodSearch
          onFoodSelect={handleFoodSelect}
          onClose={() => setShowFoodSearch(false)}
        />
      )}

      {showBarcodeScanner && (
        <BarcodeScanner
          onBarcodeDetected={handleBarcodeDetected}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      {editingLog && (
        <FoodLogForm
          food={editingLog.food!}
          mealType={editingLog.meal_type}
          onSave={handleSaveLog}
          onCancel={() => setEditingLog(null)}
          editLog={editingLog}
        />
      )}

      {showSubscription && (
        <PremiumSubscription
          onSubscribe={(planId) => {
            console.log('Subscribe to plan:', planId);
            setIsPremium(true);
            setShowSubscription(false);
          }}
          onClose={() => setShowSubscription(false)}
        />
      )}
    </div>
  );
}

export default function FoodTracker() {
  return (
    <AuthGuard>
      <FoodTrackerContent />
    </AuthGuard>
  );
}