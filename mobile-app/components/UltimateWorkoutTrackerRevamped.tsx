import React, { useState, useEffect, useRef } from 'react';
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
  TextInput,
  Vibration,
  Image,
  RefreshControl,
  PanResponder,
  StatusBar,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// Remove this import since we're defining our own ExerciseVideo interface and data
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { DataStorage } from '../utils/dataStorage';
import CustomWorkoutBuilder from './CustomWorkoutBuilder';
import AICoach from './AICoach';
import AdvancedExerciseLogger from './AdvancedExerciseLogger';
import WorkoutCalendar from './WorkoutCalendar';
import FuturisticMyWorkouts from './FuturisticMyWorkouts';
import FuturisticWorkoutExecution from './FuturisticWorkoutExecution';
import { useAuth } from './AuthProvider';
import OfflineManager from '../utils/offlineManager';

const { width, height } = Dimensions.get('window');

interface UltimateWorkoutTrackerRevampedProps {
  onBack: () => void;
}

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
  difficulty: string;
  estimatedDuration: number;
  targetMuscles: string[];
  equipment: string[];
  tags: string[];
}

interface ActiveSet {
  exerciseId: string;
  setIndex: number;
  reps: number;
  weight: number;
  restTime: number;
  isResting: boolean;
  timeRemaining: number;
  formScore: number;
  rpe: number;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  duration: number;
  exercises: Exercise[];
  targetMuscles: string[];
  equipment: string[];
  createdBy: string;
  tags: string[];
}

interface ExerciseVideo {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  muscleGroups: string[];
  videoUrl: string;
  thumbnail: string;
}

