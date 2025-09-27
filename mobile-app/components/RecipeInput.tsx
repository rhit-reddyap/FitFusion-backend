import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataStorage } from '../utils/dataStorage';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface RecipeInputProps {
  visible: boolean;
  onClose: () => void;
  onRecipeAdded: (recipe: any) => void;
}

export default function RecipeInput({ visible, onClose, onRecipeAdded }: RecipeInputProps) {
  const [recipeName, setRecipeName] = useState('');
  const [servings, setServings] = useState('1');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showIngredientInput, setShowIngredientInput] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    amount: '',
    unit: 'g',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  const commonUnits = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'piece', 'slice'];

  const resetForm = () => {
    setRecipeName('');
    setServings('1');
    setPrepTime('');
    setCookTime('');
    setDescription('');
    setInstructions('');
    setIngredients([]);
    setNewIngredient({
      name: '',
      amount: '',
      unit: 'g',
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    });
  };

  const handleAddIngredient = () => {
    if (!newIngredient.name || !newIngredient.amount) {
      Alert.alert('Error', 'Please fill in ingredient name and amount');
      return;
    }

    const ingredient: Ingredient = {
      id: Date.now().toString(),
      name: newIngredient.name,
      amount: newIngredient.amount,
      unit: newIngredient.unit,
      calories: parseFloat(newIngredient.calories) || 0,
      protein: parseFloat(newIngredient.protein) || 0,
      carbs: parseFloat(newIngredient.carbs) || 0,
      fat: parseFloat(newIngredient.fat) || 0
    };

    setIngredients([...ingredients, ingredient]);
    setNewIngredient({
      name: '',
      amount: '',
      unit: 'g',
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    });
    setShowIngredientInput(false);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const calculateRecipeNutrition = () => {
    const total = ingredients.reduce((acc, ing) => ({
      calories: acc.calories + ing.calories,
      protein: acc.protein + ing.protein,
      carbs: acc.carbs + ing.carbs,
      fat: acc.fat + ing.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const servingsNum = parseFloat(servings) || 1;
    return {
      calories: Math.round(total.calories / servingsNum),
      protein: Math.round((total.protein / servingsNum) * 10) / 10,
      carbs: Math.round((total.carbs / servingsNum) * 10) / 10,
      fat: Math.round((total.fat / servingsNum) * 10) / 10
    };
  };

  const handleSaveRecipe = async () => {
    if (!recipeName.trim()) {
      Alert.alert('Error', 'Please enter a recipe name');
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient');
      return;
    }

    const nutrition = calculateRecipeNutrition();
    const recipe = {
      name: recipeName.trim(),
      description: description.trim(),
      servings: parseInt(servings) || 1,
      prepTime: prepTime ? parseInt(prepTime) : 0,
      cookTime: cookTime ? parseInt(cookTime) : 0,
      instructions: instructions.trim().split('\n').filter(step => step.trim()),
      ingredients: ingredients,
      ...nutrition,
      tags: ['homemade', 'user-created'],
      difficulty: 'Easy',
      cuisine: 'Custom'
    };

    try {
      const savedRecipe = await DataStorage.addUserRecipe(recipe);
      if (savedRecipe) {
        Alert.alert('Success', 'Recipe saved successfully!', [
          { text: 'OK', onPress: () => {
            onRecipeAdded(savedRecipe);
            resetForm();
            onClose();
          }}
        ]);
      } else {
        Alert.alert('Error', 'Failed to save recipe');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe');
    }
  };

  const renderIngredient = ({ item }: { item: Ingredient }) => (
    <View style={styles.ingredientItem}>
      <View style={styles.ingredientInfo}>
        <Text style={styles.ingredientName}>{item.name}</Text>
        <Text style={styles.ingredientAmount}>{item.amount} {item.unit}</Text>
        <Text style={styles.ingredientNutrition}>
          {item.calories} cal • P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeIngredientButton}
        onPress={() => handleRemoveIngredient(item.id)}
      >
        <Ionicons name="close" size={16} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  const nutrition = calculateRecipeNutrition();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Recipe</Text>
          <TouchableOpacity
            style={[styles.saveButton, (!recipeName.trim() || ingredients.length === 0) && styles.disabledButton]}
            onPress={handleSaveRecipe}
            disabled={!recipeName.trim() || ingredients.length === 0}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Recipe Name *</Text>
              <TextInput
                style={styles.textInput}
                value={recipeName}
                onChangeText={setRecipeName}
                placeholder="Enter recipe name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Servings</Text>
                <TextInput
                  style={styles.textInput}
                  value={servings}
                  onChangeText={setServings}
                  placeholder="1"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Prep Time (min)</Text>
                <TextInput
                  style={styles.textInput}
                  value={prepTime}
                  onChangeText={setPrepTime}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your recipe..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <TouchableOpacity
                style={styles.addIngredientButton}
                onPress={() => setShowIngredientInput(true)}
              >
                <Ionicons name="add" size={16} color="#10B981" />
                <Text style={styles.addIngredientText}>Add Ingredient</Text>
              </TouchableOpacity>
            </View>

            {ingredients.length > 0 && (
              <FlatList
                data={ingredients}
                renderItem={renderIngredient}
                keyExtractor={(item) => item.id}
                style={styles.ingredientsList}
              />
            )}

            {ingredients.length === 0 && (
              <View style={styles.emptyIngredients}>
                <Ionicons name="restaurant" size={32} color="#6B7280" />
                <Text style={styles.emptyIngredientsText}>No ingredients added yet</Text>
                <Text style={styles.emptyIngredientsSubtext}>Tap "Add Ingredient" to get started</Text>
              </View>
            )}
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Enter step-by-step instructions..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
            />
          </View>

          {/* Nutrition Summary */}
          {ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nutrition Summary (per serving)</Text>
              <View style={styles.nutritionSummary}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{nutrition.calories}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{nutrition.protein}g</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{nutrition.carbs}g</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{nutrition.fat}g</Text>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Ingredient Input Modal */}
        <Modal
          visible={showIngredientInput}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowIngredientInput(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Ingredient</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowIngredientInput(false)}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ingredient Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newIngredient.name}
                    onChangeText={(text) => setNewIngredient({...newIngredient, name: text})}
                    placeholder="e.g., Chicken breast"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Amount *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newIngredient.amount}
                      onChangeText={(text) => setNewIngredient({...newIngredient, amount: text})}
                      placeholder="100"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Unit</Text>
                    <View style={styles.unitSelector}>
                      <Text style={styles.unitText}>{newIngredient.unit}</Text>
                      <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </View>
                  </View>
                </View>

                <Text style={styles.nutritionTitle}>Nutritional Information (per {newIngredient.unit})</Text>
                
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Calories</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newIngredient.calories}
                      onChangeText={(text) => setNewIngredient({...newIngredient, calories: text})}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Protein (g)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newIngredient.protein}
                      onChangeText={(text) => setNewIngredient({...newIngredient, protein: text})}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Carbs (g)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newIngredient.carbs}
                      onChangeText={(text) => setNewIngredient({...newIngredient, carbs: text})}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Fat (g)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newIngredient.fat}
                      onChangeText={(text) => setNewIngredient({...newIngredient, fat: text})}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddIngredient}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.addButtonGradient}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Add Ingredient</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  addIngredientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addIngredientText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  ingredientsList: {
    maxHeight: 200,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  ingredientAmount: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  ingredientNutrition: {
    fontSize: 11,
    color: '#6B7280',
  },
  removeIngredientButton: {
    padding: 4,
  },
  emptyIngredients: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  emptyIngredientsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyIngredientsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  nutritionSummary: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  nutritionItem: {
    flex: 1,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  unitText: {
    fontSize: 16,
    color: '#000000',
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 12,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});








