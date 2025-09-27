import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  Vibration,
  StatusBar,
  PanResponder
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Exercise {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  equipment: string;
  muscle: string;
  instructions: string[];
  formTips: string[];
  commonMistakes: string[];
  videoUrl?: string;
  imageUrl?: string;
  caloriesPerMinute: number;
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

interface WorkoutSet {
  reps: number;
  weight: number;
  restTime: number;
  completed: boolean;
  completedAt?: Date;
  formScore?: number;
  rpe?: number;
  notes?: string;
}

interface ExerciseWithSets {
  exercise: Exercise;
  sets: WorkoutSet[];
}

interface FuturisticWorkoutExecutionProps {
  visible: boolean;
  onClose: () => void;
  workout: {
    id: string;
    name: string;
    exercises: ExerciseWithSets[];
  };
  currentExerciseIndex: number;
  onSetComplete: (exerciseId: string, setIndex: number, setData: WorkoutSet) => void;
  onExerciseComplete: (exerciseId: string) => void;
  onNextExercise: () => void;
  onPreviousExercise: () => void;
  onWorkoutComplete: () => void;
}

export default function FuturisticWorkoutExecution({
  visible,
  onClose,
  workout,
  currentExerciseIndex,
  onSetComplete,
  onExerciseComplete,
  onNextExercise,
  onPreviousExercise,
  onWorkoutComplete
}: FuturisticWorkoutExecutionProps) {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [showFormTips, setShowFormTips] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [rpe, setRpe] = useState(5);
  const [formScore, setFormScore] = useState(8);
  
  // Local state for current set values
  const [currentReps, setCurrentReps] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  
  // Set timer states
  const [isSetActive, setIsSetActive] = useState(false);
  const [setTimer, setSetTimer] = useState(0);
  const [setStartTime, setSetStartTime] = useState<Date | null>(null);
  const [currentSetData, setCurrentSetData] = useState<WorkoutSet | null>(null);
  
  // Workout timer
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Timer refs
  const setTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const workoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentExercise = workout.exercises[currentExerciseIndex];
  const totalSets = currentExercise.sets.length;
  const completedSets = currentExercise.sets.filter(set => set.completed).length;
  const progress = (completedSets / totalSets) * 100;

  useEffect(() => {
    if (visible) {
      startAnimations();
      startWorkoutTimer();
      initializeCurrentSet();
    }
    return () => {
      clearAllTimers();
    };
  }, [visible]);

  useEffect(() => {
    if (currentExercise) {
      initializeCurrentSet();
    }
  }, [currentExerciseIndex]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for active elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startWorkoutTimer = () => {
    setIsWorkoutActive(true);
    workoutTimerRef.current = setInterval(() => {
      setWorkoutTimer(prev => prev + 1);
    }, 1000);
  };

  const clearAllTimers = () => {
    if (setTimerRef.current) clearInterval(setTimerRef.current);
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
  };

  const initializeCurrentSet = () => {
    if (currentExercise && currentExercise.sets[currentSetIndex]) {
      const set = currentExercise.sets[currentSetIndex];
      setCurrentReps(set.reps);
      setCurrentWeight(set.weight);
      setCurrentSetData(set);
    }
  };

  const startSet = () => {
    setIsSetActive(true);
    setSetStartTime(new Date());
    setSetTimer(0);
    
    setTimerRef.current = setInterval(() => {
      setSetTimer(prev => prev + 1);
    }, 1000);

    Vibration.vibrate(100);
  };

  const completeSet = () => {
    if (!isSetActive) return;

    const setData: WorkoutSet = {
      reps: currentReps,
      weight: currentWeight,
      restTime: currentExercise.sets[currentSetIndex].restTime,
      completed: true,
      completedAt: new Date(),
      formScore: formScore,
      rpe: rpe,
      notes: notes
    };

    onSetComplete(currentExercise.exercise.id, currentSetIndex, setData);
    
    setIsSetActive(false);
    setSetTimer(0);
    if (setTimerRef.current) clearInterval(setTimerRef.current);

    // Start rest timer
    if (currentSetIndex < totalSets - 1) {
      startRestTimer();
    } else {
      // Exercise complete
      onExerciseComplete(currentExercise.exercise.id);
    }

    Vibration.vibrate([100, 50, 100]);
  };

  const startRestTimer = () => {
    setIsResting(true);
    setRestTimeRemaining(currentExercise.sets[currentSetIndex].restTime);
    
    restTimerRef.current = setInterval(() => {
      setRestTimeRemaining(prev => {
        if (prev <= 1) {
          setIsResting(false);
          setCurrentSetIndex(prev => prev + 1);
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimeRemaining(0);
    setCurrentSetIndex(prev => prev + 1);
    if (restTimerRef.current) clearInterval(restTimerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatWorkoutTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSetCounter = () => (
    <Animated.View
      style={[
        styles.setCounterContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.setCounterGradient}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: '#10B981'
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedSets}/{totalSets} sets completed
          </Text>
        </View>

        {/* Exercise Info */}
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{currentExercise.exercise.name}</Text>
          <Text style={styles.exerciseDetails}>
            Set {currentSetIndex + 1} of {totalSets}
          </Text>
        </View>

        {/* Set Controls */}
        <View style={styles.setControls}>
          <View style={styles.repsWeightContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reps</Text>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={styles.inputButton}
                  onPress={() => setCurrentReps(Math.max(1, currentReps - 1))}
                >
                  <Ionicons name="remove" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.inputValue}>{currentReps}</Text>
                <TouchableOpacity
                  style={styles.inputButton}
                  onPress={() => setCurrentReps(currentReps + 1)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (lbs)</Text>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={styles.inputButton}
                  onPress={() => setCurrentWeight(Math.max(0, currentWeight - 5))}
                >
                  <Ionicons name="remove" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.inputValue}>{currentWeight}</Text>
                <TouchableOpacity
                  style={styles.inputButton}
                  onPress={() => setCurrentWeight(currentWeight + 5)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {!isSetActive && !isResting && (
              <TouchableOpacity
                style={styles.startSetButton}
                onPress={startSet}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.startSetButtonGradient}
                >
                  <Ionicons name="play" size={24} color="#FFFFFF" />
                  <Text style={styles.startSetButtonText}>Start Set</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {isSetActive && (
              <Animated.View
                style={[
                  styles.activeSetContainer,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <TouchableOpacity
                  style={styles.completeSetButton}
                  onPress={completeSet}
                >
                  <LinearGradient
                    colors={['#EF4444', '#DC2626']}
                    style={styles.completeSetButtonGradient}
                  >
                    <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                    <Text style={styles.completeSetButtonText}>Complete Set</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.setTimerText}>
                  {formatTime(setTimer)}
                </Text>
              </Animated.View>
            )}

            {isResting && (
              <View style={styles.restContainer}>
                <Text style={styles.restText}>Rest Time</Text>
                <Text style={styles.restTimerText}>
                  {formatTime(restTimeRemaining)}
                </Text>
                <TouchableOpacity
                  style={styles.skipRestButton}
                  onPress={skipRest}
                >
                  <Text style={styles.skipRestText}>Skip Rest</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Additional Controls */}
        <View style={styles.additionalControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowFormTips(true)}
          >
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text style={styles.controlButtonText}>Form Tips</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowNotes(true)}
          >
            <Ionicons name="create" size={20} color="#8B5CF6" />
            <Text style={styles.controlButtonText}>Notes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              Alert.alert(
                'Rate Perceived Exertion',
                'How hard was this set?',
                [
                  { text: '1-3 (Easy)', onPress: () => setRpe(2) },
                  { text: '4-6 (Moderate)', onPress: () => setRpe(5) },
                  { text: '7-9 (Hard)', onPress: () => setRpe(8) },
                  { text: '10 (Max)', onPress: () => setRpe(10) }
                ]
              );
            }}
          >
            <Ionicons name="speedometer" size={20} color="#06B6D4" />
            <Text style={styles.controlButtonText}>RPE: {rpe}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderWorkoutHeader = () => (
    <View style={styles.workoutHeader}>
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <Text style={styles.workoutProgress}>
            Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
          </Text>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        <View style={styles.timerContainer}>
          <Ionicons name="time" size={16} color="#10B981" />
          <Text style={styles.timerText}>
            {formatWorkoutTime(workoutTimer)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderExerciseNavigation = () => (
    <View style={styles.exerciseNavigation}>
      <TouchableOpacity
        style={[
          styles.navButton,
          currentExerciseIndex === 0 && styles.navButtonDisabled
        ]}
        onPress={onPreviousExercise}
        disabled={currentExerciseIndex === 0}
      >
        <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        <Text style={styles.navButtonText}>Previous</Text>
      </TouchableOpacity>
      
      <View style={styles.exerciseIndicator}>
        <Text style={styles.exerciseIndicatorText}>
          {currentExerciseIndex + 1} / {workout.exercises.length}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[
          styles.navButton,
          currentExerciseIndex === workout.exercises.length - 1 && styles.navButtonDisabled
        ]}
        onPress={onNextExercise}
        disabled={currentExerciseIndex === workout.exercises.length - 1}
      >
        <Text style={styles.navButtonText}>Next</Text>
        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          
          {renderWorkoutHeader()}
          {renderSetCounter()}
          {renderExerciseNavigation()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#000000',
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 16,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  workoutProgress: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  setCounterContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  setCounterGradient: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  exerciseInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  exerciseDetails: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  setControls: {
    marginBottom: 24,
  },
  repsWeightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  inputGroup: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 4,
  },
  inputButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 20,
    minWidth: 60,
    textAlign: 'center',
  },
  actionButtons: {
    alignItems: 'center',
  },
  startSetButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  startSetButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 12,
  },
  startSetButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  activeSetContainer: {
    alignItems: 'center',
  },
  completeSetButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  completeSetButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 12,
  },
  completeSetButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  setTimerText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
  },
  restContainer: {
    alignItems: 'center',
  },
  restText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  restTimerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 16,
  },
  skipRestButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  skipRestText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  controlButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  exerciseNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  navButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  navButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  exerciseIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  exerciseIndicatorText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});







