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
  Image,
  Vibration,
  StatusBar
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
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
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

interface AdvancedExerciseLoggerProps {
  visible: boolean;
  onClose: () => void;
  exercise: ExerciseWithSets;
  onSetComplete: (exerciseId: string, setIndex: number, setData: WorkoutSet) => void;
  onExerciseComplete: (exerciseId: string) => void;
  onNextExercise: () => void;
  onPreviousExercise: () => void;
  currentExerciseIndex: number;
  totalExercises: number;
  workoutName: string;
}

export default function AdvancedExerciseLogger({
  visible,
  onClose,
  exercise,
  onSetComplete,
  onExerciseComplete,
  onNextExercise,
  onPreviousExercise,
  currentExerciseIndex,
  totalExercises,
  workoutName
}: AdvancedExerciseLoggerProps) {
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
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimeRemaining > 0) {
      interval = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev <= 1) {
            setIsResting(false);
            Vibration.vibrate([200, 100, 200]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeRemaining]);

  // Set timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSetActive && setStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - setStartTime.getTime()) / 1000);
        setSetTimer(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSetActive, setStartTime]);

  // Animation effects
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
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Pulse animation for active set
  useEffect(() => {
    if (exercise?.sets && currentSetIndex < exercise.sets.length && !exercise.sets[currentSetIndex].completed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
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
    }
  }, [currentSetIndex, exercise?.sets]);

  // Progress animation
  useEffect(() => {
    if (exercise?.sets && exercise.sets.length > 0) {
      const completedSets = exercise.sets.filter(set => set.completed).length;
      const progress = completedSets / exercise.sets.length;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [exercise?.sets]);

  // Initialize current set values when set changes
  useEffect(() => {
    if (exercise?.sets && currentSetIndex < exercise.sets.length) {
      const currentSet = exercise.sets[currentSetIndex];
      setCurrentReps(currentSet.reps);
      setCurrentWeight(currentSet.weight);
    }
  }, [currentSetIndex, exercise?.sets]);

  const startRestTimer = (restTime: number) => {
    setRestTimeRemaining(restTime);
    setIsResting(true);
  };

  const startSet = () => {
    if (!exercise?.sets || currentSetIndex >= exercise.sets.length) return;

    const currentSet = exercise.sets[currentSetIndex];
    setCurrentSetData({
      ...currentSet,
      reps: currentReps,
      weight: currentWeight,
      restTime: currentSet.restTime,
      completed: false
    });

    setIsSetActive(true);
    setSetStartTime(new Date());
    setSetTimer(0);
    Vibration.vibrate(50);
  };

  const stopSet = () => {
    if (!isSetActive || !currentSetData) return;

    setIsSetActive(false);
    setSetStartTime(null);

    const setData = {
      ...currentSetData,
      reps: currentReps,
      weight: currentWeight,
      completed: true,
      completedAt: new Date(),
      formScore,
      rpe,
      notes: notes.trim() || undefined,
      setDuration: setTimer
    };

    onSetComplete(exercise?.exercise?.id || '', currentSetIndex, setData);

    // Move to next set or complete exercise
    if (exercise?.sets && currentSetIndex < exercise.sets.length - 1) {
      const nextSet = exercise.sets[currentSetIndex + 1];
      if (nextSet.restTime > 0) {
        startRestTimer(nextSet.restTime);
      }
      setCurrentSetIndex(prev => prev + 1);
    } else {
      // Exercise completed
      onExerciseComplete(exercise?.exercise?.id || '');
    }

    Vibration.vibrate(100);
  };

  const completeSet = () => {
    if (isSetActive) {
      stopSet();
    } else {
      startSet();
    }
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimeRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSetStatus = (setIndex: number) => {
    if (setIndex < currentSetIndex) return 'completed';
    if (setIndex === currentSetIndex) return 'current';
    return 'pending';
  };

  const getMuscleColor = (muscle: string) => {
    const colors = {
      'chest': '#FF6B6B',
      'back': '#4ECDC4',
      'shoulders': '#45B7D1',
      'arms': '#96CEB4',
      'legs': '#FFEAA7',
      'core': '#DDA0DD',
      'glutes': '#98D8C8',
    };
    return colors[muscle.toLowerCase()] || '#6B7280';
  };

  const renderExerciseVisualization = () => (
    <View style={styles.visualizationContainer}>
      <View style={styles.exerciseImageContainer}>
        {exercise?.exercise?.imageUrl ? (
          <Image
            source={{ uri: exercise.exercise.imageUrl }}
            style={styles.exerciseImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.exercisePlaceholder}>
            <Ionicons name="fitness" size={80} color="#10B981" />
            <Text style={styles.exercisePlaceholderText}>
              {exercise?.exercise?.name || 'Exercise'}
            </Text>
          </View>
        )}
        
        {/* Muscle groups overlay */}
        <View style={styles.muscleOverlay}>
          {(exercise?.exercise?.primaryMuscles || []).map((muscle, index) => (
            <View
              key={muscle}
              style={[
                styles.muscleBadge,
                { backgroundColor: getMuscleColor(muscle) }
              ]}
            >
              <Text style={styles.muscleText}>{muscle}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderSetTracker = () => (
    <View style={styles.setTrackerContainer}>
      <View style={styles.setTrackerHeader}>
        <Text style={styles.setTrackerTitle}>Sets & Reps</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {(exercise?.sets || []).filter(set => set.completed).length}/{(exercise?.sets || []).length}
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.setsContainer}>
        {(exercise?.sets || []).map((set, index) => {
          const status = getSetStatus(index);
          const isCurrent = status === 'current';
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.setCard,
                status === 'completed' && styles.completedSetCard,
                isCurrent && styles.currentSetCard,
                isCurrent && { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <View style={styles.setHeader}>
                <Text style={[
                  styles.setNumber,
                  status === 'completed' && styles.completedSetNumber,
                  isCurrent && styles.currentSetNumber
                ]}>
                  {index + 1}
                </Text>
                {status === 'completed' && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
              </View>
              
              <View style={styles.setDetails}>
                <Text style={[
                  styles.setReps,
                  status === 'completed' && styles.completedText,
                  isCurrent && styles.currentText
                ]}>
                  {set.reps} reps
                </Text>
                <Text style={[
                  styles.setWeight,
                  status === 'completed' && styles.completedText,
                  isCurrent && styles.currentText
                ]}>
                  {set.weight} lbs
                </Text>
                {set.restTime > 0 && (
                  <Text style={[
                    styles.setRest,
                    status === 'completed' && styles.completedText,
                    isCurrent && styles.currentText
                  ]}>
                    {formatTime(set.restTime)} rest
                  </Text>
                )}
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderCurrentSetControls = () => {
    if (!exercise?.sets || currentSetIndex >= exercise.sets.length) return null;

    const currentSet = exercise.sets[currentSetIndex];
    
    return (
      <View style={styles.currentSetContainer}>
        <Text style={styles.currentSetTitle}>
          Set {currentSetIndex + 1} of {exercise?.sets?.length || 0}
        </Text>
        
        <View style={styles.setInputsContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reps</Text>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={styles.inputButton}
                onPress={() => {
                  if (currentReps > 1) {
                    setCurrentReps(prev => prev - 1);
                  }
                }}
              >
                <Ionicons name="remove" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.inputValue}>{currentReps}</Text>
              <TouchableOpacity
                style={styles.inputButton}
                onPress={() => {
                  setCurrentReps(prev => prev + 1);
                }}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight (lbs)</Text>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={styles.inputButton}
                onPress={() => {
                  if (currentWeight > 0) {
                    setCurrentWeight(prev => prev - 5);
                  }
                }}
              >
                <Ionicons name="remove" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.inputValue}>{currentWeight}</Text>
              <TouchableOpacity
                style={styles.inputButton}
                onPress={() => {
                  setCurrentWeight(prev => prev + 5);
                }}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.additionalInputs}>
          <TouchableOpacity
            style={styles.additionalButton}
            onPress={() => setShowFormTips(true)}
          >
            <Ionicons name="body" size={16} color="#10B981" />
            <Text style={styles.additionalButtonText}>Form Tips</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.additionalButton}
            onPress={() => setShowNotes(true)}
          >
            <Ionicons name="create" size={16} color="#10B981" />
            <Text style={styles.additionalButtonText}>Notes</Text>
          </TouchableOpacity>

          <View style={styles.rpeContainer}>
            <Text style={styles.rpeLabel}>RPE</Text>
            <View style={styles.rpeSlider}>
              <TouchableOpacity
                style={styles.rpeButton}
                onPress={() => setRpe(Math.max(1, rpe - 1))}
              >
                <Ionicons name="remove" size={16} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.rpeValue}>{rpe}</Text>
              <TouchableOpacity
                style={styles.rpeButton}
                onPress={() => setRpe(Math.min(10, rpe + 1))}
              >
                <Ionicons name="add" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Set Timer Display */}
        {isSetActive && (
          <View style={styles.setTimerContainer}>
            <Text style={styles.setTimerLabel}>Set Timer</Text>
            <Text style={styles.setTimerText}>
              {Math.floor(setTimer / 60)}:{(setTimer % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.completeSetButton,
            isSetActive && styles.stopSetButton
          ]}
          onPress={completeSet}
        >
          <LinearGradient
            colors={isSetActive ? ['#EF4444', '#DC2626'] : ['#10B981', '#059669']}
            style={styles.completeSetGradient}
          >
            <Ionicons 
              name={isSetActive ? "stop" : "play"} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.completeSetText}>
              {isSetActive ? 'Stop Set' : 'Start Set'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRestTimer = () => {
    if (!isResting) return null;

    return (
      <View style={styles.restTimerContainer}>
        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          style={styles.restTimerGradient}
        >
          <View style={styles.restTimerContent}>
            <Ionicons name="timer" size={48} color="#fff" />
            <Text style={styles.restTimerTitle}>Rest Time</Text>
            <Text style={styles.restTimerTime}>
              {formatTime(restTimeRemaining)}
            </Text>
            <Text style={styles.restTimerSubtitle}>
              Next: {exercise?.sets?.[currentSetIndex + 1]?.reps || 0} reps
            </Text>
            
            <View style={styles.restTimerActions}>
              <TouchableOpacity
                style={styles.skipRestButton}
                onPress={skipRest}
              >
                <Text style={styles.skipRestText}>Skip Rest</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="transparent" translucent />
      <LinearGradient colors={['#0F172A', '#020617', '#000000']} style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.workoutName}>{workoutName}</Text>
              <Text style={styles.exerciseName}>{exercise?.exercise?.name || 'Exercise'}</Text>
              <Text style={styles.exerciseProgress}>
                Exercise {currentExerciseIndex + 1} of {totalExercises}
              </Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={onPreviousExercise}
                disabled={currentExerciseIndex === 0}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={currentExerciseIndex === 0 ? "#6B7280" : "#fff"}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.navButton}
                onPress={onNextExercise}
                disabled={currentExerciseIndex === totalExercises - 1}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={currentExerciseIndex === totalExercises - 1 ? "#6B7280" : "#fff"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Exercise Visualization */}
            {renderExerciseVisualization()}

            {/* Set Tracker */}
            {renderSetTracker()}

            {/* Current Set Controls */}
            {renderCurrentSetControls()}

            {/* Rest Timer */}
            {renderRestTimer()}
          </ScrollView>
        </Animated.View>

        {/* Form Tips Modal */}
        <Modal
          visible={showFormTips}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <LinearGradient colors={['#0F172A', '#020617', '#000000']} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowFormTips(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Form Tips</Text>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {(exercise?.exercise?.formTips || []).map((tip, index) => (
                <View key={index} style={styles.tipCard}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </ScrollView>
          </LinearGradient>
        </Modal>

        {/* Notes Modal */}
        <Modal
          visible={showNotes}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <LinearGradient colors={['#0F172A', '#020617', '#000000']} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowNotes(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Set Notes</Text>
            </View>
            
            <View style={styles.modalContent}>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes for this set..."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={4}
              />
              
              <TouchableOpacity
                style={styles.saveNotesButton}
                onPress={() => setShowNotes(false)}
              >
                <Text style={styles.saveNotesText}>Save Notes</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Modal>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  exerciseName: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  exerciseProgress: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  visualizationContainer: {
    marginBottom: 24,
  },
  exerciseImageContainer: {
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  exercisePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exercisePlaceholderText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  muscleOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  muscleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  setTrackerContainer: {
    marginBottom: 24,
  },
  setTrackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  setTrackerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    width: 100,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  setsContainer: {
    flexDirection: 'row',
  },
  setCard: {
    width: 120,
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  completedSetCard: {
    backgroundColor: '#10B98120',
    borderColor: '#10B981',
  },
  currentSetCard: {
    backgroundColor: '#F59E0B20',
    borderColor: '#F59E0B',
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  completedSetNumber: {
    color: '#10B981',
  },
  currentSetNumber: {
    color: '#F59E0B',
  },
  setDetails: {
    gap: 4,
  },
  setReps: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  setWeight: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  setRest: {
    fontSize: 12,
    color: '#6B7280',
  },
  completedText: {
    color: '#10B981',
  },
  currentText: {
    color: '#F59E0B',
  },
  currentSetContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  currentSetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  setInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  inputGroup: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  inputButton: {
    padding: 14,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 16,
    minWidth: 40,
    textAlign: 'center',
  },
  additionalInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  additionalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  additionalButtonText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  rpeContainer: {
    alignItems: 'center',
  },
  rpeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  rpeSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  rpeButton: {
    padding: 6,
  },
  rpeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  completeSetButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  completeSetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  completeSetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  restTimerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  restTimerGradient: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    minWidth: 280,
  },
  restTimerContent: {
    alignItems: 'center',
  },
  restTimerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  restTimerTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  restTimerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 8,
  },
  restTimerActions: {
    marginTop: 24,
  },
  skipRestButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  skipRestText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  tipText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  notesInput: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  saveNotesButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveNotesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Set Timer Styles
  setTimerContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  setTimerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  setTimerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  stopSetButton: {
    // Additional styles for stop button if needed
  },
});
