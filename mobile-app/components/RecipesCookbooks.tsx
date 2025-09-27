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
  TextInput,
  FlatList,
  StatusBar,
  Platform,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataStorage } from '../utils/dataStorage';
import RecipeInput from './RecipeInput';

const { width } = Dimensions.get('window');

interface Recipe {
  id: string;
  name: string;
  source: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
  description?: string;
  prepTime?: number;
  servings?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

interface RecipesCookbooksProps {
  onBack: () => void;
}

export default function RecipesCookbooks({ onBack }: RecipesCookbooksProps) {
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRecipes();
  }, []);

  const loadUserRecipes = async () => {
    try {
      setLoading(true);
      const recipes = await DataStorage.getUserRecipes();
      setUserRecipes(recipes);
    } catch (error) {
      console.error('Error loading user recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample recipes data matching the design
  const starterRecipes: Recipe[] = [
    {
      id: '1',
      name: 'Chicken Power Bowl',
      source: 'Fusion Kitchen • 1 bowl',
      calories: 520,
      protein: 45,
      carbs: 55,
      fat: 15,
      tags: ['high-protein'],
      description: 'A nutritious bowl packed with lean protein and complex carbs',
      prepTime: 25,
      servings: 1,
      fiber: 8,
      sugar: 12,
      sodium: 650
    },
    {
      id: '2',
      name: 'Protein Oats & Berries',
      source: 'Fusion Kitchen • 1 bowl',
      calories: 410,
      protein: 32,
      carbs: 58,
      fat: 10,
      tags: ['breakfast', 'fiber'],
      description: 'Creamy protein oats topped with fresh berries and nuts',
      prepTime: 10,
      servings: 1,
      fiber: 12,
      sugar: 18,
      sodium: 200
    },
    {
      id: '3',
      name: 'Quinoa Power Salad',
      source: 'Fusion Kitchen • 1 bowl',
      calories: 380,
      protein: 28,
      carbs: 42,
      fat: 12,
      tags: ['vegetarian', 'high-fiber'],
      description: 'Nutrient-dense salad with quinoa, vegetables, and tahini dressing',
      prepTime: 20,
      servings: 1,
      fiber: 15,
      sugar: 8,
      sodium: 450
    },
    {
      id: '4',
      name: 'Greek Yogurt Parfait',
      source: 'Fusion Kitchen • 1 bowl',
      calories: 320,
      protein: 25,
      carbs: 35,
      fat: 8,
      tags: ['breakfast', 'probiotics'],
      description: 'Layered parfait with Greek yogurt, granola, and fresh fruit',
      prepTime: 5,
      servings: 1,
      fiber: 6,
      sugar: 22,
      sodium: 150
    },
    {
      id: '5',
      name: 'Salmon & Sweet Potato',
      source: 'Fusion Kitchen • 1 plate',
      calories: 480,
      protein: 38,
      carbs: 45,
      fat: 18,
      tags: ['omega-3', 'anti-inflammatory'],
      description: 'Baked salmon with roasted sweet potato and steamed vegetables',
      prepTime: 30,
      servings: 1,
      fiber: 10,
      sugar: 15,
      sodium: 800
    }
  ];

  const allRecipes = [...userRecipes, ...starterRecipes];
  const filteredRecipes = allRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAISuggestions = () => {
    Alert.alert(
      'AI-Powered Suggestions',
      'Get personalized recipe recommendations based on your dietary preferences, fitness goals, and available ingredients.',
      [{ text: 'OK' }]
    );
  };

  const handleOneClickLogging = () => {
    Alert.alert(
      'One-Click Logging',
      'Instantly log recipes to your food diary with accurate macro calculations.',
      [{ text: 'OK' }]
    );
  };

  const handleAddRecipe = () => {
    setShowAddRecipe(true);
  };

  const handleRecipeAdded = (recipe: Recipe) => {
    setUserRecipes([...userRecipes, recipe]);
  };

  const handleRecipePress = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleLogRecipe = async (recipe: Recipe) => {
    Alert.alert(
      'Log Recipe',
      `Log "${recipe.name}" to your food diary?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Recipe', 
          onPress: async () => {
            try {
              // Ensure all required properties exist with fallbacks
              const safeRecipe = {
                ...recipe,
                fiber: recipe.fiber || 0,
                sugar: recipe.sugar || 0,
                sodium: recipe.sodium || 0,
                servings: recipe.servings || 1
              };
              
              const foodEntry = await DataStorage.logRecipeToFoodDiary(safeRecipe, 'lunch', 1);
              if (foodEntry) {
                Alert.alert('Success', 'Recipe logged to your food diary!');
              } else {
                Alert.alert('Error', 'Failed to log recipe');
              }
            } catch (error) {
              console.error('Error logging recipe:', error);
              Alert.alert('Error', 'Failed to log recipe');
            }
          }
        }
      ]
    );
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => handleRecipePress(item)}
    >
      <View style={styles.recipeHeader}>
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName}>{item.name}</Text>
          <Text style={styles.recipeSource}>{item.source}</Text>
        </View>
        <TouchableOpacity
          style={styles.logButton}
          onPress={(e) => {
            e.stopPropagation();
            handleLogRecipe(item);
          }}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.recipeNutrition}>
        <Text style={styles.nutritionText}>
          Per Serving {item.calories} kcal • P {item.protein}g • C {item.carbs}g • F {item.fat}g
        </Text>
      </View>
      
      <View style={styles.recipeTags}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={true} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="restaurant" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.pageTitle}>Recipes & Cookbooks</Text>
            <Text style={styles.pageSubtitle}>Manage your recipes and discover new ones</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* AD's Power Fuel Cookbook Banner */}
        <View style={styles.cookbookBanner}>
          <LinearGradient
            colors={['#0F172A', '#1E293B', '#334155']}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerHeader}>
                <View style={styles.comingSoonTag}>
                  <Text style={styles.comingSoonText}>Coming Soon!</Text>
                </View>
                <View style={styles.chefIcon}>
                  <Ionicons name="restaurant" size={60} color="rgba(16, 185, 129, 0.15)" />
                </View>
              </View>
              
              <Text style={styles.bannerTitle}>AD's Power Fuel Cookbook</Text>
              <Text style={styles.bannerDescription}>
                Unlock a premium collection of macro-friendly recipes designed for performance and taste. Each recipe is crafted for easy logging and tight integration with your diet plan.
              </Text>
              
              <View style={styles.bannerButtons}>
                <TouchableOpacity style={styles.bannerButton} onPress={handleAISuggestions}>
                  <Ionicons name="sparkles" size={16} color="#1E40AF" />
                  <Text style={styles.bannerButtonText}>AI-Powered Suggestions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bannerButton} onPress={handleOneClickLogging}>
                  <Ionicons name="add" size={16} color="#1E40AF" />
                  <Text style={styles.bannerButtonText}>One-Click Logging</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Your Personal Recipes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Personal Recipes</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddRecipe}>
              <Ionicons name="add" size={16} color="#10B981" />
              <Text style={styles.addButtonText}>Add New Recipe</Text>
            </TouchableOpacity>
          </View>
          
          {userRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="restaurant" size={48} color="#6B7280" />
              </View>
              <Text style={styles.emptyTitle}>Your cookbook is empty</Text>
              <Text style={styles.emptySubtitle}>Add your first recipe to get started!</Text>
            </View>
          ) : (
            <FlatList
              data={userRecipes}
              renderItem={renderRecipeCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recipesList}
            />
          )}
        </View>

        {/* Starter Recipes Section */}
        <View style={styles.section}>
          <View style={styles.starterHeader}>
            <Ionicons name="restaurant" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>STARTER RECIPES</Text>
          </View>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <FlatList
            data={filteredRecipes}
            renderItem={renderRecipeCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recipesList}
          />
        </View>
      </ScrollView>

      {/* Recipe Detail Modal */}
      <Modal
        visible={selectedRecipe !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedRecipe(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRecipe && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedRecipe.name}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedRecipe(null)}
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalSource}>{selectedRecipe.source}</Text>
                    {selectedRecipe.description && (
                      <Text style={styles.modalDescription}>{selectedRecipe.description}</Text>
                    )}
                  </View>

                  <View style={styles.modalNutrition}>
                    <Text style={styles.modalNutritionTitle}>Nutritional Information</Text>
                    <View style={styles.modalNutritionGrid}>
                      <View style={styles.modalNutritionItem}>
                        <Text style={styles.modalNutritionValue}>{selectedRecipe.calories}</Text>
                        <Text style={styles.modalNutritionLabel}>Calories</Text>
                      </View>
                      <View style={styles.modalNutritionItem}>
                        <Text style={styles.modalNutritionValue}>{selectedRecipe.protein}g</Text>
                        <Text style={styles.modalNutritionLabel}>Protein</Text>
                      </View>
                      <View style={styles.modalNutritionItem}>
                        <Text style={styles.modalNutritionValue}>{selectedRecipe.carbs}g</Text>
                        <Text style={styles.modalNutritionLabel}>Carbs</Text>
                      </View>
                      <View style={styles.modalNutritionItem}>
                        <Text style={styles.modalNutritionValue}>{selectedRecipe.fat}g</Text>
                        <Text style={styles.modalNutritionLabel}>Fat</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalTags}>
                    <Text style={styles.modalTagsTitle}>Tags</Text>
                    <View style={styles.modalTagsList}>
                      {selectedRecipe.tags.map((tag, index) => (
                        <View key={index} style={styles.modalTag}>
                          <Text style={styles.modalTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.modalLogButton}
                    onPress={() => {
                      handleLogRecipe(selectedRecipe);
                      setSelectedRecipe(null);
                    }}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.modalLogButtonGradient}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                      <Text style={styles.modalLogButtonText}>Log to Food Diary</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

        {/* Recipe Input Modal */}
        <RecipeInput
          visible={showAddRecipe}
          onClose={() => setShowAddRecipe(false)}
          onRecipeAdded={handleRecipeAdded}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 50,
    paddingBottom: 16,
    gap: 16,
    backgroundColor: '#0F172A',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#10B981',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  cookbookBanner: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerGradient: {
    padding: 20,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  bannerContent: {
    position: 'relative',
    zIndex: 2,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  comingSoonTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  chefIcon: {
    position: 'absolute',
    right: -10,
    top: -20,
    opacity: 0.8,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 28,
  },
  bannerDescription: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 16,
  },
  bannerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bannerButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  bannerButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  starterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  recipesList: {
    paddingRight: 16,
  },
  recipeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: width * 0.75,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recipeSource: {
    fontSize: 12,
    color: '#94A3B8',
  },
  logButton: {
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeNutrition: {
    marginBottom: 12,
  },
  nutritionText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  recipeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
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
  modalInfo: {
    marginBottom: 20,
  },
  modalSource: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  modalNutrition: {
    marginBottom: 20,
  },
  modalNutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  modalNutritionGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  modalNutritionItem: {
    flex: 1,
    alignItems: 'center',
  },
  modalNutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  modalNutritionLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  modalTags: {
    marginBottom: 24,
  },
  modalTagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  modalTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalLogButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalLogButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  modalLogButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
