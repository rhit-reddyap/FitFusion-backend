import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  Alert,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NutritionCalculator } from '../utils/unitConversions';

const { width } = Dimensions.get('window');

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

interface EnhancedMealInterfaceProps {
  meals: Meal[];
  onAddFood: (mealId: string) => void;
  onEditFood: (mealId: string, foodId: string) => void;
  onDeleteFood: (mealId: string, foodId: string) => void;
  onViewMeal: (mealId: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function EnhancedMealInterface({
  meals,
  onAddFood,
  onEditFood,
  onDeleteFood,
  onViewMeal,
  refreshing = false,
  onRefresh
}: EnhancedMealInterfaceProps) {
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [animationValues] = useState(new Map<string, Animated.Value>());

  useEffect(() => {
    // Initialize animation values for each meal
    meals.forEach(meal => {
      if (!animationValues.has(meal.id)) {
        animationValues.set(meal.id, new Animated.Value(0));
      }
    });
  }, [meals]);

  const toggleMeal = (mealId: string) => {
    const isExpanded = expandedMeal === mealId;
    setExpandedMeal(isExpanded ? null : mealId);
    
    const animValue = animationValues.get(mealId);
    if (animValue) {
      Animated.timing(animValue, {
        toValue: isExpanded ? 0 : 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  };

  const calculateMealNutrition = (foods: FoodEntry[]) => {
    return NutritionCalculator.calculateMealNutrition(foods);
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getMealProgress = (meal: Meal) => {
    // This would be based on user's daily goals
    const dailyCalories = 2000; // Example daily goal
    const progress = Math.min((meal.totalNutrition.calories / dailyCalories) * 100, 100);
    return progress;
  };

  const renderFoodItem = (meal: Meal, food: FoodEntry) => {
    const handleEdit = () => onEditFood(meal.id, food.id);
    const handleDelete = () => {
      Alert.alert(
        'Delete Food',
        `Remove ${food.name} from ${meal.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDeleteFood(meal.id, food.id) }
        ]
      );
    };

    return (
      <View key={food.id} style={styles.foodItem}>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName} numberOfLines={1}>
            {food.name}
          </Text>
          {food.brand && (
            <Text style={styles.foodBrand} numberOfLines={1}>
              {food.brand}
            </Text>
          )}
          <Text style={styles.foodAmount}>
            {food.amount} {food.unit}
          </Text>
        </View>
        
        <View style={styles.foodNutrition}>
          <Text style={styles.foodCalories}>
            {Math.round(food.nutrition.calories)} cal
          </Text>
          <View style={styles.foodMacros}>
            <Text style={styles.macroText}>
              P: {Math.round(food.nutrition.protein)}g
            </Text>
            <Text style={styles.macroText}>
              C: {Math.round(food.nutrition.carbs)}g
            </Text>
            <Text style={styles.macroText}>
              F: {Math.round(food.nutrition.fat)}g
            </Text>
          </View>
        </View>

        <View style={styles.foodActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEdit}
          >
            <Ionicons name="create" size={16} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMeal = (meal: Meal) => {
    const isExpanded = expandedMeal === meal.id;
    const animValue = animationValues.get(meal.id) || new Animated.Value(0);
    const progress = getMealProgress(meal);

    const rotateInterpolate = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    const opacityInterpolate = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <View key={meal.id} style={styles.mealCard}>
        <TouchableOpacity
          style={styles.mealHeader}
          onPress={() => toggleMeal(meal.id)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={meal.color}
            style={styles.mealGradient}
          >
            <View style={styles.mealHeaderContent}>
              <View style={styles.mealInfo}>
                <View style={styles.mealTitleRow}>
                  <Ionicons name={meal.icon as any} size={24} color="#FFFFFF" />
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                </View>
                
                <View style={styles.mealStats}>
                  <View style={styles.mealNutrition}>
                    <Text style={styles.mealCalories}>
                      {Math.round(meal.totalNutrition.calories)} cal
                    </Text>
                    <Text style={styles.mealMacros}>
                      P: {Math.round(meal.totalNutrition.protein)}g • 
                      C: {Math.round(meal.totalNutrition.carbs)}g • 
                      F: {Math.round(meal.totalNutrition.fat)}g
                    </Text>
                  </View>
                  
                  <View style={styles.mealProgress}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${progress}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.round(progress)}% of daily goal
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.mealActions}>
                <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                  <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
                </Animated.View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {isExpanded && (
          <Animated.View style={[styles.mealContent, { opacity: opacityInterpolate }]}>
            <View style={styles.mealFoods}>
              {meal.foods.map(food => renderFoodItem(meal, food))}
              
              <TouchableOpacity
                style={styles.addFoodButton}
                onPress={() => onAddFood(meal.id)}
              >
                <Ionicons name="add-circle-outline" size={20} color="#10B981" />
                <Text style={styles.addFoodText}>Add Food</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>
    );
  };

  const renderDailySummary = () => {
    const dailyNutrition = meals.reduce((total, meal) => ({
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

    const dailyCalories = 2000; // Example daily goal
    const caloriesProgress = Math.min((dailyNutrition.calories / dailyCalories) * 100, 100);

    return (
      <View style={styles.dailySummary}>
        <Text style={styles.dailySummaryTitle}>Today's Nutrition</Text>
        
        <View style={styles.dailyStats}>
          <View style={styles.dailyCalories}>
            <Text style={styles.dailyCaloriesValue}>
              {Math.round(dailyNutrition.calories)}
            </Text>
            <Text style={styles.dailyCaloriesLabel}>Calories</Text>
            <View style={styles.dailyProgressBar}>
              <View 
                style={[
                  styles.dailyProgressFill, 
                  { width: `${caloriesProgress}%` }
                ]} 
              />
            </View>
          </View>

          <View style={styles.dailyMacros}>
            <View style={styles.dailyMacroItem}>
              <Text style={styles.dailyMacroValue}>
                {Math.round(dailyNutrition.protein)}g
              </Text>
              <Text style={styles.dailyMacroLabel}>Protein</Text>
            </View>
            <View style={styles.dailyMacroItem}>
              <Text style={styles.dailyMacroValue}>
                {Math.round(dailyNutrition.carbs)}g
              </Text>
              <Text style={styles.dailyMacroLabel}>Carbs</Text>
            </View>
            <View style={styles.dailyMacroItem}>
              <Text style={styles.dailyMacroValue}>
                {Math.round(dailyNutrition.fat)}g
              </Text>
              <Text style={styles.dailyMacroLabel}>Fat</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        ) : undefined
      }
    >
      {renderDailySummary()}
      
      {meals.map(meal => renderMeal(meal))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  dailySummary: {
    backgroundColor: '#1F2937',
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  dailySummaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  dailyStats: {
    alignItems: 'center',
  },
  dailyCalories: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dailyCaloriesValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
  },
  dailyCaloriesLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  dailyProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  dailyProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  dailyMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  dailyMacroItem: {
    alignItems: 'center',
  },
  dailyMacroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dailyMacroLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  mealCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1F2937',
  },
  mealHeader: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  mealGradient: {
    padding: 20,
  },
  mealHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealInfo: {
    flex: 1,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  mealTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  mealStats: {
    gap: 12,
  },
  mealNutrition: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealCalories: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mealMacros: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  mealProgress: {
    gap: 4,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  mealActions: {
    marginLeft: 16,
  },
  mealContent: {
    overflow: 'hidden',
  },
  mealFoods: {
    padding: 16,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  foodInfo: {
    flex: 1,
    marginRight: 12,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  foodBrand: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  foodAmount: {
    fontSize: 12,
    color: '#10B981',
  },
  foodNutrition: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  foodMacros: {
    flexDirection: 'row',
    gap: 8,
  },
  macroText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  foodActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10B981',
    borderStyle: 'dashed',
  },
  addFoodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },
});
