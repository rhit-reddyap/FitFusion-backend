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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AIService, { AIWorkoutRequest, AIWorkoutResponse } from '../services/aiService';
import { CustomWorkout } from '../types/workout';

interface AIWorkoutGeneratorProps {
  visible: boolean;
  onClose: () => void;
  onSaveWorkout: (workout: CustomWorkout) => void;
}

export default function AIWorkoutGenerator({ visible, onClose, onSaveWorkout }: AIWorkoutGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<AIWorkoutResponse | null>(null);
  
  // Form state
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [fitnessLevel, setFitnessLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);
  const [targetMuscles, setTargetMuscles] = useState<string[]>([]);
  const [workoutDuration, setWorkoutDuration] = useState(45);
  const [workoutType, setWorkoutType] = useState<'strength' | 'cardio' | 'hiit' | 'yoga' | 'mixed'>('strength');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [focus, setFocus] = useState<'muscle_gain' | 'weight_loss' | 'endurance' | 'flexibility'>('muscle_gain');

  const goals = ['Muscle Building', 'Weight Loss', 'Endurance', 'Strength', 'Flexibility', 'General Fitness'];
  const equipment = ['Dumbbells', 'Barbell', 'Kettlebell', 'Resistance Bands', 'Bodyweight', 'Cardio Machine', 'Yoga Mat'];
  const muscles = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Glutes', 'Full Body'];

  const toggleArrayItem = (array: string[], setArray: (items: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const generateWorkout = async () => {
    if (userGoals.length === 0) {
      Alert.alert('Error', 'Please select at least one goal');
      return;
    }

    if (availableEquipment.length === 0) {
      Alert.alert('Error', 'Please select at least one piece of equipment');
      return;
    }

    if (targetMuscles.length === 0) {
      Alert.alert('Error', 'Please select at least one target muscle group');
      return;
    }

    setIsGenerating(true);
    setGeneratedWorkout(null);

    try {
      const request: AIWorkoutRequest = {
        userGoals,
        fitnessLevel,
        availableEquipment,
        targetMuscles,
        workoutDuration,
        preferences: {
          workoutType,
          intensity,
          focus
        }
      };

      const response = await AIService.generateWorkout(request);
      setGeneratedWorkout(response);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to generate workout');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveWorkout = () => {
    if (!generatedWorkout) return;

    const customWorkout: CustomWorkout = {
      id: Date.now().toString(),
      name: generatedWorkout.workout.name,
      description: generatedWorkout.workout.description,
      duration: generatedWorkout.workout.duration,
      difficulty: generatedWorkout.workout.difficulty,
      category: 'AI Generated',
      exercises: generatedWorkout.workout.exercises.map(exercise => ({
        exercise: {
          id: Date.now().toString() + Math.random(),
          name: exercise.name,
          category: 'Strength',
          muscle: exercise.muscleGroups.join(', '),
          equipment: 'Various',
          instructions: exercise.instructions,
          videoUrl: ''
        },
        sets: Array(exercise.sets).fill(null).map(() => ({
          reps: exercise.reps,
          weight: exercise.weight || 0,
          restTime: exercise.restTime,
          completed: false,
          actualReps: exercise.reps,
          actualWeight: exercise.weight || 0,
          isActive: false
        }))
      })),
      createdAt: new Date().toISOString(),
      isCustom: true
    };

    onSaveWorkout(customWorkout);
    Alert.alert('Success', 'AI-generated workout saved to your library!');
    onClose();
  };

  const renderSelectionGrid = (items: string[], selectedItems: string[], onToggle: (item: string) => void, title: string) => (
    <View style={styles.selectionSection}>
      <Text style={styles.selectionTitle}>{title}</Text>
      <View style={styles.selectionGrid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.selectionItem,
              selectedItems.includes(item) && styles.selectedItem
            ]}
            onPress={() => onToggle(item)}
          >
            <Text style={[
              styles.selectionItemText,
              selectedItems.includes(item) && styles.selectedItemText
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#0A0A0A', '#1A1A1A', '#0F0F0F']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>AI Workout Generator</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!generatedWorkout ? (
            <>
              {/* Goals */}
              {renderSelectionGrid(goals, userGoals, (item) => toggleArrayItem(userGoals, setUserGoals, item), 'Your Goals')}

              {/* Fitness Level */}
              <View style={styles.selectionSection}>
                <Text style={styles.selectionTitle}>Fitness Level</Text>
                <View style={styles.levelButtons}>
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.levelButton,
                        fitnessLevel === level && styles.selectedLevelButton
                      ]}
                      onPress={() => setFitnessLevel(level)}
                    >
                      <Text style={[
                        styles.levelButtonText,
                        fitnessLevel === level && styles.selectedLevelButtonText
                      ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Equipment */}
              {renderSelectionGrid(equipment, availableEquipment, (item) => toggleArrayItem(availableEquipment, setAvailableEquipment, item), 'Available Equipment')}

              {/* Target Muscles */}
              {renderSelectionGrid(muscles, targetMuscles, (item) => toggleArrayItem(targetMuscles, setTargetMuscles, item), 'Target Muscles')}

              {/* Workout Duration */}
              <View style={styles.selectionSection}>
                <Text style={styles.selectionTitle}>Workout Duration (minutes)</Text>
                <View style={styles.durationContainer}>
                  <TouchableOpacity
                    style={styles.durationButton}
                    onPress={() => setWorkoutDuration(Math.max(15, workoutDuration - 15))}
                  >
                    <Ionicons name="remove" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.durationText}>{workoutDuration}</Text>
                  <TouchableOpacity
                    style={styles.durationButton}
                    onPress={() => setWorkoutDuration(Math.min(120, workoutDuration + 15))}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Workout Type */}
              <View style={styles.selectionSection}>
                <Text style={styles.selectionTitle}>Workout Type</Text>
                <View style={styles.typeButtons}>
                  {(['strength', 'cardio', 'hiit', 'yoga', 'mixed'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        workoutType === type && styles.selectedTypeButton
                      ]}
                      onPress={() => setWorkoutType(type)}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        workoutType === type && styles.selectedTypeButtonText
                      ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Generate Button */}
              <TouchableOpacity
                style={[styles.generateButton, isGenerating && styles.disabledButton]}
                onPress={generateWorkout}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                    <Text style={styles.generateButtonText}>Generate Workout</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Generated Workout */}
              <View style={styles.workoutContainer}>
                <Text style={styles.workoutName}>{generatedWorkout.workout.name}</Text>
                <Text style={styles.workoutDescription}>{generatedWorkout.workout.description}</Text>
                
                <View style={styles.workoutStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Duration</Text>
                    <Text style={styles.statValue}>{generatedWorkout.workout.duration} min</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Difficulty</Text>
                    <Text style={styles.statValue}>{generatedWorkout.workout.difficulty}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Exercises</Text>
                    <Text style={styles.statValue}>{generatedWorkout.workout.exercises.length}</Text>
                  </View>
                </View>

                <Text style={styles.reasoningTitle}>Why This Workout?</Text>
                <Text style={styles.reasoningText}>{generatedWorkout.reasoning}</Text>

                <Text style={styles.exercisesTitle}>Exercises</Text>
                {generatedWorkout.workout.exercises.map((exercise, index) => (
                  <View key={index} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDetails}>
                      {exercise.sets} sets × {exercise.reps} reps
                      {exercise.weight && ` @ ${exercise.weight}lbs`}
                    </Text>
                    <Text style={styles.exerciseInstructions}>{exercise.instructions}</Text>
                  </View>
                ))}

                <Text style={styles.tipsTitle}>Tips</Text>
                {generatedWorkout.tips.map((tip, index) => (
                  <Text key={index} style={styles.tipItem}>• {tip}</Text>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.regenerateButton} onPress={() => setGeneratedWorkout(null)}>
                  <Ionicons name="refresh" size={20} color="#10B981" />
                  <Text style={styles.regenerateButtonText}>Generate New</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
                  <Ionicons name="save" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Save Workout</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  selectionSection: {
    marginVertical: 16,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedItem: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  selectionItemText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedItemText: {
    color: '#FFFFFF',
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  levelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedLevelButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  levelButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedLevelButtonText: {
    color: '#FFFFFF',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  durationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    minWidth: 60,
    textAlign: 'center',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedTypeButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    color: '#FFFFFF',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    marginVertical: 20,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#6B7280',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  workoutContainer: {
    marginVertical: 16,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  workoutDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 22,
    marginBottom: 16,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reasoningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  reasoningText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 20,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  exerciseItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 8,
  },
  exerciseInstructions: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
  },
  regenerateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#10B981',
    gap: 8,
  },
  regenerateButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});






