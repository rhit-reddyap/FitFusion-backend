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
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FOOD_DATABASE, FOOD_CATEGORIES, searchFoods, FoodItem, getPopularFoods } from '../data/foodDatabase';
import { foodApiService, FoodItem as ApiFoodItem } from '../services/foodApiService';

const { width, height } = Dimensions.get('window');

interface HybridFoodSearchProps {
  visible: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodItem | ApiFoodItem, quantity: number, unit: string) => void;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
}

export default function HybridFoodSearch({ 
  visible, 
  onClose, 
  onSelectFood, 
  mealType 
}: HybridFoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchResults, setSearchResults] = useState<(FoodItem | ApiFoodItem)[]>([]);
  const [popularFoods, setPopularFoods] = useState<(FoodItem | ApiFoodItem)[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | ApiFoodItem | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(height));
  const [isLoading, setIsLoading] = useState(false);
  const [useApi, setUseApi] = useState(true);
  const [apiError, setApiError] = useState(false);

  const foodApi = foodApiService;

  useEffect(() => {
    if (visible) {
      loadPopularFoods();
      setSearchResults([]);
      setSearchQuery('');
      setSelectedCategory('All');
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.quad),
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
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const loadPopularFoods = async () => {
    try {
      setIsLoading(true);
      setApiError(false);
      
      if (useApi) {
        try {
          const apiFoods = await foodApi.getPopularFoods();
          setPopularFoods(apiFoods);
        } catch (error) {
          console.log('API failed, falling back to local database');
          setApiError(true);
          setUseApi(false);
          const localFoods = getPopularFoods(20);
          setPopularFoods(localFoods);
        }
      } else {
        const localFoods = getPopularFoods(20);
        setPopularFoods(localFoods);
      }
    } catch (error) {
      console.error('Error loading popular foods:', error);
      const localFoods = getPopularFoods(20);
      setPopularFoods(localFoods);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setApiError(false);

    try {
      if (useApi && !apiError) {
        try {
          const apiResults = await foodApi.searchFoods(query, 1, 30);
          const filteredResults = selectedCategory === 'All' 
            ? apiResults.foods 
            : apiResults.foods.filter(food => food.category === selectedCategory);
          setSearchResults(filteredResults);
        } catch (error) {
          console.log('API search failed, falling back to local database');
          setApiError(true);
          setUseApi(false);
          const localResults = searchFoods(query, selectedCategory);
          setSearchResults(localResults);
        }
      } else {
        const localResults = searchFoods(query, selectedCategory);
        setSearchResults(localResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      const localResults = searchFoods(query, selectedCategory);
      setSearchResults(localResults);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFoodSelect = (food: FoodItem | ProcessedFoodItem) => {
    setSelectedFood(food);
    setShowQuantityModal(true);
  };

  const handleAddFood = () => {
    if (selectedFood && quantity) {
      const unit = selectedFood && 'servingSize' in selectedFood ? selectedFood.servingSize : '100g';
      onSelectFood(selectedFood, parseFloat(quantity), unit);
      setShowQuantityModal(false);
      setSelectedFood(null);
      setQuantity('1');
    }
  };

  const renderFoodItem = ({ item }: { item: FoodItem | ProcessedFoodItem }) => (
    <TouchableOpacity
      style={styles.foodItem}
      onPress={() => handleFoodSelect(item)}
    >
      <LinearGradient
        colors={['#1F2937', '#111827']}
        style={styles.foodItemGradient}
      >
        <View style={styles.foodItemContent}>
          <View style={styles.foodItemHeader}>
            <Text style={styles.foodItemName} numberOfLines={2}>
              {item.name}
            </Text>
            {item && 'brand' in item && item.brand && (
              <Text style={styles.foodItemBrand}>{item.brand}</Text>
            )}
          </View>
          
          <View style={styles.foodItemStats}>
            <View style={styles.foodStat}>
              <Ionicons name="flame" size={14} color="#F59E0B" />
              <Text style={styles.foodStatText}>{item.calories} cal</Text>
            </View>
            <View style={styles.foodStat}>
              <Ionicons name="fitness" size={14} color="#10B981" />
              <Text style={styles.foodStatText}>{item.protein}g protein</Text>
            </View>
            <View style={styles.foodStat}>
              <Ionicons name="restaurant" size={14} color="#3B82F6" />
              <Text style={styles.foodStatText}>
                {item && 'servingSize' in item ? item.servingSize : '100g'}
              </Text>
            </View>
          </View>

          <View style={styles.foodItemMacros}>
            <Text style={styles.macroText}>C: {item.carbs}g</Text>
            <Text style={styles.macroText}>F: {item.fat}g</Text>
            {item && 'fiber' in item && item.fiber && (
              <Text style={styles.macroText}>Fiber: {item.fiber}g</Text>
            )}
          </View>
        </View>
        
        <View style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color="#10B981" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCategoryChip = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.categoryChipActive
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === category && styles.categoryChipTextActive
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient colors={['#000000', '#111111']} style={styles.gradient}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Search Foods</Text>
              <View style={styles.headerRight}>
                {apiError && (
                  <TouchableOpacity 
                    style={styles.apiToggle}
                    onPress={() => {
                      setUseApi(!useApi);
                      setApiError(false);
                      loadPopularFoods();
                    }}
                  >
                    <Ionicons 
                      name={useApi ? "cloud-offline" : "cloud"} 
                      size={20} 
                      color={useApi ? "#EF4444" : "#10B981"} 
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search foods..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    handleSearch(text);
                  }}
                  autoFocus
                />
                {isLoading && (
                  <ActivityIndicator size="small" color="#10B981" />
                )}
              </View>
            </View>

            {/* Categories */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
              contentContainerStyle={styles.categoriesContent}
            >
              {FOOD_CATEGORIES.map(renderCategoryChip)}
            </ScrollView>

            {/* Content */}
            <View style={styles.content}>
              {searchQuery.length < 2 ? (
                // Popular Foods
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Popular Foods</Text>
                  <Text style={styles.sectionSubtitle}>
                    Tap any food to add to your {mealType}
                  </Text>
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#10B981" />
                      <Text style={styles.loadingText}>Loading foods...</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={popularFoods}
                      renderItem={renderFoodItem}
                      keyExtractor={(item) => item.id}
                      showsVerticalScrollIndicator={false}
                    />
                  )}
                </View>
              ) : (
                // Search Results
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {searchResults.length} Results for "{searchQuery}"
                  </Text>
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#10B981" />
                      <Text style={styles.loadingText}>Searching foods...</Text>
                    </View>
                  ) : searchResults.length > 0 ? (
                    <FlatList
                      data={searchResults}
                      renderItem={renderFoodItem}
                      keyExtractor={(item) => item.id}
                      showsVerticalScrollIndicator={false}
                    />
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons name="search" size={48} color="#6B7280" />
                      <Text style={styles.emptyTitle}>No foods found</Text>
                      <Text style={styles.emptyDescription}>
                        Try a different search term or check your spelling
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      {/* Quantity Modal */}
      <Modal
        visible={showQuantityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuantityModal(false)}
      >
        <View style={styles.quantityModalOverlay}>
          <View style={styles.quantityModal}>
            <Text style={styles.quantityModalTitle}>Add {selectedFood?.name}</Text>
            <Text style={styles.quantityModalSubtitle}>
              How much would you like to add?
            </Text>
            
            <View style={styles.quantityInputContainer}>
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.quantityUnit}>
                {selectedFood && 'servingSize' in selectedFood ? selectedFood.servingSize : 'servings'}
              </Text>
            </View>

            <View style={styles.quantityModalButtons}>
              <TouchableOpacity
                style={styles.quantityCancelButton}
                onPress={() => setShowQuantityModal(false)}
              >
                <Text style={styles.quantityCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quantityAddButton}
                onPress={handleAddFood}
              >
                <Text style={styles.quantityAddText}>Add Food</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiToggle: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#10B981',
  },
  categoryChipText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  foodItem: {
    marginBottom: 12,
  },
  foodItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  foodItemContent: {
    flex: 1,
    marginRight: 12,
  },
  foodItemHeader: {
    marginBottom: 8,
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  foodItemBrand: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  foodItemStats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  foodStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  foodStatText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  foodItemMacros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  macroText: {
    fontSize: 11,
    color: '#6B7280',
    marginRight: 12,
    marginBottom: 2,
  },
  addButton: {
    padding: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 12,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  quantityModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityModal: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    width: width * 0.8,
    maxWidth: 400,
  },
  quantityModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  quantityModalSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  quantityInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  quantityUnit: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  quantityModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantityCancelButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  quantityCancelText: {
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '600',
  },
  quantityAddButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  quantityAddText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
});
