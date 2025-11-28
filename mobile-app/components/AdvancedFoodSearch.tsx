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
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FOOD_DATABASE, FOOD_CATEGORIES, searchFoods, FoodItem, getPopularFoods } from '../data/foodDatabase';

const { width, height } = Dimensions.get('window');

interface AdvancedFoodSearchProps {
  visible: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodItem, quantity: number, unit: string) => void;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
}

export default function AdvancedFoodSearch({ 
  visible, 
  onClose, 
  onSelectFood, 
  mealType 
}: AdvancedFoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [popularFoods, setPopularFoods] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(height));

  useEffect(() => {
    if (visible) {
      setPopularFoods(getPopularFoods(20));
      setSearchResults([]);
      setSearchQuery('');
      setSelectedCategory('All');
      
      // Animate in
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
      // Animate out
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
    if (searchQuery.trim()) {
      const results = searchFoods(searchQuery, selectedCategory);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedCategory]);

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setQuantity('1');
    setShowQuantityModal(true);
  };

  const handleAddFood = () => {
    if (selectedFood) {
      onSelectFood(selectedFood, parseFloat(quantity) || 1, selectedFood.servingUnit);
      setShowQuantityModal(false);
      setSelectedFood(null);
      setQuantity('1');
      onClose();
    }
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity
      style={styles.foodItem}
      onPress={() => handleFoodSelect(item)}
    >
      <View style={styles.foodItemContent}>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.name}</Text>
          {item.brand && <Text style={styles.foodBrand}>{item.brand}</Text>}
          <Text style={styles.foodCategory}>{item.category}</Text>
        </View>
        <View style={styles.foodMacros}>
          <Text style={styles.macroText}>{item.calories} cal</Text>
          <Text style={styles.macroText}>{item.protein}g protein</Text>
          <Text style={styles.servingText}>{item.commonServing}</Text>
        </View>
        <Ionicons name="add-circle" size={24} color="#10B981" />
      </View>
    </TouchableOpacity>
  );

  const renderCategoryButton = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category && styles.categoryButtonTextActive
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderQuantityModal = () => (
    <Modal
      visible={showQuantityModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowQuantityModal(false)}
    >
      <View style={styles.quantityModalOverlay}>
        <View style={styles.quantityModal}>
          <Text style={styles.quantityModalTitle}>Add {selectedFood?.name}</Text>
          <Text style={styles.quantityModalSubtitle}>
            {selectedFood?.commonServing}
          </Text>
          
          <View style={styles.quantityInputContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="1"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.quantityUnit}>{selectedFood?.servingUnit}</Text>
          </View>

          <View style={styles.quantityMacros}>
            <Text style={styles.quantityMacroTitle}>Nutrition (per {selectedFood?.servingUnit}):</Text>
            <View style={styles.quantityMacroRow}>
              <Text style={styles.quantityMacroText}>Calories: {selectedFood?.calories}</Text>
              <Text style={styles.quantityMacroText}>Protein: {selectedFood?.protein}g</Text>
            </View>
            <View style={styles.quantityMacroRow}>
              <Text style={styles.quantityMacroText}>Carbs: {selectedFood?.carbs}g</Text>
              <Text style={styles.quantityMacroText}>Fat: {selectedFood?.fat}g</Text>
            </View>
          </View>

          <View style={styles.quantityButtons}>
            <TouchableOpacity
              style={styles.quantityCancelButton}
              onPress={() => setShowQuantityModal(false)}
            >
              <Text style={styles.quantityCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quantityAddButton}
              onPress={handleAddFood}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.quantityAddButtonGradient}
              >
                <Text style={styles.quantityAddButtonText}>Add Food</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View 
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Food to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search foods, brands, or categories..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <FlatList
              data={['All', ...FOOD_CATEGORIES]}
              renderItem={({ item }) => renderCategoryButton(item)}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          {/* Results */}
          <View style={styles.resultsContainer}>
            {searchQuery.trim() ? (
              <FlatList
                data={searchResults}
                renderItem={renderFoodItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="search" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyStateTitle}>No foods found</Text>
                    <Text style={styles.emptyStateSubtitle}>
                      Try searching for a different term or browse categories
                    </Text>
                  </View>
                }
              />
            ) : (
              <View>
                <Text style={styles.sectionTitle}>Popular Foods</Text>
                <FlatList
                  data={popularFoods}
                  renderItem={renderFoodItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}
          </View>

          {renderQuantityModal()}
        </Animated.View>
      </Animated.View>
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
    backgroundColor: '#FFFFFF',
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#10B981',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  foodItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  foodItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  foodBrand: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  foodCategory: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  foodMacros: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  macroText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  servingText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  quantityModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    width: width - 64,
  },
  quantityModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  quantityModalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginRight: 12,
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  quantityUnit: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 12,
  },
  quantityMacros: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  quantityMacroTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  quantityMacroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  quantityMacroText: {
    fontSize: 14,
    color: '#6B7280',
  },
  quantityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  quantityCancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  quantityAddButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityAddButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  quantityAddButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});


