export default function UltimateWorkoutTrackerRevamped({ onBack }: UltimateWorkoutTrackerRevampedProps) {
  const { user } = useAuth();
  const [activeWorkout, setActiveWorkout] = useState<CustomWorkout | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [showWorkoutSummary, setShowWorkoutSummary] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const [pulseValue] = useState(new Animated.Value(1));
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [customWorkouts, setCustomWorkouts] = useState<CustomWorkout[]>([]);
  const [activeSet, setActiveSet] = useState<ActiveSet | null>(null);
  const [workoutSummary, setWorkoutSummary] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedTab, setSelectedTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAICoach, setShowAICoach] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [gestureEnabled, setGestureEnabled] = useState(false);
  const [currentFormTips, setCurrentFormTips] = useState([]);
  const [workoutIntensity, setWorkoutIntensity] = useState('moderate');
  const [targetMuscleGroups, setTargetMuscleGroups] = useState([]);
  const [workoutGoals, setWorkoutGoals] = useState([]);
  const [equipmentAvailable, setEquipmentAvailable] = useState([]);
  const [workoutDuration, setWorkoutDuration] = useState(45);
  const [restBetweenSets, setRestBetweenSets] = useState(90);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showWorkoutCalendar, setShowWorkoutCalendar] = useState(false);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [showWorkoutNotes, setShowWorkoutNotes] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<ExerciseVideo | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showMyWorkouts, setShowMyWorkouts] = useState(false);
  const [showBeginnerSection, setShowBeginnerSection] = useState(false);
  const [showFeaturedVideo, setShowFeaturedVideo] = useState(false);
  const [featuredVideo, setFeaturedVideo] = useState<ExerciseVideo | null>(null);
  const [showWorkoutExecution, setShowWorkoutExecution] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<CustomWorkout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Mock data for demonstration
  const mockUserStats = {
    totalExercises: 156,
    weeklyExercises: 12,
    totalCaloriesBurned: 2840,
    weeklyCalories: 420,
    totalWorkoutTime: 3240, // in minutes
    weeklyWorkoutTime: 480,
    currentStreak: 7,
    longestStreak: 21,
    totalTonnage: 125000,
    weeklyTonnage: 8500
  };

  const mockTemplates: WorkoutTemplate[] = [
    {
      id: '1',
      name: 'Push Day Power',
      description: 'Chest, shoulders, and triceps focused workout',
      difficulty: 'Intermediate',
      duration: 60,
      exercises: [],
      targetMuscles: ['chest', 'shoulders', 'triceps'],
      equipment: ['barbell', 'dumbbells', 'bench'],
      createdBy: 'AI Coach',
      tags: ['strength', 'upper body']
    },
    {
      id: '2',
      name: 'Pull Day Strength',
      description: 'Back and biceps focused workout',
      difficulty: 'Intermediate',
      duration: 55,
      exercises: [],
      targetMuscles: ['back', 'biceps'],
      equipment: ['barbell', 'dumbbells', 'pull-up bar'],
      createdBy: 'AI Coach',
      tags: ['strength', 'upper body']
    },
    {
      id: '3',
      name: 'Leg Day Destroyer',
      description: 'Complete lower body workout',
      difficulty: 'Advanced',
      duration: 75,
      exercises: [],
      targetMuscles: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
      equipment: ['barbell', 'dumbbells', 'squat rack'],
      createdBy: 'AI Coach',
      tags: ['strength', 'lower body']
    }
  ];

  // Exercise Video Library Data
  const exerciseVideoLibrary: ExerciseVideo[] = [
    {
      id: '1',
      name: 'Bench Press',
      description: 'Classic chest exercise for building upper body strength',
      duration: '5:30',
      difficulty: 'Intermediate',
      muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
      videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
      thumbnail: 'https://img.youtube.com/vi/rT7DgCr-3pg/maxresdefault.jpg',
    },
    {
      id: '2',
      name: 'Squat',
      description: 'Fundamental lower body exercise for leg strength',
      duration: '6:15',
      difficulty: 'Beginner',
      muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
      videoUrl: 'https://www.youtube.com/watch?v=YaXPRqUwItQ',
      thumbnail: 'https://img.youtube.com/vi/YaXPRqUwItQ/maxresdefault.jpg',
    },
    {
      id: '3',
      name: 'Deadlift',
      description: 'Full body compound movement for posterior chain',
      duration: '7:45',
      difficulty: 'Advanced',
      muscleGroups: ['Hamstrings', 'Glutes', 'Back', 'Traps'],
      videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
      thumbnail: 'https://img.youtube.com/vi/op9kVnSso6Q/maxresdefault.jpg',
    },
    {
      id: '4',
      name: 'Overhead Press',
      description: 'Shoulder strength and stability exercise',
      duration: '4:20',
      difficulty: 'Intermediate',
      muscleGroups: ['Shoulders', 'Triceps', 'Core'],
      videoUrl: 'https://www.youtube.com/watch?v=0JfYxMRsUCQ',
      thumbnail: 'https://img.youtube.com/vi/0JfYxMRsUCQ/maxresdefault.jpg',
    },
    {
      id: '5',
      name: 'Pull-ups',
      description: 'Upper body pulling strength exercise',
      duration: '5:10',
      difficulty: 'Intermediate',
      muscleGroups: ['Lats', 'Biceps', 'Rhomboids'],
      videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
      thumbnail: 'https://img.youtube.com/vi/eGo4IYlbE5g/maxresdefault.jpg',
    },
    {
      id: '6',
      name: 'Barbell Rows',
      description: 'Back strength and posture exercise',
      duration: '6:00',
      difficulty: 'Intermediate',
      muscleGroups: ['Lats', 'Rhomboids', 'Biceps'],
      videoUrl: 'https://www.youtube.com/watch?v=foa4s2VqXgI',
      thumbnail: 'https://img.youtube.com/vi/foa4s2VqXgI/maxresdefault.jpg',
    },
    {
      id: '7',
      name: 'Dips',
      description: 'Tricep and chest strength exercise',
      duration: '4:45',
      difficulty: 'Intermediate',
      muscleGroups: ['Triceps', 'Chest', 'Shoulders'],
      videoUrl: 'https://www.youtube.com/watch?v=2s8F6pYlZ0Q',
      thumbnail: 'https://img.youtube.com/vi/2s8F6pYlZ0Q/maxresdefault.jpg',
    },
    {
      id: '8',
      name: 'Lunges',
      description: 'Single leg strength and stability exercise',
      duration: '5:30',
      difficulty: 'Beginner',
      muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
      videoUrl: 'https://www.youtube.com/watch?v=3XDriUn0uCA',
      thumbnail: 'https://img.youtube.com/vi/3XDriUn0uCA/maxresdefault.jpg',
    },
    {
      id: '9',
      name: 'Plank',
      description: 'Core stability and strength exercise',
      duration: '3:15',
      difficulty: 'Beginner',
      muscleGroups: ['Core', 'Shoulders', 'Glutes'],
      videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
      thumbnail: 'https://img.youtube.com/vi/pSHjTRCQxIw/maxresdefault.jpg',
    },
    {
      id: '10',
      name: 'Bicep Curls',
      description: 'Isolation exercise for bicep development',
      duration: '4:00',
      difficulty: 'Beginner',
      muscleGroups: ['Biceps'],
      videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
      thumbnail: 'https://img.youtube.com/vi/ykJmrZ5v0Oo/maxresdefault.jpg',
    },
  ];

  useEffect(() => {
    loadUserData();
    startAnimations();
    // Do not override real stats with mock data here.
    // The `loadUserData()` call above will populate userStats from DataStorage.
    
    // Initialize filtered exercises safely
    if (exerciseVideoLibrary && exerciseVideoLibrary.length > 0) {
      setFilteredExercises(exerciseVideoLibrary);
      
      // Set featured video (rotates daily)
      const today = new Date().getDate();
      const featuredIndex = today % exerciseVideoLibrary.length;
      setFeaturedVideo(exerciseVideoLibrary[featuredIndex]);
    }
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [stats, workouts] = await Promise.all([
        DataStorage.getUserStats(),
        DataStorage.getCustomWorkouts()
      ]);
      setUserStats(stats);
      setCustomWorkouts(workouts);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTemplateColors = (difficulty: string): [string, string] => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return ['#10B981', '#059669'];
      case 'intermediate':
        return ['#F59E0B', '#D97706'];
      case 'advanced':
        return ['#EF4444', '#DC2626'];
      default:
        return ['#6B7280', '#4B5563'];
    }
  };

  const handleStartWorkout = (workout: CustomWorkout) => {
    setSelectedWorkout(workout);
    setCurrentExerciseIndex(0);
    setShowWorkoutExecution(true);
  };

  const handleSetComplete = (exerciseId: string, setIndex: number, setData: any) => {
    // Handle set completion
    console.log('Set completed:', exerciseId, setIndex, setData);
  };

  const handleExerciseComplete = (exerciseId: string) => {
    // Handle exercise completion
    console.log('Exercise completed:', exerciseId);
  };

  const handleNextExercise = () => {
    if (selectedWorkout && currentExerciseIndex < selectedWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const handleWorkoutComplete = () => {
    setShowWorkoutExecution(false);
    setSelectedWorkout(null);
    setCurrentExerciseIndex(0);
    Alert.alert('Workout Complete!', 'Great job on finishing your workout!');
  };

  const renderSleekHeader = () => (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#111111']}
      style={styles.sleekHeader}
    >
      {/* Top Navigation */}
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowWorkoutCalendar(true)}
            style={styles.headerAction}
          >
            <Ionicons name="calendar-outline" size={20} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowAICoach(true)}
            style={styles.headerAction}
          >
            <Ionicons name="sparkles" size={20} color="#F59E0B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Workout Tracker</Text>
        <Text style={styles.subTitle}>Train smarter, not harder</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.quickStat}>
          <View style={styles.quickStatIcon}>
            <Ionicons name="flame" size={16} color="#F59E0B" />
          </View>
          <Text style={styles.quickStatValue}>{userStats?.currentStreak || 0}</Text>
          <Text style={styles.quickStatLabel}>Day Streak</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStat}>
          <View style={styles.quickStatIcon}>
            <Ionicons name="barbell" size={16} color="#10B981" />
          </View>
          <Text style={styles.quickStatValue}>{formatNumber(userStats?.weeklyTonnage || 0)}</Text>
          <Text style={styles.quickStatLabel}>Lbs This Week</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStat}>
          <View style={styles.quickStatIcon}>
            <Ionicons name="time" size={16} color="#8B5CF6" />
          </View>
          <Text style={styles.quickStatValue}>{Math.floor((userStats?.totalWorkoutTime || 0) / 60)}</Text>
          <Text style={styles.quickStatLabel}>Hours Total</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Start</Text>
      
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => setShowAICoach(true)}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="sparkles" size={28} color="#FFFFFF" />
            <Text style={styles.quickActionTitle}>AI Workout</Text>
            <Text style={styles.quickActionSubtitle}>Generate personalized workout</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => setShowCustomBuilder(true)}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="add-circle" size={28} color="#FFFFFF" />
            <Text style={styles.quickActionTitle}>Custom Workout</Text>
            <Text style={styles.quickActionSubtitle}>Build your own routine</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => setShowMyWorkouts(true)}
        >
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="list" size={28} color="#FFFFFF" />
            <Text style={styles.quickActionTitle}>My Workouts</Text>
            <Text style={styles.quickActionSubtitle}>View saved workouts</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => setShowExerciseLibrary(true)}
        >
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="library" size={28} color="#FFFFFF" />
            <Text style={styles.quickActionTitle}>Exercise Library</Text>
            <Text style={styles.quickActionSubtitle}>Browse exercises</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWorkoutTemplates = () => (
    <View style={styles.templatesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>AI Templates</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => setShowTemplates(true)}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#10B981" />
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {mockTemplates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateCard}
            onPress={() => {
              // Handle template selection
              Alert.alert('Template Selected', `Starting ${template.name} workout`);
            }}
          >
            <LinearGradient
              colors={getTemplateColors(template.difficulty)}
              style={styles.templateGradient}
            >
              <View style={styles.templateHeader}>
                <Text style={styles.templateName}>{template.name}</Text>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{template.difficulty}</Text>
                </View>
              </View>
              <Text style={styles.templateDescription}>{template.description}</Text>
              <View style={styles.templateStats}>
                <View style={styles.templateStat}>
                  <Ionicons name="time" size={14} color="#FFFFFF" />
                  <Text style={styles.templateStatText}>{template.duration} min</Text>
                </View>
                <View style={styles.templateStat}>
                  <Ionicons name="fitness" size={14} color="#FFFFFF" />
                  <Text style={styles.templateStatText}>{template.exercises.length} exercises</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderWorkoutStats = () => (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Your Progress</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="fitness" size={20} color="#10B981" />
          </View>
          <Text style={styles.statValue}>{userStats?.totalExercises || 0}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="flame" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.statValue}>{formatNumber(userStats?.totalCaloriesBurned || 0)}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="barbell" size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.statValue}>{formatNumber(userStats?.totalTonnage || 0)}</Text>
          <Text style={styles.statLabel}>Tonnage</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="trophy" size={20} color="#EF4444" />
          </View>
          <Text style={styles.statValue}>{userStats?.currentStreak || 0}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>
    </View>
  );

  const renderBeginnerSection = () => (
    <View style={styles.beginnerSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Learn & Improve</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => setShowExerciseLibrary(true)}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#10B981" />
        </TouchableOpacity>
      </View>

      <View style={styles.beginnerContent}>
        <TouchableOpacity 
          style={styles.featuredVideoCard}
          onPress={() => setShowFeaturedVideo(true)}
        >
          <LinearGradient
            colors={['#1F2937', '#374151']}
            style={styles.featuredVideoGradient}
          >
            <View style={styles.videoThumbnail}>
              <Ionicons name="play-circle" size={48} color="#10B981" />
            </View>
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle}>
                {featuredVideo?.name || 'Featured Exercise'}
              </Text>
              <Text style={styles.videoDescription}>
                Master proper form and technique
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Show loading screen if data is not loaded
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: animatedValue }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {renderSleekHeader()}
        {renderQuickActions()}
        {renderWorkoutTemplates()}
        {renderWorkoutStats()}
        {renderBeginnerSection()}
      </ScrollView>

      {/* Modals */}
      {showAICoach && (
        <AICoach
          visible={showAICoach}
          onClose={() => setShowAICoach(false)}
          onStartWorkout={(workout) => {
            setActiveWorkout(workout);
            setShowWorkoutModal(true);
          }}
        />
      )}

      {showCustomBuilder && (
        <CustomWorkoutBuilder
          visible={showCustomBuilder}
          onClose={() => setShowCustomBuilder(false)}
          onWorkoutCreated={() => {
            console.log('Custom workout created');
            setShowCustomBuilder(false);
          }}
        />
      )}

      {showWorkoutCalendar && (
        <WorkoutCalendar
          visible={showWorkoutCalendar}
          onClose={() => setShowWorkoutCalendar(false)}
          onDateSelect={(date: string, workouts: any[]) => {
            console.log('Date selected:', date, workouts);
            setShowWorkoutCalendar(false);
          }}
        />
      )}

      {showMyWorkouts && (
        <FuturisticMyWorkouts
          visible={showMyWorkouts}
          onClose={() => setShowMyWorkouts(false)}
          onStartWorkout={handleStartWorkout}
        />
      )}

      {showWorkoutExecution && selectedWorkout && (
        <FuturisticWorkoutExecution
          visible={showWorkoutExecution}
          onClose={() => setShowWorkoutExecution(false)}
          workout={selectedWorkout}
          currentExerciseIndex={currentExerciseIndex}
          onSetComplete={handleSetComplete}
          onExerciseComplete={handleExerciseComplete}
          onNextExercise={handleNextExercise}
          onPreviousExercise={handlePreviousExercise}
          onWorkoutComplete={handleWorkoutComplete}
        />
      )}

      {/* Exercise Library Modal */}
      {showExerciseLibrary && (
        <Modal
          visible={showExerciseLibrary}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <View style={styles.exerciseLibraryContainer}>
            <LinearGradient
              colors={['#0F172A', '#1E293B']}
              style={styles.exerciseLibraryGradient}
            >
              {/* Header */}
              <View style={styles.exerciseLibraryHeader}>
                <TouchableOpacity
                  style={styles.exerciseLibraryBackButton}
                  onPress={() => setShowExerciseLibrary(false)}
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.exerciseLibraryTitleContainer}>
                  <Text style={styles.exerciseLibraryTitle}>Exercise Library</Text>
                  <Text style={styles.exerciseLibrarySubtitle}>
                    {filteredExercises.length} exercises with video tutorials
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.exerciseLibrarySearchButton}
                  onPress={() => {
                    setShowSearchBar(!showSearchBar);
                    if (showSearchBar) {
                      setExerciseSearchQuery('');
                      setFilteredExercises(exerciseVideoLibrary);
                    }
                  }}
                >
                  <Ionicons name={showSearchBar ? "close" : "search"} size={24} color="#10B981" />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              {showSearchBar && (
                <View style={styles.exerciseSearchContainer}>
                  <View style={styles.exerciseSearchBar}>
                    <Ionicons name="search" size={20} color="#6B7280" />
                    <TextInput
                      style={styles.exerciseSearchInput}
                      placeholder="Search exercises..."
                      placeholderTextColor="#6B7280"
                      value={exerciseSearchQuery}
                      onChangeText={(query) => {
                        setExerciseSearchQuery(query);
                        if (query.trim() === '') {
                          setFilteredExercises(exerciseVideoLibrary);
                        } else {
                          const filtered = exerciseVideoLibrary.filter(exercise =>
                            exercise.name.toLowerCase().includes(query.toLowerCase()) ||
                            exercise.muscleGroups.some(muscle => 
                              muscle.toLowerCase().includes(query.toLowerCase())
                            ) ||
                            exercise.description.toLowerCase().includes(query.toLowerCase())
                          );
                          setFilteredExercises(filtered);
                        }
                      }}
                    />
                    {exerciseSearchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => {
                          setExerciseSearchQuery('');
                          setFilteredExercises(exerciseVideoLibrary);
                        }}
                        style={styles.exerciseSearchClear}
                      >
                        <Ionicons name="close-circle" size={20} color="#6B7280" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Filter Tabs */}
              <View style={styles.exerciseFilterTabs}>
                {['All', 'Upper Body', 'Lower Body', 'Core', 'Cardio'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.exerciseFilterTab,
                      category === 'All' && styles.activeExerciseFilterTab
                    ]}
                  >
                    <Text style={[
                      styles.exerciseFilterTabText,
                      category === 'All' && styles.activeExerciseFilterTabText
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Exercise Grid */}
              <ScrollView style={styles.exerciseLibraryContent}>
                <View style={styles.exerciseLibraryGrid}>
                  {filteredExercises.map((exercise, index) => (
                    <TouchableOpacity
                      key={exercise.id}
                      style={styles.exerciseLibraryCard}
                      onPress={() => {
                        setSelectedVideo(exercise);
                        setShowVideoPlayer(true);
                      }}
                    >
                      <LinearGradient
                        colors={['#1E293B', '#334155']}
                        style={styles.exerciseLibraryCardGradient}
                      >
                        {/* Video Thumbnail */}
                        <View style={styles.exerciseVideoThumbnail}>
                          <View style={styles.exerciseVideoPlaceholder}>
                            <Text style={styles.exerciseVideoDuration}>{exercise.duration}</Text>
                          </View>
                          <View style={styles.exerciseDifficultyBadge}>
                            <Text style={styles.exerciseDifficultyText}>
                              {exercise.difficulty}
                            </Text>
                          </View>
                          {/* Play Button Overlay */}
                          <View style={styles.playButtonOverlay}>
                            <Ionicons name="play" size={24} color="#fff" />
                          </View>
                        </View>

                        {/* Exercise Info */}
                        <View style={styles.exerciseLibraryInfo}>
                          <Text style={styles.exerciseLibraryName}>{exercise.name}</Text>
                          <Text style={styles.exerciseLibraryMuscles}>
                            {exercise.muscleGroups.slice(0, 2).join(', ')}
                          </Text>
                          <View style={styles.exerciseLibraryStats}>
                            <View style={styles.exerciseLibraryStat}>
                              <Ionicons name="time" size={14} color="#6B7280" />
                              <Text style={styles.exerciseLibraryStatText}>{exercise.duration}</Text>
                            </View>
                            <View style={styles.exerciseLibraryStat}>
                              <Ionicons name="eye" size={14} color="#6B7280" />
                              <Text style={styles.exerciseLibraryStatText}>1.2M views</Text>
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {filteredExercises.length === 0 && exerciseSearchQuery.length > 0 && (
                  <View style={styles.noResultsContainer}>
                    <Ionicons name="search" size={48} color="#6B7280" />
                    <Text style={styles.noResultsTitle}>No exercises found</Text>
                    <Text style={styles.noResultsSubtitle}>
                      Try searching for a different exercise or muscle group
                    </Text>
                    <TouchableOpacity
                      style={styles.clearSearchButton}
                      onPress={() => {
                        setExerciseSearchQuery('');
                        setFilteredExercises(exerciseVideoLibrary);
                      }}
                    >
                      <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </Modal>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  sleekHeader: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
  quickActionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickActionCard: {
    width: (width - 68) / 2,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  quickActionGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 6,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 16,
  },
  templatesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  templateCard: {
    width: 200,
    height: 140,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  templateGradient: {
    flex: 1,
    padding: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  templateDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    lineHeight: 16,
  },
  templateStats: {
    flexDirection: 'row',
    gap: 16,
  },
  templateStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  templateStatText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  beginnerSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  beginnerContent: {
    marginTop: 16,
  },
  featuredVideoCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredVideoGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  videoThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  // Exercise Library Styles
  exerciseLibraryContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  exerciseLibraryGradient: {
    flex: 1,
  },
  exerciseLibraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  exerciseLibraryBackButton: {
    padding: 8,
    marginRight: 16,
  },
  exerciseLibraryTitleContainer: {
    flex: 1,
  },
  exerciseLibraryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exerciseLibrarySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  exerciseLibrarySearchButton: {
    padding: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 20,
  },
  exerciseSearchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  exerciseSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  exerciseSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  exerciseSearchClear: {
    padding: 4,
  },
  exerciseFilterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  exerciseFilterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeExerciseFilterTab: {
    backgroundColor: '#10B981',
  },
  exerciseFilterTabText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  activeExerciseFilterTabText: {
    color: '#FFFFFF',
  },
  exerciseLibraryContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseLibraryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  exerciseLibraryCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  exerciseLibraryCardGradient: {
    padding: 16,
  },
  exerciseVideoThumbnail: {
    height: 120,
    borderRadius: 12,
    backgroundColor: '#374151',
    marginBottom: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseVideoPlaceholder: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exerciseVideoDuration: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  exerciseDifficultyBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exerciseDifficultyText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  playButtonOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  exerciseLibraryInfo: {
    flex: 1,
  },
  exerciseLibraryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseLibraryMuscles: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  exerciseLibraryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseLibraryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseLibraryStatText: {
    fontSize: 12,
    color: '#6B7280',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  clearSearchButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clearSearchButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
