import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataStorage } from '../utils/dataStorage';

const { width, height } = Dimensions.get('window');

interface Exercise {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  equipment: string;
  muscle: string;
}

interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  restTime: number;
  completed: boolean;
}

interface CustomWorkoutBuilderProps {
  visible: boolean;
  onClose: () => void;
  onWorkoutCreated: () => void;
  editingWorkout?: any;
  onWorkoutUpdated?: (workout: any) => void;
}

export default function CustomWorkoutBuilder({ visible, onClose, onWorkoutCreated, editingWorkout, onWorkoutUpdated }: CustomWorkoutBuilderProps) {
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [currentSet, setCurrentSet] = useState({ reps: 10, weight: 0, restTime: 60 });

  // Load editing workout data when component mounts
  useEffect(() => {
    console.log('CustomWorkoutBuilder useEffect - editingWorkout:', editingWorkout);
    console.log('CustomWorkoutBuilder useEffect - visible:', visible);
    if (editingWorkout && visible) {
      console.log('Loading editing workout data:', editingWorkout);
      setWorkoutName(editingWorkout.name || '');
      setWorkoutDescription(editingWorkout.description || '');
      
      // Transform the workout exercises to match the expected format
      const transformedExercises = Array.isArray(editingWorkout.exercises) 
        ? editingWorkout.exercises.map((workoutExercise: any) => {
            // Handle both nested and flat exercise structures
            const exercise = workoutExercise.exercise || workoutExercise;
            return {
              id: exercise.id || workoutExercise.id,
              name: exercise.name || workoutExercise.name,
              category: exercise.category || workoutExercise.category || 'General',
              difficulty: exercise.difficulty || workoutExercise.difficulty || 'Intermediate',
              equipment: exercise.equipment || workoutExercise.equipment || 'Bodyweight',
              muscle: exercise.muscle || workoutExercise.muscle || 'Full Body'
            };
          })
        : [];
      
      console.log('Transformed exercises:', transformedExercises);
      setSelectedExercises(transformedExercises);
    } else if (!editingWorkout && visible) {
      // Reset form for new workout
      console.log('Resetting form for new workout');
      setWorkoutName('');
      setWorkoutDescription('');
      setSelectedExercises([]);
    }
  }, [editingWorkout, visible]);

  const exerciseLibrary: Exercise[] = [
    // Chest
    { id: '1', name: 'Bench Press', category: 'Chest', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Chest, Triceps, Shoulders' },
    { id: '2', name: 'Incline Dumbbell Press', category: 'Chest', difficulty: 'Intermediate', equipment: 'Dumbbells', muscle: 'Upper Chest, Shoulders' },
    { id: '3', name: 'Push-ups', category: 'Chest', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Chest, Triceps, Core' },
    { id: '4', name: 'Dips', category: 'Chest', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Chest, Triceps, Shoulders' },
    { id: '5', name: 'Chest Flyes', category: 'Chest', difficulty: 'Beginner', equipment: 'Dumbbells', muscle: 'Chest' },
    { id: '6', name: 'Decline Bench Press', category: 'Chest', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Lower Chest, Triceps' },
    
    // Back
    { id: '7', name: 'Deadlifts', category: 'Back', difficulty: 'Advanced', equipment: 'Barbell', muscle: 'Back, Glutes, Hamstrings' },
    { id: '8', name: 'Pull-ups', category: 'Back', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Lats, Biceps, Rhomboids' },
    { id: '9', name: 'Bent-Over Rows', category: 'Back', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Lats, Rhomboids, Biceps' },
    { id: '10', name: 'Lat Pulldowns', category: 'Back', difficulty: 'Beginner', equipment: 'Cable', muscle: 'Lats, Biceps' },
    { id: '11', name: 'Cable Rows', category: 'Back', difficulty: 'Beginner', equipment: 'Cable', muscle: 'Rhomboids, Middle Traps' },
    { id: '12', name: 'T-Bar Rows', category: 'Back', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Lats, Rhomboids' },
    
    // Shoulders
    { id: '13', name: 'Overhead Press', category: 'Shoulders', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Shoulders, Triceps' },
    { id: '14', name: 'Lateral Raises', category: 'Shoulders', difficulty: 'Beginner', equipment: 'Dumbbells', muscle: 'Side Delts' },
    { id: '15', name: 'Front Raises', category: 'Shoulders', difficulty: 'Beginner', equipment: 'Dumbbells', muscle: 'Front Delts' },
    { id: '16', name: 'Rear Delt Flyes', category: 'Shoulders', difficulty: 'Beginner', equipment: 'Dumbbells', muscle: 'Rear Delts' },
    { id: '17', name: 'Face Pulls', category: 'Shoulders', difficulty: 'Beginner', equipment: 'Cable', muscle: 'Rear Delts, Rhomboids' },
    { id: '18', name: 'Shrugs', category: 'Shoulders', difficulty: 'Beginner', equipment: 'Barbell', muscle: 'Traps' },
    
    // Legs
    { id: '19', name: 'Squats', category: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Quads, Glutes, Hamstrings' },
    { id: '20', name: 'Romanian Deadlifts', category: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Hamstrings, Glutes' },
    { id: '21', name: 'Lunges', category: 'Legs', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Quads, Glutes' },
    { id: '22', name: 'Leg Press', category: 'Legs', difficulty: 'Beginner', equipment: 'Machine', muscle: 'Quads, Glutes' },
    { id: '23', name: 'Leg Curls', category: 'Legs', difficulty: 'Beginner', equipment: 'Machine', muscle: 'Hamstrings' },
    { id: '24', name: 'Leg Extensions', category: 'Legs', difficulty: 'Beginner', equipment: 'Machine', muscle: 'Quads' },
    { id: '25', name: 'Calf Raises', category: 'Legs', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Calves' },
    { id: '26', name: 'Bulgarian Split Squats', category: 'Legs', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Quads, Glutes' },
    
    // Arms
    { id: '27', name: 'Bicep Curls', category: 'Arms', difficulty: 'Beginner', equipment: 'Dumbbells', muscle: 'Biceps' },
    { id: '28', name: 'Hammer Curls', category: 'Arms', difficulty: 'Beginner', equipment: 'Dumbbells', muscle: 'Biceps, Forearms' },
    { id: '29', name: 'Tricep Pushdowns', category: 'Arms', difficulty: 'Beginner', equipment: 'Cable', muscle: 'Triceps' },
    { id: '30', name: 'Tricep Dips', category: 'Arms', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Triceps' },
    { id: '31', name: 'Close-Grip Bench Press', category: 'Arms', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Triceps' },
    { id: '32', name: 'Preacher Curls', category: 'Arms', difficulty: 'Beginner', equipment: 'Barbell', muscle: 'Biceps' },
    
    // Core
    { id: '33', name: 'Plank', category: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Core, Shoulders' },
    { id: '34', name: 'Crunches', category: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Abs' },
    { id: '35', name: 'Russian Twists', category: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Obliques' },
    { id: '36', name: 'Mountain Climbers', category: 'Core', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Core, Cardio' },
    { id: '37', name: 'Leg Raises', category: 'Core', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Lower Abs' },
    { id: '38', name: 'Bicycle Crunches', category: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Abs, Obliques' },
    { id: '39', name: 'Side Plank', category: 'Core', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Obliques, Shoulders' },
    { id: '40', name: 'Dead Bug', category: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Core, Stability' },
    
    // Cardio
    { id: '41', name: 'Burpees', category: 'Cardio', difficulty: 'Advanced', equipment: 'Bodyweight', muscle: 'Full Body' },
    { id: '42', name: 'Jump Squats', category: 'Cardio', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Legs, Glutes' },
    { id: '43', name: 'High Knees', category: 'Cardio', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Legs, Cardio' },
    { id: '44', name: 'Jumping Jacks', category: 'Cardio', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Full Body' },
    { id: '45', name: 'Plank Jacks', category: 'Cardio', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Core, Cardio' },
    
    // Functional
    { id: '46', name: 'Turkish Get-ups', category: 'Functional', difficulty: 'Advanced', equipment: 'Kettlebell', muscle: 'Full Body' },
    { id: '47', name: 'Kettlebell Swings', category: 'Functional', difficulty: 'Intermediate', equipment: 'Kettlebell', muscle: 'Hips, Glutes, Core' },
    { id: '48', name: 'Box Jumps', category: 'Functional', difficulty: 'Intermediate', equipment: 'Box', muscle: 'Legs, Power' },
    { id: '49', name: 'Farmer\'s Walk', category: 'Functional', difficulty: 'Intermediate', equipment: 'Dumbbells', muscle: 'Grip, Core, Traps' },
    { id: '50', name: 'Battle Ropes', category: 'Functional', difficulty: 'Intermediate', equipment: 'Ropes', muscle: 'Arms, Core, Cardio' },
    
    // Yoga
    { id: '51', name: 'Downward Dog', category: 'Yoga', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Full Body Stretch' },
    { id: '52', name: 'Warrior I', category: 'Yoga', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Legs, Hips, Shoulders' },
    { id: '53', name: 'Warrior II', category: 'Yoga', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Legs, Hips, Core' },
    { id: '54', name: 'Tree Pose', category: 'Yoga', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Balance, Legs' },
    { id: '55', name: 'Child\'s Pose', category: 'Yoga', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Hips, Back' }
  ];

  const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Cardio', 'Functional', 'Yoga'];

  const filteredExercises = (exerciseLibrary || []).filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.muscle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addExercise = (exercise: Exercise) => {
    if (exercise && exercise.id && !selectedExercises.find(ex => ex.id === exercise.id)) {
      setSelectedExercises([...selectedExercises, exercise]);
    }
    setShowExerciseLibrary(false);
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises((selectedExercises || []).filter(ex => ex.id !== exerciseId));
  };

  const startEditingExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setSets([]);
    setCurrentSet({ reps: 10, weight: 0, restTime: 60 });
  };

  const addSet = () => {
    const newSet: WorkoutSet = {
      id: Date.now().toString(),
      reps: currentSet.reps,
      weight: currentSet.weight,
      restTime: currentSet.restTime,
      completed: false
    };
    setSets([...sets, newSet]);
  };

  const removeSet = (setId: string) => {
    setSets(sets.filter(set => set.id !== setId));
  };

  const saveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    // Create exercises with default sets if none are specified
    const exercisesWithSets = selectedExercises.map(exercise => {
      const exerciseSets = sets.filter(set => set.exerciseId === exercise.id);
      
      // If no sets are specified, create default sets
      if (exerciseSets.length === 0) {
        return {
          exercise: {
            ...exercise,
            primaryMuscles: exercise.primaryMuscles || [exercise.muscle || 'Full Body'],
            secondaryMuscles: exercise.secondaryMuscles || []
          },
          sets: Array(3).fill(0).map((_, index) => ({
            id: `set_${Date.now()}_${index}`,
            reps: 10,
            weight: 0,
            restTime: 60,
            completed: false
          }))
        };
      }
      
      return {
        exercise: {
          ...exercise,
          primaryMuscles: exercise.primaryMuscles || [exercise.muscle || 'Full Body'],
          secondaryMuscles: exercise.secondaryMuscles || []
        },
        sets: exerciseSets
      };
    });

    const workout = {
      id: editingWorkout ? editingWorkout.id : Date.now().toString(),
      name: workoutName.trim(),
      description: workoutDescription.trim(),
      exercises: exercisesWithSets,
      createdAt: editingWorkout ? editingWorkout.createdAt : new Date(),
      lastUsed: null,
      difficulty: 'Intermediate',
      estimatedDuration: selectedExercises.length * 15, // 15 minutes per exercise
      targetMuscles: [...new Set(selectedExercises.map(ex => ex.muscle))],
      equipment: [...new Set(selectedExercises.map(ex => ex.equipment))],
      tags: ['Custom']
    };

    try {
      if (editingWorkout) {
        // Update existing workout
        await DataStorage.updateCustomWorkout(workout);
        Alert.alert('Success', 'Workout updated successfully!', [
          { text: 'OK', onPress: () => {
            onWorkoutUpdated?.(workout);
            onClose();
            resetForm();
          }}
        ]);
      } else {
        // Create new workout
        await DataStorage.addCustomWorkout(workout);
        Alert.alert('Success', 'Workout created successfully!', [
          { text: 'OK', onPress: () => {
            onWorkoutCreated();
            onClose();
            resetForm();
          }}
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  const resetForm = () => {
    setWorkoutName('');
    setWorkoutDescription('');
    setSelectedExercises([]);
    setSets([]);
    setEditingExercise(null);
    setCurrentSet({ reps: 10, weight: 0, restTime: 60 });
  };

  const renderExerciseLibrary = () => (
    <Modal
      visible={showExerciseLibrary}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <LinearGradient
        colors={['#1F2937', '#111827']}
        style={styles.libraryContainer}
      >
        <View style={styles.libraryHeader}>
          <TouchableOpacity
            onPress={() => setShowExerciseLibrary(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.libraryTitle}>Exercise Library</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
          {(filteredExercises || []).map(exercise => (
            <TouchableOpacity
              key={exercise.id}
              onPress={() => addExercise(exercise)}
              style={styles.exerciseItem}
            >
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMuscle}>{exercise.muscle}</Text>
                <Text style={styles.exerciseEquipment}>{exercise.equipment} • {exercise.difficulty}</Text>
              </View>
              <Ionicons name="add-circle" size={24} color="#10B981" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>
    </Modal>
  );

  const renderSetEditor = () => (
    <Modal
      visible={editingExercise !== null}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <LinearGradient
        colors={['#1F2937', '#111827']}
        style={styles.setEditorContainer}
      >
        <View style={styles.setEditorHeader}>
          <TouchableOpacity
            onPress={() => setEditingExercise(null)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.setEditorTitle}>
            {editingExercise?.name} - Sets & Reps
          </Text>
        </View>

        <ScrollView style={styles.setEditorContent} showsVerticalScrollIndicator={false}>
          {/* Current Set Input */}
          <View style={styles.currentSetCard}>
            <Text style={styles.currentSetTitle}>Add New Set</Text>
            
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.input}
                  value={currentSet.reps.toString()}
                  onChangeText={(text) => setCurrentSet({...currentSet, reps: parseInt(text) || 0})}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (lbs)</Text>
                <TextInput
                  style={styles.input}
                  value={currentSet.weight.toString()}
                  onChangeText={(text) => setCurrentSet({...currentSet, weight: parseInt(text) || 0})}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Rest (sec)</Text>
                <TextInput
                  style={styles.input}
                  value={currentSet.restTime.toString()}
                  onChangeText={(text) => setCurrentSet({...currentSet, restTime: parseInt(text) || 0})}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <TouchableOpacity
              onPress={addSet}
              style={styles.addSetButton}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>
          </View>

          {/* Sets List */}
          <View style={styles.setsList}>
            <Text style={styles.setsTitle}>Sets ({(sets || []).length})</Text>
            {(sets || []).map((set, index) => (
              <View key={set.id} style={styles.setItem}>
                <Text style={styles.setNumber}>Set {index + 1}</Text>
                <Text style={styles.setDetails}>
                  {set.reps} reps × {set.weight} lbs
                </Text>
                <Text style={styles.restTime}>
                  {set.restTime}s rest
                </Text>
                <TouchableOpacity
                  onPress={() => removeSet(set.id)}
                  style={styles.removeSetButton}
                >
                  <Ionicons name="trash" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setEditingExercise(null)}
            style={styles.doneButton}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A', '#0F0F0F']}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{editingWorkout ? 'Edit Workout' : 'Create Workout'}</Text>
          <TouchableOpacity
            onPress={saveWorkout}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Workout Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workout Details</Text>
            
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Workout Name</Text>
              <TextInput
                style={styles.textInput}
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder="Enter workout name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={workoutDescription}
                onChangeText={setWorkoutDescription}
                placeholder="Enter workout description"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Exercises */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exercises ({selectedExercises.length})</Text>
              <TouchableOpacity
                onPress={() => setShowExerciseLibrary(true)}
                style={styles.addExerciseButton}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addExerciseText}>Add Exercise</Text>
              </TouchableOpacity>
            </View>

            {selectedExercises.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="fitness" size={48} color="#6B7280" />
                <Text style={styles.emptyTitle}>No Exercises Added</Text>
                <Text style={styles.emptyDescription}>
                  Add exercises to build your custom workout
                </Text>
              </View>
            ) : (
              (selectedExercises || []).map((exercise, index) => (
                <View key={exercise.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseMuscle}>{exercise.muscle}</Text>
                    <Text style={styles.exerciseEquipment}>{exercise.equipment}</Text>
                  </View>
                  
                  <View style={styles.exerciseActions}>
                    <TouchableOpacity
                      onPress={() => startEditingExercise(exercise)}
                      style={styles.editButton}
                    >
                      <Ionicons name="settings" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeExercise(exercise.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </LinearGradient>

      {renderExerciseLibrary()}
      {renderSetEditor()}
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
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.2)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(16, 185, 129, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 15,
    textShadowColor: 'rgba(16, 185, 129, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 8,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addExerciseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#10B981',
    textAlign: 'center',
    marginTop: 8,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  exerciseMuscle: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 4,
  },
  exerciseEquipment: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  libraryContainer: {
    flex: 1,
  },
  libraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  libraryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  searchIcon: {
    marginLeft: 8,
  },
  categoryScroll: {
    marginBottom: 15,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#374151',
    borderRadius: 20,
  },
  categoryButtonActive: {
    backgroundColor: '#10B981',
  },
  categoryButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  exerciseList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  setEditorContainer: {
    flex: 1,
  },
  setEditorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  setEditorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  setEditorContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  currentSetCard: {
    backgroundColor: '#374151',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  currentSetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  input: {
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
  },
  addSetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  setsList: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  setsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  setItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    width: 60,
  },
  setDetails: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
    marginLeft: 12,
  },
  restTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 12,
  },
  removeSetButton: {
    padding: 4,
  },
  doneButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

