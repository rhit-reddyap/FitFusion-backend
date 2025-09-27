import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataStorage } from '../utils/dataStorage';
import CalorieTargetService from '../services/calorieTargetService';

const { width, height } = Dimensions.get('window');

interface CalorieGoalModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'consumed' | 'burned';
  currentValue: number;
  currentGoal: number;
  onGoalUpdated: (newGoal: number) => void;
}

export default function CalorieGoalModal({
  visible,
  onClose,
  type,
  currentValue,
  currentGoal,
  onGoalUpdated
}: CalorieGoalModalProps) {
  const [consumedGoal, setConsumedGoal] = useState(currentGoal);
  const [burnedGoal, setBurnedGoal] = useState(2000); // Default burned goal
  const [aiSuggestion, setAiSuggestion] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [metabolismData, setMetabolismData] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      loadPersonalInfo();
      generateAISuggestion();
    }
  }, [visible]);

  const loadPersonalInfo = async () => {
    try {
      const [personal, metabolism] = await Promise.all([
        DataStorage.getPersonalInfo(),
        DataStorage.getMetabolismData()
      ]);
      setPersonalInfo(personal);
      setMetabolismData(metabolism);
    } catch (error) {
      console.error('Error loading personal info:', error);
    }
  };

  const generateAISuggestion = async () => {
    try {
      setLoading(true);
      const service = CalorieTargetService.getInstance();
      const suggestion = await service.getCurrentCalorieTarget();
      if (suggestion) {
        if (type === 'consumed') {
          setAiSuggestion(suggestion.dailyTarget);
        } else {
          // For calories burned, suggest based on activity level
          const activityMultiplier = personalInfo?.activityLevel === 'high' ? 1.8 : 
                                   personalInfo?.activityLevel === 'moderate' ? 1.6 : 1.4;
          setAiSuggestion(Math.round(suggestion.dailyTarget * activityMultiplier));
        }
      }
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const newGoal = type === 'consumed' ? consumedGoal : burnedGoal;
      
      // Update the goal in DataStorage
      const goals = await DataStorage.getDailyGoals();
      if (type === 'consumed') {
        goals.calories = newGoal;
      } else {
        goals.caloriesBurned = newGoal;
      }
      await DataStorage.saveDailyGoals(goals);
      
      onGoalUpdated(newGoal);
      onClose();
      
      Alert.alert(
        'Goal Updated!',
        `Your ${type === 'consumed' ? 'calories consumed' : 'calories burned'} goal has been set to ${newGoal}`
      );
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    }
  };

  const handleAISuggestion = () => {
    if (aiSuggestion) {
      if (type === 'consumed') {
        setConsumedGoal(aiSuggestion);
      } else {
        setBurnedGoal(aiSuggestion);
      }
    }
  };

  const getTitle = () => {
    return type === 'consumed' ? 'Calories Consumed Goal' : 'Calories Burned Goal';
  };

  const getDescription = () => {
    if (type === 'consumed') {
      return 'Set your daily calorie intake goal. This helps you maintain, lose, or gain weight based on your fitness objectives.';
    } else {
      return 'Set your daily calorie burn goal. This represents the total calories you want to burn through exercise and daily activities.';
    }
  };

  const getIcon = () => {
    return type === 'consumed' ? 'restaurant' : 'flame';
  };

  const getColors = () => {
    return type === 'consumed' ? ['#EF4444', '#DC2626'] : ['#F59E0B', '#D97706'];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Ionicons name={getIcon()} size={32} color={getColors()[0]} />
              <Text style={styles.title}>{getTitle()}</Text>
            </View>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Current Status */}
            <View style={styles.currentStatus}>
              <Text style={styles.currentLabel}>Current Progress</Text>
              <View style={styles.progressContainer}>
                <Text style={styles.currentValue}>{currentValue}</Text>
                <Text style={styles.currentGoal}>/ {currentGoal} calories</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min((currentValue / currentGoal) * 100, 100)}%`,
                      backgroundColor: getColors()[0]
                    }
                  ]} 
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>{getDescription()}</Text>
            </View>

            {/* Metabolism Breakdown for Burned Calories */}
            {type === 'burned' && metabolismData && (
              <View style={styles.metabolismBreakdown}>
                <Text style={styles.breakdownTitle}>Your Metabolism Breakdown</Text>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Basal Metabolic Rate (BMR):</Text>
                  <Text style={styles.breakdownValue}>{metabolismData.bmr} cal/day</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Total Daily Energy Expenditure:</Text>
                  <Text style={styles.breakdownValue}>{metabolismData.tdee} cal/day</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Activity Level:</Text>
                  <Text style={styles.breakdownValue}>{metabolismData.activityLevel}</Text>
                </View>
                <Text style={styles.breakdownNote}>
                  Your BMR represents calories burned just from basic bodily functions. 
                  The app adds exercise calories on top of this when no wearable is connected.
                </Text>
              </View>
            )}

            {/* AI Suggestion */}
            {aiSuggestion && (
              <View style={styles.aiSuggestionContainer}>
                <View style={styles.aiHeader}>
                  <Ionicons name="bulb" size={20} color="#10B981" />
                  <Text style={styles.aiTitle}>AI Recommendation</Text>
                </View>
                <Text style={styles.aiDescription}>
                  Based on your {personalInfo?.height ? `height (${personalInfo.height}cm)` : 'profile'}, 
                  {personalInfo?.weight ? ` weight (${personalInfo.weight}kg)` : ''}, 
                  and fitness goals, we recommend:
                </Text>
                <View style={styles.aiSuggestionBox}>
                  <Text style={styles.aiSuggestionValue}>{aiSuggestion} calories</Text>
                  <TouchableOpacity 
                    style={styles.useAISuggestionButton}
                    onPress={handleAISuggestion}
                  >
                    <Text style={styles.useAISuggestionText}>Use This Goal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Manual Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Set Your {type === 'consumed' ? 'Calorie Intake' : 'Calorie Burn'} Goal
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={type === 'consumed' ? consumedGoal.toString() : burnedGoal.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 0;
                    if (type === 'consumed') {
                      setConsumedGoal(value);
                    } else {
                      setBurnedGoal(value);
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="Enter goal"
                  placeholderTextColor="#6B7280"
                />
                <Text style={styles.inputUnit}>calories</Text>
              </View>
            </View>

            {/* Quick Presets */}
            <View style={styles.presetsContainer}>
              <Text style={styles.presetsTitle}>Quick Presets</Text>
              <View style={styles.presetsGrid}>
                {type === 'consumed' ? (
                  <>
                    <TouchableOpacity 
                      style={styles.presetButton}
                      onPress={() => setConsumedGoal(1500)}
                    >
                      <Text style={styles.presetText}>1,500</Text>
                      <Text style={styles.presetLabel}>Weight Loss</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.presetButton}
                      onPress={() => setConsumedGoal(2000)}
                    >
                      <Text style={styles.presetText}>2,000</Text>
                      <Text style={styles.presetLabel}>Maintenance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.presetButton}
                      onPress={() => setConsumedGoal(2500)}
                    >
                      <Text style={styles.presetText}>2,500</Text>
                      <Text style={styles.presetLabel}>Weight Gain</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity 
                      style={styles.presetButton}
                      onPress={() => setBurnedGoal(300)}
                    >
                      <Text style={styles.presetText}>300</Text>
                      <Text style={styles.presetLabel}>Light Activity</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.presetButton}
                      onPress={() => setBurnedGoal(500)}
                    >
                      <Text style={styles.presetText}>500</Text>
                      <Text style={styles.presetLabel}>Moderate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.presetButton}
                      onPress={() => setBurnedGoal(800)}
                    >
                      <Text style={styles.presetText}>800</Text>
                      <Text style={styles.presetLabel}>High Activity</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: getColors()[0] }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  currentStatus: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  currentLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  currentValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currentGoal: {
    fontSize: 18,
    color: '#6B7280',
    marginLeft: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  descriptionContainer: {
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
  },
  aiSuggestionContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 8,
  },
  aiDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 15,
    lineHeight: 20,
  },
  aiSuggestionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 15,
  },
  aiSuggestionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  useAISuggestionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  useAISuggestionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  inputContainer: {
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
    paddingVertical: 12,
  },
  inputUnit: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  presetsContainer: {
    marginTop: 30,
  },
  presetsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  presetsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  presetText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  presetLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metabolismBreakdown: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  breakdownValue: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  breakdownNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
