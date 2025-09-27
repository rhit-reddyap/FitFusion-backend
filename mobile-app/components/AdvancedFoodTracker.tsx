import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  RefreshControl,
  Modal,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataStorage } from '../utils/dataStorage';
import EnhancedFoodSearch from './EnhancedFoodSearch';
import EnhancedMealInterface from './EnhancedMealInterface';
import MonthlyCalendar from './MonthlyCalendar';
import WaterTracker from './WaterTracker';
import { foodApiService, FoodItem, FoodLogEntry } from '../services/foodApiService';
import { UnitConverter, NutritionCalculator } from '../utils/unitConversions';

const { width, height } = Dimensions.get('window');

interface AdvancedFoodTrackerProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

interface FoodEntry {
  id: string;
  name: string;
  brand?: string;
  amount: number;
  unit: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  addedAt: Date;
}

interface Meal {
  id: string;
  name: string;
  icon: string;
  color: string[];
  time: string;
  foods: FoodEntry[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
}

export default function AdvancedFoodTracker({ onBack, onNavigate }: AdvancedFoodTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [activeMealId, setActiveMealId] = useState<string | null>(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [historicalData, setHistoricalData] = useState<{[key: string]: Meal[]}>({});
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);

  // Initialize meals
  useEffect(() => {
    const defaultMeals = initializeMeals();
    setMeals(defaultMeals);
    loadUserData();
  }, []);

  // Load data when selected date changes
  useEffect(() => {
    loadDataForDate(selectedDate);
  }, [selectedDate]);

  const initializeMeals = (): Meal[] => {
    const defaultMeals: Meal[] = [
      {
        id: 'breakfast',
        name: 'Breakfast',
        icon: 'sunny',
        color: ['#F59E0B', '#D97706'],
        time: '7:00 AM',
        foods: [],
        totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
      },
      {
        id: 'lunch',
        name: 'Lunch',
        icon: 'sunny',
        color: ['#10B981', '#059669'],
        time: '12:00 PM',
        foods: [],
        totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
      },
      {
        id: 'dinner',
        name: 'Dinner',
        icon: 'moon',
        color: ['#8B5CF6', '#7C3AED'],
        time: '7:00 PM',
        foods: [],
        totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
      },
      {
        id: 'snacks',
        name: 'Snacks',
        icon: 'cafe',
        color: ['#EF4444', '#DC2626'],
        time: '3:00 PM',
        foods: [],
        totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
      }
    ];
    return defaultMeals;
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const [stats, logs] = await Promise.all([
        DataStorage.getUserStats(),
        foodApiService.getFoodLogs(today)
      ]);
      
      setUserStats(stats);
      
      // Convert food logs to meal structure
      if (logs && logs.length > 0) {
        const mealMap = new Map<string, FoodEntry[]>();
        
        logs.forEach(log => {
          const foodEntry: FoodEntry = {
            id: log.id,
            name: log.foodName,
            amount: log.amount,
            unit: log.unit,
            nutrition: log.nutrition,
            addedAt: new Date(log.loggedAt)
          };
          
          if (!mealMap.has(log.mealType)) {
            mealMap.set(log.mealType, []);
          }
          mealMap.get(log.mealType)!.push(foodEntry);
        });
        
        // Update meals with loaded data
        setMeals(prevMeals => 
          prevMeals.map(meal => {
            const foods = mealMap.get(meal.id) || [];
            const totalNutrition = calculateMealNutrition(foods);
            return { ...meal, foods, totalNutrition };
          })
        );
      }
      
      // Save current data
      await saveCurrentData();
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add food to meal
  const handleAddFood = async (food: FoodItem, nutrition: any, amount: number, unit: string) => {
    if (!activeMealId) return;

    try {
      const foodEntry: FoodEntry = {
        id: Date.now().toString(),
        name: food.name,
        brand: food.brand,
        amount,
        unit,
        nutrition,
        addedAt: new Date()
      };

      // Log to database
      await foodApiService.logFood(food.id, amount, unit, activeMealId);

      // Update local state
      setMeals(prevMeals => 
        prevMeals.map(meal => {
          if (meal.id === activeMealId) {
            const newFoods = [...meal.foods, foodEntry];
            const totalNutrition = calculateMealNutrition(newFoods);
            console.log('Updated meal nutrition for', meal.name, ':', totalNutrition);
            return { ...meal, foods: newFoods, totalNutrition };
          }
          return meal;
        })
      );

      // Save current data
      await saveCurrentData();
      
      Alert.alert('Success', `${food.name} added to ${meals.find(m => m.id === activeMealId)?.name}!`);
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Failed to add food. Please try again.');
    }
  };

  // Edit food in meal
  const handleEditFood = (mealId: string, foodId: string) => {
    const meal = meals.find(m => m.id === mealId);
    const food = meal?.foods.find(f => f.id === foodId);
    
    if (food) {
      Alert.alert('Edit Food', 'Edit functionality coming soon!');
    }
  };

  // Delete food from meal
  const handleDeleteFood = async (mealId: string, foodId: string) => {
    try {
      // Update local state
      setMeals(prevMeals => 
        prevMeals.map(meal => {
          if (meal.id === mealId) {
            const newFoods = meal.foods.filter(f => f.id !== foodId);
            const totalNutrition = calculateMealNutrition(newFoods);
            return { ...meal, foods: newFoods, totalNutrition };
          }
          return meal;
        })
      );

      // Save current data
      await saveCurrentData();
      
      Alert.alert('Success', 'Food removed successfully!');
    } catch (error) {
      console.error('Error deleting food:', error);
      Alert.alert('Error', 'Failed to delete food. Please try again.');
    }
  };

  // View meal details
  const handleViewMeal = (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (meal) {
      Alert.alert(
        meal.name,
        `Total: ${Math.round(meal.totalNutrition.calories)} calories\nProtein: ${Math.round(meal.totalNutrition.protein)}g\nCarbs: ${Math.round(meal.totalNutrition.carbs)}g\nFat: ${Math.round(meal.totalNutrition.fat)}g`
      );
    }
  };

  // Open food search for specific meal
  const handleOpenFoodSearch = (mealId: string) => {
    setActiveMealId(mealId);
    setShowFoodSearch(true);
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format date for storage key
  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Load data for specific date
  const loadDataForDate = async (date: Date) => {
    const dateKey = formatDateKey(date);
    setIsLoadingHistorical(true);
    
    try {
      // Check if we already have data for this date
      if (historicalData[dateKey] && historicalData[dateKey].length > 0) {
        setMeals(historicalData[dateKey]);
        setIsLoadingHistorical(false);
        return;
      }

      // Load from storage or API
      const storedData = await DataStorage.getData(`food_logs_${dateKey}`);
      if (storedData && storedData.length > 0) {
        setMeals(storedData);
        setHistoricalData(prev => ({
          ...prev,
          [dateKey]: storedData
        }));
      } else {
        // If no data for this date, initialize empty meals
        const emptyMeals = initializeMeals();
        setMeals(emptyMeals);
        setHistoricalData(prev => ({
          ...prev,
          [dateKey]: emptyMeals
        }));
      }
    } catch (error) {
      console.error('Error loading data for date:', error);
      // Fallback to empty meals
      const emptyMeals = initializeMeals();
      setMeals(emptyMeals);
    } finally {
      setIsLoadingHistorical(false);
    }
  };

  // Navigate to previous day
  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  // Navigate to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Check if selected date is today
  const isToday = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  // Save current data before changing dates
  const saveCurrentData = async () => {
    const dateKey = formatDateKey(selectedDate);
    try {
      await DataStorage.saveData(`food_logs_${dateKey}`, meals);
      setHistoricalData(prev => ({
        ...prev,
        [dateKey]: meals
      }));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Calculate daily totals
  const getDailyTotals = () => {
    const result = meals.reduce((total, meal) => ({
      calories: total.calories + meal.totalNutrition.calories,
      protein: total.protein + meal.totalNutrition.protein,
      carbs: total.carbs + meal.totalNutrition.carbs,
      fat: total.fat + meal.totalNutrition.fat,
      fiber: total.fiber + meal.totalNutrition.fiber,
      sugar: total.sugar + meal.totalNutrition.sugar,
      sodium: total.sodium + meal.totalNutrition.sodium,
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    });
    
    console.log('Daily totals:', result, 'for', meals.length, 'meals');
    return result;
  };

  // Calculate meal nutrition from food entries
  const calculateMealNutrition = (foods: FoodEntry[]) => {
    const result = foods.reduce((total, food) => ({
      calories: total.calories + food.nutrition.calories,
      protein: total.protein + food.nutrition.protein,
      carbs: total.carbs + food.nutrition.carbs,
      fat: total.fat + food.nutrition.fat,
      fiber: total.fiber + (food.nutrition.fiber || 0),
      sugar: total.sugar + (food.nutrition.sugar || 0),
      sodium: total.sodium + (food.nutrition.sodium || 0),
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    });
    
    console.log('Calculated meal nutrition:', result, 'for', foods.length, 'foods');
    return result;
  };

  const dailyTotals = getDailyTotals();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#1F2937', '#111827']} style={styles.loadingGradient}>
          <View style={styles.loadingContent}>
            <Ionicons name="restaurant" size={48} color="#10B981" />
            <Text style={styles.loadingText}>Loading your nutrition data...</Text>
          </View>
        </LinearGradient>
    </View>
  );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1F2937', '#111827']} style={styles.gradient}>
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10B981"
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Food Tracker</Text>
            <Text style={styles.headerSubtitle}>Track your daily nutrition</Text>
        </View>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#10B981" />
          </TouchableOpacity>
      </View>

        {/* Date Display with Navigation */}
        <View style={styles.dateContainer}>
          <TouchableOpacity style={styles.dateNavButton} onPress={goToPreviousDay}>
            <Ionicons name="chevron-back" size={20} color="#10B981" />
          </TouchableOpacity>
          
              <TouchableOpacity 
            style={styles.dateDisplay} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            {!isToday() && (
              <Ionicons name="calendar" size={16} color="#10B981" style={styles.dateIcon} />
            )}
              </TouchableOpacity>
          
          <TouchableOpacity style={styles.dateNavButton} onPress={goToNextDay}>
            <Ionicons name="chevron-forward" size={20} color="#10B981" />
            </TouchableOpacity>
          </View>

        {/* Today Button */}
        {!isToday() && (
          <View style={styles.todayButtonContainer}>
            <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
              <Ionicons name="today" size={16} color="#FFFFFF" />
              <Text style={styles.todayButtonText}>Go to Today</Text>
              </TouchableOpacity>
            </View>
        )}

        {/* Daily Summary Card */}
        <View style={styles.dailySummaryCard}>
          <Text style={styles.dailySummaryTitle}>
            {isToday() ? "Today's Nutrition" : `${formatDate(selectedDate)} Nutrition`}
          </Text>
          <View style={styles.dailyStats}>
            <View style={styles.dailyStatItem}>
              <Text style={styles.dailyStatValue}>{Math.round(dailyTotals.calories)}</Text>
              <Text style={styles.dailyStatLabel}>Calories</Text>
          </View>
            <View style={styles.dailyStatItem}>
              <Text style={styles.dailyStatValue}>{Math.round(dailyTotals.protein)}g</Text>
              <Text style={styles.dailyStatLabel}>Protein</Text>
        </View>
            <View style={styles.dailyStatItem}>
              <Text style={styles.dailyStatValue}>{Math.round(dailyTotals.carbs)}g</Text>
              <Text style={styles.dailyStatLabel}>Carbs</Text>
            </View>
            <View style={styles.dailyStatItem}>
              <Text style={styles.dailyStatValue}>{Math.round(dailyTotals.fat)}g</Text>
              <Text style={styles.dailyStatLabel}>Fat</Text>
            </View>
          </View>
        </View>

        {/* Meals Interface */}
        <View style={styles.content}>
          <EnhancedMealInterface
            meals={meals}
            onAddFood={handleOpenFoodSearch}
            onEditFood={handleEditFood}
            onDeleteFood={handleDeleteFood}
            onViewMeal={handleViewMeal}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </View>

          {/* Water Tracker */}
          <WaterTracker selectedDate={selectedDate} />

          {/* Cookbook Shortcut */}
          <View style={styles.cookbookShortcut}>
            <TouchableOpacity 
              style={styles.cookbookButton}
              onPress={() => onNavigate?.('cookbook')}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.cookbookButtonGradient}
              >
                <View style={styles.cookbookButtonContent}>
                  <View style={styles.cookbookIcon}>
                    <Ionicons name="book" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.cookbookTextContainer}>
                    <Text style={styles.cookbookTitle}>Recipes & Cookbooks</Text>
                    <Text style={styles.cookbookSubtitle}>Add your own recipes or try our starter recipes</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

      {/* Food Search Modal */}
        <EnhancedFoodSearch
        visible={showFoodSearch}
        onClose={() => {
                  setShowFoodSearch(false);
            setActiveMealId(null);
          }}
          onAddFood={handleAddFood}
          mealType={activeMealId as any || 'breakfast'}
        />

        {/* Monthly Calendar Modal */}
        <MonthlyCalendar
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          selectedDate={selectedDate}
          onDateSelect={(date) => setSelectedDate(date)}
          historicalData={historicalData}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50, // Increased from 16 to 50 to avoid Android status bar
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  dateButton: {
    padding: 8,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  dateContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  dailySummaryCard: {
    backgroundColor: '#374151',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  dailySummaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  dailyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dailyStatItem: {
    alignItems: 'center',
  },
  dailyStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
  },
  dailyStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  // Date Navigation Styles
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  dateNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  dateDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    marginHorizontal: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dateIcon: {
    marginLeft: 8,
  },
  todayButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  cookbookShortcut: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cookbookButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cookbookButtonGradient: {
    padding: 16,
  },
  cookbookButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cookbookIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cookbookTextContainer: {
    flex: 1,
  },
  cookbookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cookbookSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
});