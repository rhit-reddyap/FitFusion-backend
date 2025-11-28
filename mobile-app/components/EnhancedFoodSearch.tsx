import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Dimensions,
  Alert,
  Animated,
  Easing,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { foodApiService, FoodItem } from '../services/foodApiService';
import { UnitConverter, UNITS, FoodServing, NutritionCalculator } from '../utils/unitConversions';
import BarcodeScanner from './BarcodeScanner';

const { width, height } = Dimensions.get('window');

interface EnhancedFoodSearchProps {
  visible: boolean;
  onClose: () => void;
  onAddFood: (food: FoodItem, nutrition: any, amount: number, unit: string) => void;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
}

export default function EnhancedFoodSearch({ 
  visible, 
  onClose, 
  onAddFood, 
  mealType 
}: EnhancedFoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState('g');
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showServingPicker, setShowServingPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedNutrition, setCalculatedNutrition] = useState<any>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(height));
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      const timeout = setTimeout(() => {
        searchFoods(searchQuery);
      }, 500);
      
      setSearchTimeout(timeout);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    if (selectedFood && amount) {
      calculateNutrition();
    }
  }, [selectedFood, amount, selectedUnit]);

  const searchFoods = async (query: string) => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      const result = await foodApiService.searchFoods(query, 1, 20);
      console.log('Search results for', query, ':', result.foods);
      setSearchResults(result.foods);
    } catch (error) {
      console.error('Error searching foods:', error);
      Alert.alert('Error', 'Failed to search foods. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNutrition = () => {
    if (!selectedFood || !amount) return;

    try {
      console.log('Calculating nutrition for:', selectedFood.name, 'Amount:', amount, 'Unit:', selectedUnit);
      console.log('Food data:', selectedFood);
      
      const nutrition = NutritionCalculator.calculateNutrition(
        selectedFood,
        parseFloat(amount) || 0,
        selectedUnit
      );
      
      console.log('Calculated nutrition:', nutrition);
      setCalculatedNutrition(nutrition);
    } catch (error) {
      console.error('Error calculating nutrition:', error);
    }
  };

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setAmount('1');
    setSelectedUnit('g');
    setShowServingPicker(true);
  };

  const handleServingSelect = (serving: FoodServing) => {
    setAmount(serving.amount.toString());
    setSelectedUnit(serving.unit);
    setShowServingPicker(false);
  };

  const handleAddFood = () => {
    if (!selectedFood || !calculatedNutrition) {
      Alert.alert('Error', 'Please select a food and enter an amount');
      return;
    }

    onAddFood(selectedFood, calculatedNutrition, parseFloat(amount), selectedUnit);
    handleClose();
  };

  const handleBarcodeFoodFound = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchQuery(food.name);
    setShowBarcodeScanner(false);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFood(null);
    setAmount('1');
    setSelectedUnit('g');
    setCalculatedNutrition(null);
    onClose();
  };

  const getCompatibleUnits = () => {
    if (!selectedFood) return UNITS;
    return UnitConverter.getCompatibleUnits(selectedUnit);
  };

  const getCommonServings = () => {
    if (!selectedFood) return [];
    return UnitConverter.getCommonServings(selectedFood.name);
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity
      style={styles.foodItem}
      onPress={() => handleFoodSelect(item)}
    >
      <View style={styles.foodItemContent}>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.brand && (
            <Text style={styles.foodBrand} numberOfLines={1}>
              {item.brand}
            </Text>
          )}
          <View style={styles.nutritionPreview}>
            <Text style={styles.nutritionText}>
              {Math.round(item.calories || 0)} cal • {Math.round(item.protein || 0)}g protein • {Math.round(item.carbs || 0)}g carbs
            </Text>
          </View>
        </View>
        <View style={styles.foodActions}>
          <Ionicons name="add-circle" size={24} color="#10B981" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderUnitItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.unitItem,
        selectedUnit === item.id && styles.selectedUnitItem
      ]}
      onPress={() => {
        setSelectedUnit(item.id);
        setShowUnitPicker(false);
      }}
    >
      <Text style={[
        styles.unitText,
        selectedUnit === item.id && styles.selectedUnitText
      ]}>
        {item.symbol}
      </Text>
      <Text style={[
        styles.unitName,
        selectedUnit === item.id && styles.selectedUnitName
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderServingItem = ({ item }: { item: FoodServing }) => (
    <TouchableOpacity
      style={styles.servingItem}
      onPress={() => handleServingSelect(item)}
    >
      <View style={styles.servingContent}>
        <Text style={styles.servingName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.servingDescription}>{item.description}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={['#1F2937', '#111827']}
            style={styles.gradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Add Food to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for food..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                />
                {isLoading && (
                  <ActivityIndicator size="small" color="#10B981" style={styles.loadingIndicator} />
                )}
              </View>
              <TouchableOpacity
                style={styles.barcodeButton}
                onPress={() => setShowBarcodeScanner(true)}
              >
                <Ionicons name="barcode" size={24} color="#10B981" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {!selectedFood ? (
                // Search Results
                <View style={styles.searchResults}>
                  {searchResults.length > 0 ? (
                    <FlatList
                      data={searchResults}
                      renderItem={renderFoodItem}
                      keyExtractor={(item) => item.id}
                      showsVerticalScrollIndicator={false}
                      style={styles.foodList}
                    />
                  ) : searchQuery.length > 2 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="search" size={48} color="#6B7280" />
                      <Text style={styles.emptyStateText}>No foods found</Text>
                      <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
                    </View>
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons name="restaurant" size={48} color="#6B7280" />
                      <Text style={styles.emptyStateText}>Search for foods</Text>
                      <Text style={styles.emptyStateSubtext}>Type to find what you're looking for</Text>
                    </View>
                  )}
                </View>
              ) : (
                // Food Details and Amount Selection
                <View style={styles.foodDetails}>
                  {/* Selected Food Info */}
                  <View style={styles.selectedFoodCard}>
                    <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
                    {selectedFood.brand && (
                      <Text style={styles.selectedFoodBrand}>{selectedFood.brand}</Text>
                    )}
                    <View style={styles.nutritionGrid}>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{selectedFood.calories}</Text>
                        <Text style={styles.nutritionLabel}>Calories</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{selectedFood.protein}g</Text>
                        <Text style={styles.nutritionLabel}>Protein</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{selectedFood.carbs}g</Text>
                        <Text style={styles.nutritionLabel}>Carbs</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{selectedFood.fat}g</Text>
                        <Text style={styles.nutritionLabel}>Fat</Text>
                      </View>
                    </View>
                  </View>

                  {/* Common Servings */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Add</Text>
                    <FlatList
                      data={getCommonServings()}
                      renderItem={renderServingItem}
                      keyExtractor={(item) => item.id}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.servingsList}
                    />
                  </View>

                  {/* Custom Amount */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Custom Amount</Text>
                    <View style={styles.amountContainer}>
                      <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholder="1"
                        placeholderTextColor="#9CA3AF"
                      />
                      <TouchableOpacity
                        style={styles.unitButton}
                        onPress={() => setShowUnitPicker(true)}
                      >
                        <Text style={styles.unitButtonText}>
                          {UnitConverter.formatUnit(selectedUnit, parseFloat(amount) || 1)}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Calculated Nutrition */}
                  {calculatedNutrition && (
                    <View style={styles.calculatedNutrition}>
                      <Text style={styles.calculatedTitle}>Nutrition for {amount} {UnitConverter.formatUnit(selectedUnit, parseFloat(amount) || 1)}</Text>
                      <View style={styles.calculatedGrid}>
                        <View style={styles.calculatedItem}>
                          <Text style={styles.calculatedValue}>{calculatedNutrition.calories}</Text>
                          <Text style={styles.calculatedLabel}>Calories</Text>
                        </View>
                        <View style={styles.calculatedItem}>
                          <Text style={styles.calculatedValue}>{calculatedNutrition.protein}g</Text>
                          <Text style={styles.calculatedLabel}>Protein</Text>
                        </View>
                        <View style={styles.calculatedItem}>
                          <Text style={styles.calculatedValue}>{calculatedNutrition.carbs}g</Text>
                          <Text style={styles.calculatedLabel}>Carbs</Text>
                        </View>
                        <View style={styles.calculatedItem}>
                          <Text style={styles.calculatedValue}>{calculatedNutrition.fat}g</Text>
                          <Text style={styles.calculatedLabel}>Fat</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Add Button */}
                  <TouchableOpacity
                    style={[styles.addButton, !calculatedNutrition && styles.addButtonDisabled]}
                    onPress={handleAddFood}
                    disabled={!calculatedNutrition}
                  >
                    <LinearGradient
                      colors={calculatedNutrition ? ['#10B981', '#059669'] : ['#6B7280', '#4B5563']}
                      style={styles.addButtonGradient}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                      <Text style={styles.addButtonText}>Add to {mealType}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Unit Picker Modal */}
            <Modal
              visible={showUnitPicker}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowUnitPicker(false)}
            >
              <View style={styles.unitPickerOverlay}>
                <View style={styles.unitPickerContainer}>
                  <View style={styles.unitPickerHeader}>
                    <Text style={styles.unitPickerTitle}>Select Unit</Text>
                    <TouchableOpacity onPress={() => setShowUnitPicker(false)}>
                      <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={getCompatibleUnits()}
                    renderItem={renderUnitItem}
                    keyExtractor={(item) => item.id}
                    style={styles.unitList}
                  />
                </View>
              </View>
            </Modal>
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      {/* Barcode Scanner */}
      <BarcodeScanner
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onFoodFound={handleBarcodeFoodFound}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  loadingIndicator: {
    marginLeft: 12,
  },
  barcodeButton: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  searchResults: {
    flex: 1,
  },
  foodList: {
    flex: 1,
  },
  foodItem: {
    backgroundColor: '#374151',
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
  },
  foodItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  foodInfo: {
    flex: 1,
    marginRight: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  foodBrand: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  nutritionPreview: {
    flexDirection: 'row',
  },
  nutritionText: {
    fontSize: 12,
    color: '#10B981',
  },
  foodActions: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  foodDetails: {
    padding: 20,
  },
  selectedFoodCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  selectedFoodName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedFoodBrand: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  servingsList: {
    marginTop: 8,
  },
  servingItem: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  servingContent: {
    flex: 1,
  },
  servingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  servingDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  unitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 8,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },
  calculatedNutrition: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  calculatedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  calculatedGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calculatedItem: {
    alignItems: 'center',
  },
  calculatedValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },
  calculatedLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  addButton: {
    marginBottom: 20,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  unitPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  unitPickerContainer: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.6,
  },
  unitPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  unitPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  unitList: {
    maxHeight: height * 0.4,
  },
  unitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  selectedUnitItem: {
    backgroundColor: '#10B981',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 12,
    minWidth: 40,
  },
  selectedUnitText: {
    color: '#FFFFFF',
  },
  unitName: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  selectedUnitName: {
    color: '#FFFFFF',
  },
});