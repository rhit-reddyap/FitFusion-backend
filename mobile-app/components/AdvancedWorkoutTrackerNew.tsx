import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  TextInput,
  SafeAreaView,
  Dimensions,
  StatusBar,
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
  instructions: string;
  videoUrl: string;
}

interface WorkoutSet {
  reps: number;
  weight: number;
  restTime: number;
  completed: boolean;
  actualReps: number;
  actualWeight: number;
}

interface CustomWorkout {
  id: string;
  name: string;
  description: string;
  exercises: {
    exercise: Exercise;
    sets: WorkoutSet[];
  }[];
  createdAt: Date;
  lastUsed?: Date;
}

interface WorkoutData {
  startTime: Date;
  endTime: Date | null;
  totalTime: number;
  timeSpentLifting: number;
  totalTonnage: number;
  tonnagePerMuscleGroup: { [key: string]: number };
  exercises: {
    exercise: Exercise;
    sets: WorkoutSet[];
  }[];
}

interface AdvancedWorkoutTrackerProps {
  onBack: () => void;
  navigation?: any;
}

export default function AdvancedWorkoutTracker({ onBack, navigation }: AdvancedWorkoutTrackerProps) {
  // State variables
  const [customWorkouts, setCustomWorkouts] = useState<CustomWorkout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<CustomWorkout | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showEndWorkoutModal, setShowEndWorkoutModal] = useState(false);
  const [showWorkoutSummary, setShowWorkoutSummary] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load custom workouts on component mount
  useEffect(() => {
    loadCustomWorkouts();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && workoutStartTime) {
      timerRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - workoutStartTime.getTime()) / 1000);
        setWorkoutTimer(elapsed);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, workoutStartTime]);

  const loadCustomWorkouts = async () => {
    try {
      const workouts = await DataStorage.getCustomWorkouts();
      setCustomWorkouts(workouts);
    } catch (error) {
      console.error('Error loading custom workouts:', error);
    }
  };

  const handleStartWorkout = (workout: CustomWorkout) => {
    setActiveWorkout(workout);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setWorkoutStartTime(new Date());
    setWorkoutTimer(0);
    setIsTimerRunning(true);
    setShowWorkoutModal(true);
    
    // Initialize workout data
    const initialWorkoutData: WorkoutData = {
      startTime: new Date(),
      endTime: null,
      totalTime: 0,
      timeSpentLifting: 0,
      totalTonnage: 0,
      tonnagePerMuscleGroup: {},
      exercises: workout.exercises.map(ex => ({
        ...ex,
        sets: (ex.sets || []).map(set => ({ 
          ...set, 
          completed: false, 
          actualReps: set.reps, 
          actualWeight: set.weight 
        }))
      }))
    };
    setWorkoutData(initialWorkoutData);
  };

  const updateSetData = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
    if (!workoutData) return;
    
    const updatedWorkoutData = { ...workoutData };
    const exercise = updatedWorkoutData.exercises[exerciseIndex];
    if (exercise && exercise.sets && exercise.sets[setIndex]) {
      if (field === 'reps') {
        exercise.sets[setIndex].actualReps = value;
      } else {
        exercise.sets[setIndex].actualWeight = value;
      }
      setWorkoutData(updatedWorkoutData);
    }
  };

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    if (!workoutData) return;
    
    const updatedWorkoutData = { ...workoutData };
    const exercise = updatedWorkoutData.exercises[exerciseIndex];
    if (!exercise || !exercise.sets || !exercise.sets[setIndex]) return;
    
    const set = exercise.sets[setIndex];
    set.completed = true;
    
    // Calculate tonnage
    const tonnage = set.actualReps * set.actualWeight;
    updatedWorkoutData.totalTonnage += tonnage;
    
    // Add to muscle group tonnage
    const muscles = exercise.exercise.muscle.split(',').map(m => m.trim());
    muscles.forEach(muscle => {
      updatedWorkoutData.tonnagePerMuscleGroup[muscle] = 
        (updatedWorkoutData.tonnagePerMuscleGroup[muscle] || 0) + tonnage;
    });
    
    setWorkoutData(updatedWorkoutData);
    
    // Move to next set or exercise
    if (setIndex < (exercise.sets || []).length - 1) {
      setCurrentSetIndex(setIndex + 1);
    } else if (exerciseIndex < updatedWorkoutData.exercises.length - 1) {
      setCurrentExerciseIndex(exerciseIndex + 1);
      setCurrentSetIndex(0);
    }
  };

  const navigateToExercise = (exerciseIndex: number) => {
    setCurrentExerciseIndex(exerciseIndex);
    setCurrentSetIndex(0);
  };

  const navigateToSet = (exerciseIndex: number, setIndex: number) => {
    setCurrentExerciseIndex(exerciseIndex);
    setCurrentSetIndex(setIndex);
  };

  const endWorkout = () => {
    if (!workoutData || !workoutStartTime) return;
    
    const endTime = new Date();
    const totalTime = Math.floor((endTime.getTime() - workoutStartTime.getTime()) / 1000);
    
    const updatedWorkoutData = {
      ...workoutData,
      endTime,
      totalTime
    };
    
    setWorkoutData(updatedWorkoutData);
    setShowWorkoutSummary(true);
    setShowWorkoutModal(false);
    setIsTimerRunning(false);
  };

  const saveWorkout = async () => {
    if (!workoutData || !activeWorkout) return;
    
    try {
      const workoutLog = {
        id: Date.now().toString(),
        workoutId: activeWorkout.id,
        workoutName: activeWorkout.name,
        date: workoutData.startTime,
        duration: workoutData.totalTime,
        totalTonnage: workoutData.totalTonnage,
        tonnagePerMuscleGroup: workoutData.tonnagePerMuscleGroup,
        exercises: workoutData.exercises.map(ex => ({
          exerciseName: ex.exercise.name,
          setsCompleted: ex.sets.filter(s => s.completed).length,
          totalSets: ex.sets.length
        }))
      };
      
      await DataStorage.saveWorkoutLog(workoutLog);
      
      // Reset state
      setActiveWorkout(null);
      setWorkoutData(null);
      setShowWorkoutSummary(false);
      setShowEndWorkoutModal(false);
      setWorkoutStartTime(null);
      setWorkoutTimer(0);
      setCurrentExerciseIndex(0);
      setCurrentSetIndex(0);
      
      Alert.alert('Success', 'Workout saved successfully!');
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  const cancelWorkout = () => {
    setShowEndWorkoutModal(false);
  };

  const deleteWorkout = () => {
    setShowEndWorkoutModal(false);
    setShowWorkoutModal(false);
    setActiveWorkout(null);
    setWorkoutData(null);
    setWorkoutStartTime(null);
    setWorkoutTimer(0);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setIsTimerRunning(false);
    Alert.alert('Workout Deleted', 'Workout has been deleted');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderActiveWorkout = () => {
    if (!activeWorkout || !workoutData) return null;

    const currentExercise = workoutData.exercises[currentExerciseIndex];
    const currentSet = currentExercise?.sets[currentSetIndex];

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showWorkoutModal}
        onRequestClose={() => setShowEndWorkoutModal(true)}
      >
        <LinearGradient colors={['#0A0A0A', '#1A1A1A', '#0F0F0F']} style={styles.modalGradient}>
          <SafeAreaView style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.workoutHeader}>
              <TouchableOpacity 
                style={styles.endWorkoutButton}
                onPress={() => setShowEndWorkoutModal(true)}
              >
                <Ionicons name="stop-circle" size={24} color="#EF4444" />
                <Text style={styles.endWorkoutText}>End Workout</Text>
              </TouchableOpacity>
              
              <View style={styles.workoutTitleContainer}>
                <Text style={styles.workoutTitle}>{activeWorkout.name}</Text>
                <Text style={styles.workoutTimer}>{formatTime(workoutTimer)}</Text>
              </View>
              
              <View style={styles.placeholder} />
            </View>

            {/* Exercise Navigation */}
            <View style={styles.exerciseNavigation}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {workoutData.exercises.map((exercise, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.exerciseNavItem,
                      index === currentExerciseIndex && styles.activeExerciseNavItem
                    ]}
                    onPress={() => navigateToExercise(index)}
                  >
                    <Text style={[
                      styles.exerciseNavText,
                      index === currentExerciseIndex && styles.activeExerciseNavText
                    ]}>
                      {exercise.exercise.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Current Exercise */}
            <View style={styles.currentExerciseContainer}>
              <Text style={styles.currentExerciseName}>{currentExercise.exercise.name}</Text>
              <Text style={styles.currentExerciseCategory}>{currentExercise.exercise.category}</Text>
              
              {/* Set Navigation */}
              <View style={styles.setNavigation}>
                {currentExercise.sets.map((set, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.setNavItem,
                      index === currentSetIndex && styles.activeSetNavItem,
                      set.completed && styles.completedSetNavItem
                    ]}
                    onPress={() => navigateToSet(currentExerciseIndex, index)}
                  >
                    <Text style={[
                      styles.setNavText,
                      index === currentSetIndex && styles.activeSetNavText,
                      set.completed && styles.completedSetNavText
                    ]}>
                      {index + 1}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Current Set Input */}
              <View style={styles.currentSetContainer}>
                <Text style={styles.setNumber}>Set {currentSetIndex + 1}</Text>
                
                <View style={styles.setInputs}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <TextInput
                      style={styles.numericInput}
                      value={currentSet.actualReps.toString()}
                      onChangeText={(text) => updateSetData(currentExerciseIndex, currentSetIndex, 'reps', parseInt(text) || 0)}
                      keyboardType="numeric"
                      textAlign="center"
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Weight (lbs)</Text>
                    <TextInput
                      style={styles.numericInput}
                      value={currentSet.actualWeight.toString()}
                      onChangeText={(text) => updateSetData(currentExerciseIndex, currentSetIndex, 'weight', parseInt(text) || 0)}
                      keyboardType="numeric"
                      textAlign="center"
                    />
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[styles.completeSetButton, currentSet.completed && styles.completedSetButton]}
                  onPress={() => completeSet(currentExerciseIndex, currentSetIndex)}
                >
                  <Ionicons 
                    name={currentSet.completed ? "checkmark-circle" : "play-circle"} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.completeSetText}>
                    {currentSet.completed ? 'Completed' : 'Complete Set'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Progress Summary */}
            <View style={styles.progressSummary}>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Total Tonnage</Text>
                <Text style={styles.progressValue}>{workoutData.totalTonnage.toLocaleString()} lbs</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Sets Completed</Text>
                <Text style={styles.progressValue}>
                  {workoutData.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0)} / 
                  {workoutData.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Modal>
    );
  };

  const renderEndWorkoutModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showEndWorkoutModal}
        onRequestClose={() => setShowEndWorkoutModal(false)}
      >
        <View style={styles.endWorkoutModal}>
          <View style={styles.endWorkoutModalContent}>
            <Text style={styles.endWorkoutModalTitle}>End Workout?</Text>
            <Text style={styles.endWorkoutModalText}>
              What would you like to do with this workout?
            </Text>
            
            <View style={styles.endWorkoutActions}>
              <TouchableOpacity 
                style={styles.endWorkoutActionButton}
                onPress={cancelWorkout}
              >
                <Text style={styles.endWorkoutActionText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.endWorkoutActionButton, styles.deleteButton]}
                onPress={deleteWorkout}
              >
                <Text style={[styles.endWorkoutActionText, styles.deleteButtonText]}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.endWorkoutActionButton, styles.saveButton]}
                onPress={endWorkout}
              >
                <Text style={[styles.endWorkoutActionText, styles.saveButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderWorkoutSummary = () => {
    if (!workoutData || !activeWorkout) return null;

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showWorkoutSummary}
        onRequestClose={() => setShowWorkoutSummary(false)}
      >
        <LinearGradient colors={['#0A0A0A', '#1A1A1A', '#0F0F0F']} style={styles.modalGradient}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.workoutSummaryHeader}>
              <Text style={styles.workoutSummaryTitle}>Workout Complete!</Text>
              <Text style={styles.workoutSummarySubtitle}>{activeWorkout.name}</Text>
            </View>

            <ScrollView style={styles.workoutSummaryContent}>
              {/* Time Summary */}
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>Time Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Time:</Text>
                  <Text style={styles.summaryValue}>{formatTime(workoutData.totalTime)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Time Spent Lifting:</Text>
                  <Text style={styles.summaryValue}>{formatTime(workoutData.timeSpentLifting)}</Text>
                </View>
              </View>

              {/* Tonnage Summary */}
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>Tonnage Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Tonnage:</Text>
                  <Text style={styles.summaryValue}>{workoutData.totalTonnage.toLocaleString()} lbs</Text>
                </View>
              </View>

              {/* Tonnage by Muscle Group */}
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>Tonnage by Muscle Group</Text>
                {Object.entries(workoutData.tonnagePerMuscleGroup).map(([muscle, tonnage]) => (
                  <View key={muscle} style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{muscle}:</Text>
                    <Text style={styles.summaryValue}>{tonnage.toLocaleString()} lbs</Text>
                  </View>
                ))}
              </View>

              {/* Exercise Breakdown */}
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>Exercise Breakdown</Text>
                {workoutData.exercises.map((exercise, index) => (
                  <View key={index} style={styles.exerciseSummary}>
                    <Text style={styles.exerciseSummaryName}>{exercise.exercise.name}</Text>
                    <Text style={styles.exerciseSummarySets}>
                      {exercise.sets.filter(s => s.completed).length} / {exercise.sets.length} sets completed
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={styles.workoutSummaryActions}>
              <TouchableOpacity 
                style={styles.saveWorkoutButton}
                onPress={saveWorkout}
              >
                <Text style={styles.saveWorkoutButtonText}>Save Workout</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Tracker</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>My Workouts</Text>
        
        {customWorkouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No workouts created yet</Text>
            <Text style={styles.emptyStateSubtext}>Create your first workout to get started</Text>
          </View>
        ) : (
          <View style={styles.workoutGrid}>
            {customWorkouts.slice(0, 4).map((workout) => (
              <TouchableOpacity
                key={workout.id}
                style={styles.workoutCard}
                onPress={() => handleStartWorkout(workout)}
              >
                <Text style={styles.workoutCardTitle}>{workout.name}</Text>
                <Text style={styles.workoutCardDescription}>{workout.description}</Text>
                <Text style={styles.workoutCardExercises}>
                  {workout.exercises.length} exercises
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {renderActiveWorkout()}
      {renderEndWorkoutModal()}
      {renderWorkoutSummary()}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#1A1A1A',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888888',
  },
  workoutGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
  },
  workoutCard: {
    width: (width - 60) / 2,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  workoutCardTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  workoutCardDescription: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 8,
  },
  workoutCardExercises: {
    fontSize: 12,
    color: '#10B981',
  },
  modalGradient: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  workoutHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
  },
  endWorkoutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  endWorkoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginLeft: 8,
  },
  workoutTitleContainer: {
    alignItems: 'center' as const,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutTimer: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold' as const,
  },
  exerciseNavigation: {
    marginBottom: 20,
  },
  exerciseNavItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  activeExerciseNavItem: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  exerciseNavText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  activeExerciseNavText: {
    color: '#FFFFFF',
    fontWeight: 'bold' as const,
  },
  currentExerciseContainer: {
    flex: 1,
    alignItems: 'center' as const,
  },
  currentExerciseName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  currentExerciseCategory: {
    fontSize: 16,
    color: '#10B981',
    marginBottom: 30,
  },
  setNavigation: {
    flexDirection: 'row' as const,
    marginBottom: 30,
  },
  setNavItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#333333',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginHorizontal: 4,
  },
  activeSetNavItem: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  completedSetNavItem: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  setNavText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  activeSetNavText: {
    color: '#FFFFFF',
  },
  completedSetNavText: {
    color: '#FFFFFF',
  },
  currentSetContainer: {
    alignItems: 'center' as const,
    width: '100%',
  },
  setNumber: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
    fontWeight: 'bold' as const,
  },
  setInputs: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    width: '100%',
    marginBottom: 30,
  },
  inputGroup: {
    alignItems: 'center' as const,
  },
  inputLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  numericInput: {
    width: 80,
    height: 50,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  completeSetButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  completedSetButton: {
    backgroundColor: '#059669',
  },
  completeSetText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginLeft: 8,
  },
  progressSummary: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  progressItem: {
    alignItems: 'center' as const,
  },
  progressLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold' as const,
  },
  endWorkoutModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  endWorkoutModalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 24,
    width: width * 0.8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  endWorkoutModalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  endWorkoutModalText: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 24,
    textAlign: 'center' as const,
  },
  endWorkoutActions: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  endWorkoutActionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#333333',
    alignItems: 'center' as const,
  },
  endWorkoutActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  workoutSummaryHeader: {
    alignItems: 'center' as const,
    marginBottom: 30,
  },
  workoutSummaryTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  workoutSummarySubtitle: {
    fontSize: 16,
    color: '#10B981',
  },
  workoutSummaryContent: {
    flex: 1,
  },
  summarySection: {
    marginBottom: 24,
  },
  summarySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888888',
  },
  summaryValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold' as const,
  },
  exerciseSummary: {
    marginBottom: 8,
  },
  exerciseSummaryName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold' as const,
  },
  exerciseSummarySets: {
    fontSize: 12,
    color: '#888888',
  },
  workoutSummaryActions: {
    paddingVertical: 20,
  },
  saveWorkoutButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  saveWorkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
};




