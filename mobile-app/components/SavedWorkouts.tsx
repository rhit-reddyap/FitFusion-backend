import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataStorage } from '../utils/dataStorage';

interface CustomWorkout {
  id: string;
  name: string;
  description: string;
  duration: number;
  exercises: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface SavedWorkoutsProps {
  onBack: () => void;
}

export default function SavedWorkouts({ onBack }: SavedWorkoutsProps) {
  const [customWorkouts, setCustomWorkouts] = useState<CustomWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWorkoutPreview, setShowWorkoutPreview] = useState(false);
  const [previewWorkout, setPreviewWorkout] = useState<CustomWorkout | null>(null);

  useEffect(() => {
    loadCustomWorkouts();
  }, []);

  const loadCustomWorkouts = async () => {
    try {
      const workouts = await DataStorage.getCustomWorkouts();
      setCustomWorkouts(workouts);
    } catch (error) {
      console.error('Error loading custom workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCustomWorkouts();
    setRefreshing(false);
  };

  const handlePreviewWorkout = (workout: CustomWorkout) => {
    setPreviewWorkout(workout);
    setShowWorkoutPreview(true);
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await DataStorage.deleteCustomWorkout(workoutId);
              setCustomWorkouts(prev => prev.filter(w => w.id !== workoutId));
              Alert.alert('Success', 'Workout deleted successfully!');
            } catch (error) {
              console.error('Error deleting workout:', error);
              Alert.alert('Error', 'Failed to delete workout');
            }
          }
        }
      ]
    );
  };

  const handleStartWorkout = (workout: CustomWorkout) => {
    Alert.alert('Start Workout', `Starting ${workout.name}...`);
    // TODO: Navigate to workout execution
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your workouts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A', '#0F0F0F']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.title}>SAVED WORKOUTS</Text>
              <Text style={styles.subtitle}>All Your Custom Workouts</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#10B981"
              />
            }
          >
            {customWorkouts.length === 0 ? (
              <View style={styles.emptyState}>
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                  style={styles.emptyStateGradient}
                >
                  <Ionicons name="fitness-outline" size={64} color="#10B981" />
                  <Text style={styles.emptyStateTitle}>No Saved Workouts</Text>
                  <Text style={styles.emptyStateDescription}>
                    Create your first custom workout or use AI to generate one
                  </Text>
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.workoutsList}>
                {customWorkouts.map((workout) => (
                  <TouchableOpacity
                    key={workout.id}
                    style={styles.workoutCard}
                    onPress={() => handlePreviewWorkout(workout)}
                  >
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.08)', 'rgba(0, 0, 0, 0.4)']}
                      style={styles.workoutCardGradient}
                    >
                      <View style={styles.workoutCardHeader}>
                        <View style={styles.workoutCardInfo}>
                          <Text style={styles.workoutCardTitle}>{workout.name}</Text>
                          <Text style={styles.workoutCardDescription}>{workout.description}</Text>
                        </View>
                        <View style={styles.workoutCardActions}>
                          <Ionicons name="chevron-forward" size={20} color="#10B981" />
                        </View>
                      </View>
                      <View style={styles.workoutCardStats}>
                        <View style={styles.workoutStat}>
                          <Ionicons name="list" size={16} color="#10B981" />
                          <Text style={styles.workoutStatText}>{workout.exercises.length} exercises</Text>
                        </View>
                        <View style={styles.workoutStat}>
                          <Ionicons name="time" size={16} color="#10B981" />
                          <Text style={styles.workoutStatText}>{workout.duration} min</Text>
                        </View>
                        <View style={styles.workoutStat}>
                          <Ionicons name="calendar" size={16} color="#10B981" />
                          <Text style={styles.workoutStatText}>
                            {new Date(workout.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>

        {/* Workout Preview Modal */}
        <Modal visible={showWorkoutPreview} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.workoutPreviewModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Workout Preview</Text>
                <TouchableOpacity onPress={() => setShowWorkoutPreview(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalContent}>
                {previewWorkout && (
                  <>
                    <Text style={styles.workoutPreviewName}>{previewWorkout.name}</Text>
                    <Text style={styles.workoutPreviewDescription}>{previewWorkout.description}</Text>
                    
                    <View style={styles.workoutPreviewStats}>
                      <View style={styles.previewStat}>
                        <Ionicons name="list" size={20} color="#10B981" />
                        <Text style={styles.previewStatText}>{previewWorkout.exercises.length} Exercises</Text>
                      </View>
                      <View style={styles.previewStat}>
                        <Ionicons name="time" size={20} color="#10B981" />
                        <Text style={styles.previewStatText}>{previewWorkout.duration} Minutes</Text>
                      </View>
                    </View>

                    <Text style={styles.exerciseListTitle}>Exercises:</Text>
                    <View style={styles.exerciseList}>
                      {previewWorkout.exercises.map((exercise, index) => (
                        <View key={index} style={styles.exerciseItem}>
                          <View style={styles.exerciseInfo}>
                            <Text style={styles.exerciseName}>{exercise.name}</Text>
                            <Text style={styles.exerciseCategory}>{exercise.category}</Text>
                          </View>
                          <View style={styles.exerciseSets}>
                            <Text style={styles.exerciseSetsText}>
                              {exercise.sets.length} sets
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    <View style={styles.workoutPreviewActions}>
                      <TouchableOpacity 
                        style={styles.deleteWorkoutButton}
                        onPress={() => {
                          Alert.alert(
                            'Delete Workout',
                            'Are you sure you want to delete this workout?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { 
                                text: 'Delete', 
                                style: 'destructive',
                                onPress: () => {
                                  handleDeleteWorkout(previewWorkout.id);
                                  setShowWorkoutPreview(false);
                                }
                              }
                            ]
                          );
                        }}
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        <Text style={styles.deleteWorkoutText}>Delete</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.startFromPreviewButton}
                        onPress={() => {
                          setShowWorkoutPreview(false);
                          handleStartWorkout(previewWorkout);
                        }}
                      >
                        <Ionicons name="play-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.startFromPreviewText}>Start Workout</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateGradient: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  workoutsList: {
    paddingVertical: 20,
  },
  workoutCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  workoutCardGradient: {
    padding: 20,
  },
  workoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutCardInfo: {
    flex: 1,
  },
  workoutCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutCardDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  workoutCardActions: {
    marginLeft: 12,
  },
  workoutCardStats: {
    flexDirection: 'row',
    gap: 20,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workoutStatText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutPreviewModal: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    margin: 20,
    maxHeight: '90%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContent: {
    padding: 20,
  },
  workoutPreviewName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  workoutPreviewDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 20,
    lineHeight: 24,
  },
  workoutPreviewStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  previewStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewStatText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  exerciseListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  exerciseList: {
    marginBottom: 24,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 12,
    color: '#10B981',
  },
  exerciseSets: {
    marginLeft: 12,
  },
  exerciseSetsText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  workoutPreviewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteWorkoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 8,
  },
  deleteWorkoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  startFromPreviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  startFromPreviewText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});




