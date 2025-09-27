import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  Animated,
  Easing,
  TextInput,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface AdvancedMealPlannerProps {
  onBack: () => void;
}

export default function AdvancedMealPlanner({ onBack }: AdvancedMealPlannerProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));
  const [pulseValue] = useState(new Animated.Value(1));

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDay = new Date().getDay();
  const adjustedCurrentDay = currentDay === 0 ? 6 : currentDay - 1;

  const mealPlans = {
    0: { // Monday
      breakfast: {
        name: 'Protein Power Bowl',
        calories: 420,
        protein: 28,
        carbs: 35,
        fat: 18,
        prepTime: '15 min',
        difficulty: 'Easy',
        ingredients: ['Greek yogurt', 'Berries', 'Granola', 'Honey'],
        instructions: 'Mix yogurt with berries, top with granola and honey'
      },
      lunch: {
        name: 'Quinoa Buddha Bowl',
        calories: 480,
        protein: 22,
        carbs: 45,
        fat: 20,
        prepTime: '20 min',
        difficulty: 'Medium',
        ingredients: ['Quinoa', 'Chickpeas', 'Avocado', 'Tahini'],
        instructions: 'Cook quinoa, add roasted chickpeas and avocado, drizzle with tahini'
      },
      dinner: {
        name: 'Salmon & Sweet Potato',
        calories: 520,
        protein: 35,
        carbs: 40,
        fat: 25,
        prepTime: '30 min',
        difficulty: 'Medium',
        ingredients: ['Salmon fillet', 'Sweet potato', 'Broccoli', 'Olive oil'],
        instructions: 'Bake salmon and sweet potato, steam broccoli, season with herbs'
      },
      snacks: [
        { name: 'Apple & Almonds', calories: 180, protein: 6, carbs: 20, fat: 10 },
        { name: 'Protein Shake', calories: 120, protein: 25, carbs: 5, fat: 2 }
      ]
    },
    1: { // Tuesday
      breakfast: {
        name: 'Avocado Toast Deluxe',
        calories: 380,
        protein: 18,
        carbs: 32,
        fat: 22,
        prepTime: '10 min',
        difficulty: 'Easy',
        ingredients: ['Whole grain bread', 'Avocado', 'Egg', 'Everything seasoning'],
        instructions: 'Toast bread, mash avocado, top with fried egg and seasoning'
      },
      lunch: {
        name: 'Mediterranean Wrap',
        calories: 450,
        protein: 20,
        carbs: 38,
        fat: 24,
        prepTime: '15 min',
        difficulty: 'Easy',
        ingredients: ['Tortilla', 'Hummus', 'Cucumber', 'Tomato', 'Feta'],
        instructions: 'Spread hummus on tortilla, add vegetables and feta, wrap tightly'
      },
      dinner: {
        name: 'Chicken Stir Fry',
        calories: 480,
        protein: 38,
        carbs: 35,
        fat: 20,
        prepTime: '25 min',
        difficulty: 'Medium',
        ingredients: ['Chicken breast', 'Bell peppers', 'Broccoli', 'Soy sauce'],
        instructions: 'Stir fry chicken and vegetables, add sauce, serve over rice'
      },
      snacks: [
        { name: 'Greek Yogurt', calories: 100, protein: 15, carbs: 8, fat: 2 },
        { name: 'Mixed Nuts', calories: 160, protein: 6, carbs: 8, fat: 14 }
      ]
    }
  };

  const aiRecommendations = [
    {
      id: 1,
      title: 'Meal Prep Sunday',
      description: 'Prepare 3 meals in advance to save time during the week',
      action: 'Start Prep',
      icon: 'calendar',
      color: ['#10B981', '#059669']
    },
    {
      id: 2,
      title: 'Macro Balance',
      description: 'Your protein intake is 15% below target. Add more lean proteins.',
      action: 'Adjust Plan',
      icon: 'nutrition',
      color: ['#F59E0B', '#D97706']
    },
    {
      id: 3,
      title: 'Hydration Boost',
      description: 'Add more water-rich foods like cucumber and watermelon',
      action: 'View Options',
      icon: 'water',
      color: ['#06B6D4', '#0891B2']
    }
  ];

  const shoppingList = [
    { id: 1, name: 'Greek Yogurt', category: 'Dairy', quantity: '2 cups', checked: false },
    { id: 2, name: 'Salmon Fillet', category: 'Protein', quantity: '1 lb', checked: false },
    { id: 3, name: 'Quinoa', category: 'Grains', quantity: '1 bag', checked: true },
    { id: 4, name: 'Avocado', category: 'Produce', quantity: '4 pieces', checked: false },
    { id: 5, name: 'Chicken Breast', category: 'Protein', quantity: '2 lbs', checked: false },
    { id: 6, name: 'Sweet Potato', category: 'Produce', quantity: '3 pieces', checked: true }
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      )
    ]).start();
  }, []);

  const getDayMealPlan = (dayIndex) => {
    return mealPlans[dayIndex] || mealPlans[0];
  };

  const renderDaySelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.daySelector}
      contentContainerStyle={styles.daySelectorContent}
    >
      {days.map((day, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dayButton,
            selectedDay === index && styles.activeDayButton,
            index === adjustedCurrentDay && styles.currentDayButton
          ]}
          onPress={() => setSelectedDay(index)}
        >
          <LinearGradient
            colors={selectedDay === index ? ['#10B981', '#059669'] : 
                   index === adjustedCurrentDay ? ['#F59E0B', '#D97706'] : 
                   ['#1F2937', '#111111']}
            style={styles.dayGradient}
          >
            <Text style={[
              styles.dayText,
              selectedDay === index && styles.activeDayText,
              index === adjustedCurrentDay && styles.currentDayText
            ]}>
              {day}
            </Text>
            {index === adjustedCurrentDay && (
              <View style={styles.currentDayDot} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderMealCard = (mealType, meal) => (
    <Animated.View
      key={mealType}
      style={[
        styles.mealCard,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient colors={['#111111', '#1F2937']} style={styles.mealGradient}>
        <View style={styles.mealHeader}>
          <View style={styles.mealInfo}>
            <Text style={styles.mealType}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
            <Text style={styles.mealName}>{meal.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.mealActionButton}
            onPress={() => {
              setSelectedMeal(meal);
              setShowMealModal(true);
            }}
          >
            <Ionicons name="chevron-forward" size={20} color="#10B981" />
          </TouchableOpacity>
        </View>

        <View style={styles.mealStats}>
          <View style={styles.mealStat}>
            <Text style={styles.mealStatValue}>{meal.calories}</Text>
            <Text style={styles.mealStatLabel}>Calories</Text>
          </View>
          <View style={styles.mealStat}>
            <Text style={styles.mealStatValue}>{meal.protein}g</Text>
            <Text style={styles.mealStatLabel}>Protein</Text>
          </View>
          <View style={styles.mealStat}>
            <Text style={styles.mealStatValue}>{meal.carbs}g</Text>
            <Text style={styles.mealStatLabel}>Carbs</Text>
          </View>
          <View style={styles.mealStat}>
            <Text style={styles.mealStatValue}>{meal.fat}g</Text>
            <Text style={styles.mealStatLabel}>Fat</Text>
          </View>
        </View>

        <View style={styles.mealMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={16} color="#9CA3AF" />
            <Text style={styles.metaText}>{meal.prepTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="trending-up" size={16} color="#9CA3AF" />
            <Text style={styles.metaText}>{meal.difficulty}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderSnackCard = (snack, index) => (
    <View key={index} style={styles.snackCard}>
      <View style={styles.snackInfo}>
        <Text style={styles.snackName}>{snack.name}</Text>
        <Text style={styles.snackCalories}>{snack.calories} cal</Text>
      </View>
      <View style={styles.snackMacros}>
        <Text style={styles.snackMacro}>{snack.protein}g protein</Text>
        <Text style={styles.snackMacro}>{snack.carbs}g carbs</Text>
        <Text style={styles.snackMacro}>{snack.fat}g fat</Text>
      </View>
    </View>
  );

  const renderAIRecommendation = (rec) => (
    <Animated.View
      key={rec.id}
      style={[
        styles.recommendationCard,
        {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [width, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient colors={rec.color} style={styles.recommendationGradient}>
        <View style={styles.recommendationHeader}>
          <Ionicons name={rec.icon as any} size={24} color="white" />
          <Text style={styles.recommendationTitle}>{rec.title}</Text>
        </View>
        <Text style={styles.recommendationDescription}>{rec.description}</Text>
        <TouchableOpacity style={styles.recommendationAction}>
          <Text style={styles.recommendationActionText}>{rec.action}</Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );

  const renderShoppingItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.shoppingItem, item.checked && styles.checkedItem]}
    >
      <View style={styles.shoppingItemLeft}>
        <View style={[styles.checkbox, item.checked && styles.checkedCheckbox]}>
          {item.checked && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
        <View style={styles.shoppingItemInfo}>
          <Text style={[styles.shoppingItemName, item.checked && styles.checkedText]}>
            {item.name}
          </Text>
          <Text style={styles.shoppingItemCategory}>{item.category}</Text>
        </View>
      </View>
      <Text style={[styles.shoppingItemQuantity, item.checked && styles.checkedText]}>
        {item.quantity}
      </Text>
    </TouchableOpacity>
  );

  const currentMealPlan = getDayMealPlan(selectedDay);
  const totalCalories = currentMealPlan.breakfast.calories + 
                       currentMealPlan.lunch.calories + 
                       currentMealPlan.dinner.calories + 
                       currentMealPlan.snacks.reduce((sum, snack) => sum + snack.calories, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.pageTitle}>Meal Planner</Text>
          <Text style={styles.pageSubtitle}>AI-powered nutrition planning</Text>
        </View>
        <TouchableOpacity style={styles.generateButton}>
          <Ionicons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Day Selector */}
        {renderDaySelector()}

        {/* Daily Summary */}
        <Animated.View
          style={[
            styles.dailySummary,
            {
              opacity: animatedValue,
              transform: [
                {
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient colors={['#111111', '#1F2937']} style={styles.summaryGradient}>
            <Text style={styles.summaryTitle}>Today's Nutrition Plan</Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>{totalCalories}</Text>
                <Text style={styles.summaryLabel}>Total Calories</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>4</Text>
                <Text style={styles.summaryLabel}>Meals</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>85%</Text>
                <Text style={styles.summaryLabel}>Goal Hit</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* AI Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {aiRecommendations.map(renderAIRecommendation)}
          </ScrollView>
        </View>

        {/* Meals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meals</Text>
          <View style={styles.mealsContainer}>
            {renderMealCard('breakfast', currentMealPlan.breakfast)}
            {renderMealCard('lunch', currentMealPlan.lunch)}
            {renderMealCard('dinner', currentMealPlan.dinner)}
          </View>
        </View>

        {/* Snacks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Snacks</Text>
          <View style={styles.snacksContainer}>
            {currentMealPlan.snacks.map(renderSnackCard)}
          </View>
        </View>

        {/* Shopping List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shopping List</Text>
          <View style={styles.shoppingContainer}>
            {shoppingList.map(renderShoppingItem)}
          </View>
        </View>
      </ScrollView>

      {/* Meal Detail Modal */}
      <Modal
        visible={showMealModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMealModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedMeal?.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowMealModal(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedMeal && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.modalStats}>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatValue}>{selectedMeal.calories}</Text>
                    <Text style={styles.modalStatLabel}>Calories</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatValue}>{selectedMeal.protein}g</Text>
                    <Text style={styles.modalStatLabel}>Protein</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatValue}>{selectedMeal.carbs}g</Text>
                    <Text style={styles.modalStatLabel}>Carbs</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatValue}>{selectedMeal.fat}g</Text>
                    <Text style={styles.modalStatLabel}>Fat</Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Ingredients</Text>
                  {selectedMeal.ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.ingredientText}>{ingredient}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Instructions</Text>
                  <Text style={styles.instructionsText}>{selectedMeal.instructions}</Text>
                </View>

                <TouchableOpacity style={styles.cookButton}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.cookButtonGradient}>
                    <Ionicons name="restaurant" size={20} color="white" />
                    <Text style={styles.cookButtonText}>Start Cooking</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 4,
  },
  generateButton: {
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  daySelector: {
    marginBottom: 24,
  },
  daySelectorContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dayButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  activeDayButton: {
    // Handled by gradient
  },
  currentDayButton: {
    // Handled by gradient
  },
  dayGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeDayText: {
    color: '#FFFFFF',
  },
  currentDayText: {
    color: '#FFFFFF',
  },
  currentDayDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  dailySummary: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 24,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 20,
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  recommendationCard: {
    width: width * 0.8,
    marginLeft: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  recommendationGradient: {
    padding: 20,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 12,
  },
  recommendationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendationActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mealsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  mealCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  mealGradient: {
    padding: 20,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mealActionButton: {
    padding: 8,
  },
  mealStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  mealStat: {
    flex: 1,
    alignItems: 'center',
  },
  mealStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mealStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  mealMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  snacksContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  snackCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  snackInfo: {
    flex: 1,
  },
  snackName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  snackCalories: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  snackMacros: {
    alignItems: 'flex-end',
  },
  snackMacro: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  shoppingContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  shoppingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  checkedItem: {
    backgroundColor: '#10B98120',
    borderColor: '#10B981',
  },
  shoppingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkedCheckbox: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  shoppingItemInfo: {
    flex: 1,
  },
  shoppingItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#10B981',
  },
  shoppingItemCategory: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  shoppingItemQuantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  modalStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  modalStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
  },
  cookButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  cookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  cookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});










