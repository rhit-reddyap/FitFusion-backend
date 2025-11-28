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
  Animated,
  Easing,
  Vibration
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataStorage } from '../utils/dataStorage';
import ExerciseSearch from './ExerciseSearch';
import { Exercise } from '../services/exerciseApiService';

const { width, height } = Dimensions.get('window');

interface BeginnerWorkoutTrackerProps {
  onBack: () => void;
}

interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  weight: number;
  restTime: number; // in seconds
  completedSets: number;
  isCompleted: boolean;
}

interface ActiveWorkout {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  startTime: Date;
  currentExerciseIndex: number;
  isActive: boolean;
}

export default function BeginnerWorkoutTracker({ onBack }: BeginnerWorkoutTrackerProps) {
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [currentSet, setCurrentSet] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [showWorkoutSummary, setShowWorkoutSummary] = useState(false);
  const [workoutStats, setWorkoutStats] = useState<any>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const startNewWorkout = () => {
    const newWorkout: ActiveWorkout = {
      id: Date.now().toString(),
      name: 'Custom Workout',
      exercises: [],
      startTime: new Date(),
      currentExerciseIndex: 0,
      isActive: true,
    };
    setActiveWorkout(newWorkout);
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    if (!activeWorkout) return;

    const workoutExercise: WorkoutExercise = {
      id: `${exercise.id}_${Date.now()}`,
      exercise,
      sets: 3,
      reps: 10,
      weight: 0,
      restTime: 60,
      completedSets: 0,
      isCompleted: false,
    };

    const updatedWorkout = {
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, workoutExercise],
    };

    setActiveWorkout(updatedWorkout);
    setShowExerciseSearch(false);
  };

  const startWorkout = () => {
    if (!activeWorkout || activeWorkout.exercises.length === 0) {
      Alert.alert('No Exercises', 'Please add at least one exercise to start your workout.');
      return;
    }

    setCurrentSet(0);
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const completeSet = () => {
    if (!activeWorkout) return;

    const currentExercise = activeWorkout.exercises[activeWorkout.currentExerciseIndex];
    const updatedExercises = [...activeWorkout.exercises];
    updatedExercises[activeWorkout.currentExerciseIndex] = {
      ...currentExercise,
      completedSets: currentExercise.completedSets + 1,
    };

    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises,
    });

    // Check if all sets are completed
    if (currentExercise.completedSets + 1 >= currentExercise.sets) {
      // Move to next exercise or finish workout
      if (activeWorkout.currentExerciseIndex < activeWorkout.exercises.length - 1) {
        setActiveWorkout({
          ...activeWorkout,
          currentExerciseIndex: activeWorkout.currentExerciseIndex + 1,
          exercises: updatedExercises,
        });
        setCurrentSet(0);
      } else {
        finishWorkout();
      }
    } else {
      setCurrentSet(currentSet + 1);
    }

    // Start rest timer
    if (currentExercise.restTime > 0) {
      startRestTimer(currentExercise.restTime);
    }

    Vibration.vibrate(100);
  };

  const startRestTimer = (seconds: number) => {
    setIsResting(true);
    setRestTimeLeft(seconds);

    const timer = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsResting(false);
          Vibration.vibrate([200, 100, 200]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const finishWorkout = async () => {
    if (!activeWorkout) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - activeWorkout.startTime.getTime()) / 1000 / 60);
    
    const stats = {
      duration,
      exercisesCompleted: activeWorkout.exercises.filter(ex => ex.completedSets > 0).length,
      totalSets: activeWorkout.exercises.reduce((sum, ex) => sum + ex.completedSets, 0),
      caloriesBurned: Math.round(duration * 8), // Rough estimate
    };

    setWorkoutStats(stats);
    setShowWorkoutSummary(true);

    // Save workout to storage
    await DataStorage.addWorkoutLog(
      new Date().toISOString().split('T')[0],
      {
        name: activeWorkout.name,
        duration,
        exercises: activeWorkout.exercises.map(ex => ({
          name: ex.exercise.name,
          sets: ex.completedSets,
          reps: ex.reps,
          weight: ex.weight,
        })),
        caloriesBurned: stats.caloriesBurned,
      }
    );

    setActiveWorkout(null);
  };

  const renderExerciseCard = (exercise: WorkoutExercise, index: number) => {
    const isCurrent = activeWorkout?.currentExerciseIndex === index;
    const isCompleted = exercise.completedSets >= exercise.sets;

    return (
      <View key={exercise.id} style={[styles.exerciseCard, isCurrent && styles.currentExerciseCard]}>
        <LinearGradient
          colors={isCompleted ? ['#10B981', '#059669'] : isCurrent ? ['#3B82F6', '#1D4ED8'] : ['#1F2937', '#111827']}
          style={styles.exerciseCardGradient}
        >
          <View style={styles.exerciseCardHeader}>
            <Text style={styles.exerciseName} numberOfLines={2}>
              {exercise.exercise.name}
            </Text>
            <View style={styles.exerciseMeta}>
              <Text style={styles.exerciseCategory}>{exercise.exercise.category}</Text>
              <View style={[styles.difficultyBadge, styles[`difficulty${exercise.exercise.difficulty}`]]}>
                <Text style={styles.difficultyText}>{exercise.exercise.difficulty}</Text>
              </View>
            </View>
          </View>

          <View style={styles.exerciseStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{exercise.completedSets}/{exercise.sets}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{exercise.reps}</Text>
              <Text style={styles.statLabel}>Reps</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{exercise.weight}kg</Text>
              <Text style={styles.statLabel}>Weight</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{exercise.restTime}s</Text>
              <Text style={styles.statLabel}>Rest</Text>
            </View>
          </View>

          {isCurrent && !isCompleted && (
            <TouchableOpacity
              style={styles.completeSetButton}
              onPress={completeSet}
            >
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.completeSetText}>Complete Set {currentSet + 1}</Text>
            </TouchableOpacity>
          )}

          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  const renderRestTimer = () => {
    if (!isResting) return null;

    const minutes = Math.floor(restTimeLeft / 60);
    const seconds = restTimeLeft % 60;

    return (
      <Modal
        visible={isResting}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.restTimerOverlay}>
          <View style={styles.restTimerModal}>
            <Text style={styles.restTimerTitle}>Rest Time</Text>
            <Text style={styles.restTimerTime}>
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.restTimerSubtitle}>
              Get ready for your next set
            </Text>
            <TouchableOpacity
              style={styles.skipRestButton}
              onPress={skipRest}
            >
              <Text style={styles.skipRestText}>Skip Rest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderWorkoutSummary = () => {
    if (!workoutStats) return null;

    return (
      <Modal
        visible={showWorkoutSummary}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.summaryOverlay}>
          <View style={styles.summaryModal}>
            <Text style={styles.summaryTitle}>Workout Complete! 🎉</Text>
            
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Ionicons name="time" size={24} color="#3B82F6" />
                <Text style={styles.summaryStatValue}>{workoutStats.duration} min</Text>
                <Text style={styles.summaryStatLabel}>Duration</Text>
              </View>
              <View style={styles.summaryStat}>
                <Ionicons name="fitness" size={24} color="#10B981" />
                <Text style={styles.summaryStatValue}>{workoutStats.exercisesCompleted}</Text>
                <Text style={styles.summaryStatLabel}>Exercises</Text>
              </View>
              <View style={styles.summaryStat}>
                <Ionicons name="barbell" size={24} color="#F59E0B" />
                <Text style={styles.summaryStatValue}>{workoutStats.totalSets}</Text>
                <Text style={styles.summaryStatLabel}>Sets</Text>
              </View>
              <View style={styles.summaryStat}>
                <Ionicons name="flame" size={24} color="#EF4444" />
                <Text style={styles.summaryStatValue}>{workoutStats.caloriesBurned}</Text>
                <Text style={styles.summaryStatLabel}>Calories</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.summaryCloseButton}
              onPress={() => setShowWorkoutSummary(false)}
            >
              <Text style={styles.summaryCloseText}>Great Job!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient colors={['#000000', '#111111']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout Tracker</Text>
          <View style={styles.headerSpacer} />
        </View>

        {!activeWorkout ? (
          // Start Workout Screen
          <View style={styles.startScreen}>
            <View style={styles.startContent}>
              <View style={styles.startIcon}>
                <Ionicons name="fitness" size={64} color="#10B981" />
              </View>
              <Text style={styles.startTitle}>Ready to Work Out?</Text>
              <Text style={styles.startSubtitle}>
                Create your custom workout by adding exercises from our library
              </Text>
              
              <TouchableOpacity
                style={styles.startButton}
                onPress={startNewWorkout}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.startButtonGradient}
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                  <Text style={styles.startButtonText}>Start New Workout</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Active Workout Screen
          <View style={styles.workoutScreen}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutTitle}>{activeWorkout.name}</Text>
              <Text style={styles.workoutSubtitle}>
                Exercise {activeWorkout.currentExerciseIndex + 1} of {activeWorkout.exercises.length}
              </Text>
            </View>

            <ScrollView style={styles.exercisesList} showsVerticalScrollIndicator={false}>
              {activeWorkout.exercises.map((exercise, index) => 
                renderExerciseCard(exercise, index)
              )}
            </ScrollView>

            <View style={styles.workoutActions}>
              <TouchableOpacity
                style={styles.addExerciseButton}
                onPress={() => setShowExerciseSearch(true)}
              >
                <Ionicons name="add" size={20} color="#10B981" />
                <Text style={styles.addExerciseText}>Add Exercise</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.finishButton}
                onPress={finishWorkout}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.finishButtonGradient}
                >
                  <Ionicons name="stop" size={20} color="#FFFFFF" />
                  <Text style={styles.finishButtonText}>Finish Workout</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Exercise Search Modal */}
        <ExerciseSearch
          visible={showExerciseSearch}
          onClose={() => setShowExerciseSearch(false)}
          onSelectExercise={addExerciseToWorkout}
        />

        {/* Rest Timer Modal */}
        {renderRestTimer()}

        {/* Workout Summary Modal */}
        {renderWorkoutSummary()}
      </LinearGradient>
    </Animated.View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  startScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  startContent: {
    alignItems: 'center',
  },
  startIcon: {
    marginBottom: 24,
  },
  startTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  startSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  workoutScreen: {
    flex: 1,
  },
  workoutHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  exercisesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    marginBottom: 12,
  },
  currentExerciseCard: {
    elevation: 4,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  exerciseCardGradient: {
    padding: 16,
    borderRadius: 12,
  },
  exerciseCardHeader: {
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyBeginner: {
    backgroundColor: '#10B981',
  },
  difficultyIntermediate: {
    backgroundColor: '#F59E0B',
  },
  difficultyAdvanced: {
    backgroundColor: '#EF4444',
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  completeSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
  },
  completeSetText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  workoutActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  addExerciseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  addExerciseText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  finishButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  finishButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  restTimerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restTimerModal: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  restTimerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  restTimerTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  restTimerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  skipRestButton: {
    backgroundColor: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  skipRestText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryModal: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  summaryStat: {
    alignItems: 'center',
    marginBottom: 16,
    width: '45%',
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  summaryCloseButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
  },
  summaryCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
