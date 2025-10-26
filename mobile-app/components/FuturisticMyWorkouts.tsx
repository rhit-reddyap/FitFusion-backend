import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  Alert,
  Modal,
  Image,
  Vibration,
  StatusBar,
  FlatList,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataStorage } from '../utils/dataStorage';

const { width, height } = Dimensions.get('window');

interface CustomWorkout {
  id: string;
  name: string;
  description: string;
  exercises: {
    exercise: {
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
    };
    sets: {
      reps: number;
      weight: number;
      restTime: number;
      completed: boolean;
      completedAt?: Date;
      formScore?: number;
      rpe?: number;
      notes?: string;
    }[];
  }[];
  createdAt: Date;
  lastUsed?: Date;
  difficulty: string;
  estimatedDuration: number;
  targetMuscles: string[];
  equipment: string[];
  tags: string[];
}

interface FuturisticMyWorkoutsProps {
  visible: boolean;
  onClose: () => void;
  onStartWorkout: (workout: CustomWorkout) => void;
}

export default function FuturisticMyWorkouts({ visible, onClose, onStartWorkout }: FuturisticMyWorkoutsProps) {
  const [workouts, setWorkouts] = useState<CustomWorkout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<CustomWorkout[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'recent' | 'favorites' | 'custom'>('all');
  const [showCreateWorkout, setShowCreateWorkout] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<CustomWorkout | null>(null);
  const [showWorkoutDetails, setShowWorkoutDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      loadWorkouts();
      startAnimations();
    }
  }, [visible]);

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
  };

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const customWorkouts = await DataStorage.getCustomWorkouts();
      setWorkouts(customWorkouts);
      setFilteredWorkouts(customWorkouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredWorkouts(workouts);
    } else {
      const filtered = workouts.filter(workout =>
        workout.name.toLowerCase().includes(query.toLowerCase()) ||
        workout.description.toLowerCase().includes(query.toLowerCase()) ||
        workout.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredWorkouts(filtered);
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category as any);
    let filtered = workouts;

    switch (category) {
      case 'recent':
        filtered = workouts
          .filter(w => w.lastUsed)
          .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime());
        break;
      case 'favorites':
        // Mock favorites - in real app, this would be stored in user preferences
        filtered = workouts.filter(w => w.tags.includes('favorite'));
        break;
      case 'custom':
        filtered = workouts.filter(w => w.tags.includes('custom'));
        break;
      default:
        filtered = workouts;
    }

    setFilteredWorkouts(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getDifficultyGradient = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return ['#10B981', '#059669'];
      case 'intermediate': return ['#F59E0B', '#D97706'];
      case 'advanced': return ['#EF4444', '#DC2626'];
      default: return ['#6B7280', '#4B5563'];
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const renderWorkoutCard = ({ item: workout, index }: { item: CustomWorkout; index: number }) => (
    <Animated.View
      style={[
        styles.workoutCard,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.workoutCardContent}
        onPress={() => {
          setSelectedWorkout(workout);
          setShowWorkoutDetails(true);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={styles.workoutGradient}
        >
          {/* Header */}
          <View style={styles.workoutHeader}>
            <View style={styles.workoutTitleContainer}>
              <Text style={styles.workoutName} numberOfLines={1}>{workout.name}</Text>
              <View style={styles.workoutMeta}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(workout.difficulty) + '20' }]}>
                  <Text style={[styles.difficultyText, { color: getDifficultyColor(workout.difficulty) }]}>
                    {workout.difficulty.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.durationText}>{formatDuration(workout.estimatedDuration)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => {
                // Show workout options
                Alert.alert(
                  'Workout Options',
                  'What would you like to do?',
                  [
                    { text: 'Start Workout', onPress: () => onStartWorkout(workout) },
                    { text: 'Edit', onPress: () => {} },
                    { text: 'Duplicate', onPress: () => {} },
                    { text: 'Delete', onPress: () => {} },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.workoutDescription} numberOfLines={2}>
            {workout.description || 'Custom workout routine'}
          </Text>

          {/* Exercise Count & Stats */}
          <View style={styles.workoutStats}>
            <View style={styles.statItem}>
              <Ionicons name="fitness" size={16} color="#10B981" />
              <Text style={styles.statText}>{workout.exercises.length} exercises</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={16} color="#F59E0B" />
              <Text style={styles.statText}>{workout.estimatedDuration} min</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="barbell" size={16} color="#8B5CF6" />
              <Text style={styles.statText}>
                {workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)} sets
              </Text>
            </View>
          </View>

          {/* Target Muscles */}
          <View style={styles.targetMuscles}>
            {workout.targetMuscles.slice(0, 3).map((muscle, idx) => (
              <View key={idx} style={styles.muscleTag}>
                <Text style={styles.muscleText}>{muscle}</Text>
              </View>
            ))}
            {workout.targetMuscles.length > 3 && (
              <View style={styles.muscleTag}>
                <Text style={styles.muscleText}>+{workout.targetMuscles.length - 3}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.workoutActions}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => onStartWorkout(workout)}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.startButtonGradient}
              >
                <Ionicons name="play" size={20} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Start</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.previewButton}>
              <Ionicons name="eye" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyState,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.emptyIconContainer}>
        <Ionicons name="fitness" size={64} color="#6B7280" />
      </View>
      <Text style={styles.emptyTitle}>No Workouts Yet</Text>
      <Text style={styles.emptyDescription}>
        Create your first custom workout or browse our templates
      </Text>
      <TouchableOpacity
        style={styles.createFirstButton}
        onPress={() => setShowCreateWorkout(true)}
      >
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.createFirstButtonGradient}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createFirstButtonText}>Create Workout</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>My Workouts</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateWorkout(true)}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Search workouts..."
                placeholderTextColor="#6B7280"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Category Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
            {[
              { key: 'all', label: 'All', icon: 'grid' },
              { key: 'recent', label: 'Recent', icon: 'time' },
              { key: 'favorites', label: 'Favorites', icon: 'heart' },
              { key: 'custom', label: 'Custom', icon: 'create' }
            ].map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.key && styles.activeCategoryButton
                ]}
                onPress={() => handleCategoryFilter(category.key)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={selectedCategory === category.key ? '#FFFFFF' : '#9CA3AF'}
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.key && styles.activeCategoryText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Workouts List */}
          <View style={styles.workoutsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="fitness" size={48} color="#10B981" />
                <Text style={styles.loadingText}>Loading workouts...</Text>
              </View>
            ) : filteredWorkouts.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={filteredWorkouts}
                renderItem={renderWorkoutCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.workoutsList}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#10B981"
                  />
                }
              />
            )}
          </View>
        </Animated.View>
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
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  createButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#10B981',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  categoryContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  activeCategoryButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
    marginLeft: 6,
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  workoutsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  workoutsList: {
    paddingBottom: 24,
  },
  workoutCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  workoutCardContent: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  workoutGradient: {
    padding: 20,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutTitleContainer: {
    flex: 1,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  durationText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  moreButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 16,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  targetMuscles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  muscleTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  muscleText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  workoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startButton: {
    flex: 1,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  previewButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createFirstButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  createFirstButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  createFirstButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
});
