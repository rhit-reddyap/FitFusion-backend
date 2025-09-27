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
  Platform,
  SafeAreaView,
  Linking
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataStorage } from '../utils/dataStorage';
import CustomWorkoutBuilder from './CustomWorkoutBuilder';
import { useAuth } from './AuthProvider';
import OfflineManager from '../utils/offlineManager';
import AIWorkoutGenerator from './AIWorkoutGenerator';
import { TeamService } from '../services/teamService';

const { width, height } = Dimensions.get('window');

interface AdvancedWorkoutTrackerProps {
  onBack: () => void;
  navigation?: any;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  equipment: string;
  muscle: string;
  instructions?: string;
  videoUrl?: string;
}

interface WorkoutSet {
  reps: number;
  weight: number;
  restTime: number;
  completed: boolean;
  completedAt?: Date;
  actualReps: number;
  actualWeight: number;
  isActive: boolean;
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

interface ActiveSet {
  exerciseIndex: number;
  setIndex: number;
  reps: number;
  weight: number;
  restTime: number;
  isResting: boolean;
  timeRemaining: number;
}

export default function AdvancedWorkoutTracker({ onBack, navigation }: AdvancedWorkoutTrackerProps) {
  const { user } = useAuth();
  const [activeWorkout, setActiveWorkout] = useState<CustomWorkout | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [showWorkoutSummary, setShowWorkoutSummary] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [workoutData, setWorkoutData] = useState<any>(null);
  const [showEndWorkoutModal, setShowEndWorkoutModal] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const [pulseValue] = useState(new Animated.Value(1));
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [customWorkouts, setCustomWorkouts] = useState<CustomWorkout[]>([]);
  const [activeSet, setActiveSet] = useState<ActiveSet | null>(null);
  const [workoutSummary, setWorkoutSummary] = useState<any>(null);
  const [showWorkoutSummaryFinal, setShowWorkoutSummaryFinal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedTab, setSelectedTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAICoach, setShowAICoach] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [gestureEnabled, setGestureEnabled] = useState(false);
  const [currentFormTips, setCurrentFormTips] = useState<string[]>([]);
  const [workoutIntensity, setWorkoutIntensity] = useState('moderate');
  const [targetMuscleGroups, setTargetMuscleGroups] = useState<string[]>([]);
  const [workoutGoals, setWorkoutGoals] = useState<string[]>([]);
  const [equipmentAvailable, setEquipmentAvailable] = useState<string[]>([]);
  const [workoutDuration, setWorkoutDuration] = useState(45);
  const [restBetweenSets, setRestBetweenSets] = useState(90);
  const [warmupTime, setWarmupTime] = useState(5);
  const [cooldownTime, setCooldownTime] = useState(5);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showWorkoutStartModal, setShowWorkoutStartModal] = useState(false);
  const [showViewAllWorkouts, setShowViewAllWorkouts] = useState(false);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [showWorkoutPreview, setShowWorkoutPreview] = useState(false);
  const [previewWorkout, setPreviewWorkout] = useState<CustomWorkout | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [exercisePreferences, setExercisePreferences] = useState<string[]>([]);
  const [inputValues, setInputValues] = useState<{[key: string]: string}>({});
  const [fitnessLevel, setFitnessLevel] = useState('intermediate');
  const [targetMuscles, setTargetMuscles] = useState<string[]>([]);
  const [showWorkoutCalendar, setShowWorkoutCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [calendarTonnage, setCalendarTonnage] = useState(0);
  const [calendarWorkoutCount, setCalendarWorkoutCount] = useState(0);
  const [calendarDuration, setCalendarDuration] = useState(0);
  const [calendarWorkouts, setCalendarWorkouts] = useState<any[]>([]);
  const [weeklyTonnage, setWeeklyTonnage] = useState(0);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [showWorkoutLibrary, setShowWorkoutLibrary] = useState(false);
  const [showVideoCard, setShowVideoCard] = useState(false);
  const [selectedVideoCard, setSelectedVideoCard] = useState<any>(null);
  const [selectedLibraryWorkout, setSelectedLibraryWorkout] = useState<any>(null);
  const [showLibraryWorkoutPreview, setShowLibraryWorkoutPreview] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState(exerciseVideos);
  const [selectedExerciseCategory, setSelectedExerciseCategory] = useState('All');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [favoritedWorkouts, setFavoritedWorkouts] = useState<Set<string>>(new Set());

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Comprehensive Workout Library Data
  const premadeWorkouts = [
    {
      id: 'push-day',
      name: 'Push Day',
      category: 'Strength',
      description: 'Upper body pushing movements focusing on chest, shoulders, and triceps',
      duration: 45,
      calories: 350,
      difficulty: 'Intermediate',
      exercises: [
        { exercise: { id: '1', name: 'Bench Press', category: 'Chest', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Chest' }, sets: [{ reps: 8, weight: 135, restTime: 120, completed: false, actualReps: 8, actualWeight: 135, isActive: false }] },
        { exercise: { id: '2', name: 'Overhead Press', category: 'Shoulders', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Shoulders' }, sets: [{ reps: 8, weight: 95, restTime: 120, completed: false, actualReps: 8, actualWeight: 95, isActive: false }] },
        { exercise: { id: '3', name: 'Incline Dumbbell Press', category: 'Chest', difficulty: 'Intermediate', equipment: 'Dumbbells', muscle: 'Chest' }, sets: [{ reps: 10, weight: 60, restTime: 90, completed: false, actualReps: 10, actualWeight: 60, isActive: false }] },
        { exercise: { id: '4', name: 'Dips', category: 'Triceps', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Triceps' }, sets: [{ reps: 12, weight: 0, restTime: 90, completed: false, actualReps: 12, actualWeight: 0, isActive: false }] }
      ]
    },
    {
      id: 'pull-day',
      name: 'Pull Day',
      category: 'Strength',
      description: 'Upper body pulling movements focusing on back and biceps',
      duration: 50,
      calories: 380,
      difficulty: 'Intermediate',
      exercises: [
        { exercise: { id: '5', name: 'Pull-ups', category: 'Back', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Back' }, sets: [{ reps: 8, weight: 0, restTime: 120, completed: false, actualReps: 8, actualWeight: 0, isActive: false }] },
        { exercise: { id: '6', name: 'Barbell Rows', category: 'Back', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Back' }, sets: [{ reps: 8, weight: 115, restTime: 120, completed: false, actualReps: 8, actualWeight: 115, isActive: false }] },
        { exercise: { id: '7', name: 'Lat Pulldowns', category: 'Back', difficulty: 'Beginner', equipment: 'Cable', muscle: 'Back' }, sets: [{ reps: 10, weight: 100, restTime: 90, completed: false, actualReps: 10, actualWeight: 100, isActive: false }] },
        { exercise: { id: '8', name: 'Barbell Curls', category: 'Biceps', difficulty: 'Beginner', equipment: 'Barbell', muscle: 'Biceps' }, sets: [{ reps: 12, weight: 65, restTime: 90, completed: false, actualReps: 12, actualWeight: 65, isActive: false }] }
      ]
    },
    {
      id: 'leg-day',
      name: 'Leg Day',
      category: 'Strength',
      description: 'Lower body workout focusing on quads, hamstrings, and glutes',
      duration: 55,
      calories: 420,
      difficulty: 'Intermediate',
      exercises: [
        { exercise: { id: '9', name: 'Squats', category: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Quadriceps' }, sets: [{ reps: 8, weight: 185, restTime: 180, completed: false, actualReps: 8, actualWeight: 185, isActive: false }] },
        { exercise: { id: '10', name: 'Romanian Deadlifts', category: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Hamstrings' }, sets: [{ reps: 8, weight: 155, restTime: 150, completed: false, actualReps: 8, actualWeight: 155, isActive: false }] },
        { exercise: { id: '11', name: 'Bulgarian Split Squats', category: 'Legs', difficulty: 'Intermediate', equipment: 'Dumbbells', muscle: 'Quadriceps' }, sets: [{ reps: 10, weight: 40, restTime: 90, completed: false, actualReps: 10, actualWeight: 40, isActive: false }] },
        { exercise: { id: '12', name: 'Calf Raises', category: 'Legs', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Calves' }, sets: [{ reps: 15, weight: 0, restTime: 60, completed: false, actualReps: 15, actualWeight: 0, isActive: false }] }
      ]
    },
    {
      id: 'upper-body',
      name: 'Upper Body Day',
      category: 'Strength',
      description: 'Complete upper body workout for chest, back, shoulders, and arms',
      duration: 50,
      calories: 400,
      difficulty: 'Intermediate',
      exercises: [
        { exercise: { id: '13', name: 'Bench Press', category: 'Chest', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Chest' }, sets: [{ reps: 8, weight: 135, restTime: 120, completed: false, actualReps: 8, actualWeight: 135, isActive: false }] },
        { exercise: { id: '14', name: 'Pull-ups', category: 'Back', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Back' }, sets: [{ reps: 8, weight: 0, restTime: 120, completed: false, actualReps: 8, actualWeight: 0, isActive: false }] },
        { exercise: { id: '15', name: 'Overhead Press', category: 'Shoulders', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Shoulders' }, sets: [{ reps: 8, weight: 95, restTime: 120, completed: false, actualReps: 8, actualWeight: 95, isActive: false }] },
        { exercise: { id: '16', name: 'Barbell Rows', category: 'Back', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Back' }, sets: [{ reps: 8, weight: 115, restTime: 120, completed: false, actualReps: 8, actualWeight: 115, isActive: false }] }
      ]
    },
    {
      id: 'lower-body',
      name: 'Lower Body Day',
      category: 'Strength',
      description: 'Complete lower body workout for legs and glutes',
      duration: 45,
      calories: 380,
      difficulty: 'Intermediate',
      exercises: [
        { exercise: { id: '17', name: 'Squats', category: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Quadriceps' }, sets: [{ reps: 8, weight: 185, restTime: 180, completed: false, actualReps: 8, actualWeight: 185, isActive: false }] },
        { exercise: { id: '18', name: 'Romanian Deadlifts', category: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', muscle: 'Hamstrings' }, sets: [{ reps: 8, weight: 155, restTime: 150, completed: false, actualReps: 8, actualWeight: 155, isActive: false }] },
        { exercise: { id: '19', name: 'Lunges', category: 'Legs', difficulty: 'Beginner', equipment: 'Dumbbells', muscle: 'Quadriceps' }, sets: [{ reps: 12, weight: 30, restTime: 90, completed: false, actualReps: 12, actualWeight: 30, isActive: false }] },
        { exercise: { id: '20', name: 'Hip Thrusts', category: 'Glutes', difficulty: 'Beginner', equipment: 'Barbell', muscle: 'Glutes' }, sets: [{ reps: 12, weight: 95, restTime: 90, completed: false, actualReps: 12, actualWeight: 95, isActive: false }] }
      ]
    },
    {
      id: 'full-body',
      name: 'Full Body Day',
      category: 'Strength',
      description: 'Complete full body workout hitting all major muscle groups',
      duration: 60,
      calories: 450,
      difficulty: 'Intermediate',
      exercises: [
        { exercise: { id: '21', name: 'Deadlifts', category: 'Full Body', difficulty: 'Advanced', equipment: 'Barbell', muscle: 'Full Body' }, sets: [{ reps: 5, weight: 225, restTime: 180, completed: false, actualReps: 5, actualWeight: 225, isActive: false }] },
        { exercise: { id: '22', name: 'Push-ups', category: 'Chest', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Chest' }, sets: [{ reps: 15, weight: 0, restTime: 60, completed: false, actualReps: 15, actualWeight: 0, isActive: false }] },
        { exercise: { id: '23', name: 'Pull-ups', category: 'Back', difficulty: 'Intermediate', equipment: 'Bodyweight', muscle: 'Back' }, sets: [{ reps: 8, weight: 0, restTime: 120, completed: false, actualReps: 8, actualWeight: 0, isActive: false }] },
        { exercise: { id: '24', name: 'Lunges', category: 'Legs', difficulty: 'Beginner', equipment: 'Bodyweight', muscle: 'Legs' }, sets: [{ reps: 12, weight: 0, restTime: 90, completed: false, actualReps: 12, actualWeight: 0, isActive: false }] }
      ]
    },
    {
      id: 'yoga-morning',
      name: 'Morning Yoga Flow',
      category: 'Yoga',
      description: 'Gentle morning yoga sequence to start your day',
      duration: 30,
      calories: 150,
      difficulty: 'Beginner',
      exercises: [
        { exercise: { id: '25', name: 'Sun Salutation', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Full Body' }, sets: [{ reps: 5, weight: 0, restTime: 0, completed: false, actualReps: 5, actualWeight: 0, isActive: false }] },
        { exercise: { id: '26', name: 'Warrior Pose', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Legs' }, sets: [{ reps: 3, weight: 0, restTime: 0, completed: false, actualReps: 3, actualWeight: 0, isActive: false }] },
        { exercise: { id: '27', name: 'Downward Dog', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Full Body' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '28', name: 'Child\'s Pose', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Back' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] }
      ]
    },
    {
      id: 'yoga-evening',
      name: 'Evening Yoga Flow',
      category: 'Yoga',
      description: 'Relaxing evening yoga sequence for stress relief',
      duration: 40,
      calories: 200,
      difficulty: 'Beginner',
      exercises: [
        { exercise: { id: '29', name: 'Cat-Cow Stretch', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Back' }, sets: [{ reps: 10, weight: 0, restTime: 0, completed: false, actualReps: 10, actualWeight: 0, isActive: false }] },
        { exercise: { id: '30', name: 'Seated Forward Fold', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Hamstrings' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '31', name: 'Legs Up the Wall', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Legs' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '32', name: 'Corpse Pose', category: 'Yoga', difficulty: 'Beginner', equipment: 'Yoga Mat', muscle: 'Full Body' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] }
      ]
    },
    {
      id: 'stretching-basic',
      name: 'Basic Stretching',
      category: 'Stretching',
      description: 'Basic stretching routine for flexibility and recovery',
      duration: 20,
      calories: 100,
      difficulty: 'Beginner',
      exercises: [
        { exercise: { id: '33', name: 'Neck Stretch', category: 'Stretching', difficulty: 'Beginner', equipment: 'None', muscle: 'Neck' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '34', name: 'Shoulder Stretch', category: 'Stretching', difficulty: 'Beginner', equipment: 'None', muscle: 'Shoulders' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '35', name: 'Hip Flexor Stretch', category: 'Stretching', difficulty: 'Beginner', equipment: 'None', muscle: 'Hip Flexors' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '36', name: 'Hamstring Stretch', category: 'Stretching', difficulty: 'Beginner', equipment: 'None', muscle: 'Hamstrings' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] }
      ]
    },
    {
      id: 'stretching-advanced',
      name: 'Advanced Stretching',
      category: 'Stretching',
      description: 'Advanced stretching routine for improved flexibility',
      duration: 30,
      calories: 150,
      difficulty: 'Advanced',
      exercises: [
        { exercise: { id: '37', name: 'Pigeon Pose', category: 'Stretching', difficulty: 'Advanced', equipment: 'Yoga Mat', muscle: 'Hip Flexors' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '38', name: 'Frog Pose', category: 'Stretching', difficulty: 'Advanced', equipment: 'Yoga Mat', muscle: 'Hip Flexors' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '39', name: 'Splits', category: 'Stretching', difficulty: 'Advanced', equipment: 'Yoga Mat', muscle: 'Hamstrings' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] },
        { exercise: { id: '40', name: 'Backbend', category: 'Stretching', difficulty: 'Advanced', equipment: 'Yoga Mat', muscle: 'Spine' }, sets: [{ reps: 1, weight: 0, restTime: 0, completed: false, actualReps: 1, actualWeight: 0, isActive: false }] }
      ]
    },
    {
      id: 'powerlifting',
      name: 'Powerlifting Training',
      category: 'Powerlifting',
      description: 'Heavy compound movements for strength and power',
      duration: 90,
      calories: 500,
      difficulty: 'Advanced',
      exercises: [
        { exercise: { id: '41', name: 'Squat', category: 'Powerlifting', difficulty: 'Advanced', equipment: 'Barbell', muscle: 'Quadriceps' }, sets: [{ reps: 5, weight: 315, restTime: 300, completed: false, actualReps: 5, actualWeight: 315, isActive: false }] },
        { exercise: { id: '42', name: 'Bench Press', category: 'Powerlifting', difficulty: 'Advanced', equipment: 'Barbell', muscle: 'Chest' }, sets: [{ reps: 5, weight: 225, restTime: 300, completed: false, actualReps: 5, actualWeight: 225, isActive: false }] },
        { exercise: { id: '43', name: 'Deadlift', category: 'Powerlifting', difficulty: 'Advanced', equipment: 'Barbell', muscle: 'Full Body' }, sets: [{ reps: 5, weight: 405, restTime: 300, completed: false, actualReps: 5, actualWeight: 405, isActive: false }] },
        { exercise: { id: '44', name: 'Overhead Press', category: 'Powerlifting', difficulty: 'Advanced', equipment: 'Barbell', muscle: 'Shoulders' }, sets: [{ reps: 5, weight: 135, restTime: 180, completed: false, actualReps: 5, actualWeight: 135, isActive: false }] }
      ]
    },
    {
      id: 'crossfit-wod',
      name: 'CrossFit WOD',
      category: 'CrossFit',
      description: 'High-intensity CrossFit workout of the day',
      duration: 25,
      calories: 400,
      difficulty: 'Advanced',
      exercises: [
        { exercise: { id: '45', name: 'Burpees', category: 'CrossFit', difficulty: 'Advanced', equipment: 'Bodyweight', muscle: 'Full Body' }, sets: [{ reps: 20, weight: 0, restTime: 0, completed: false, actualReps: 20, actualWeight: 0, isActive: false }] },
        { exercise: { id: '46', name: 'Thrusters', category: 'CrossFit', difficulty: 'Advanced', equipment: 'Barbell', muscle: 'Full Body' }, sets: [{ reps: 15, weight: 95, restTime: 0, completed: false, actualReps: 15, actualWeight: 95, isActive: false }] },
        { exercise: { id: '47', name: 'Pull-ups', category: 'CrossFit', difficulty: 'Advanced', equipment: 'Bodyweight', muscle: 'Back' }, sets: [{ reps: 10, weight: 0, restTime: 0, completed: false, actualReps: 10, actualWeight: 0, isActive: false }] },
        { exercise: { id: '48', name: 'Box Jumps', category: 'CrossFit', difficulty: 'Advanced', equipment: 'Box', muscle: 'Legs' }, sets: [{ reps: 15, weight: 0, restTime: 0, completed: false, actualReps: 15, actualWeight: 0, isActive: false }] }
      ]
    }
  ];

  // Get exercises from user's custom workouts
  const getUserExercises = () => {
    const exercises: any[] = [];
    customWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (!exercises.find(ex => ex.name === exercise.name)) {
          exercises.push({
            id: exercise.id || Math.random().toString(),
            name: exercise.name,
            category: exercise.category || 'General',
            difficulty: exercise.difficulty || 'Intermediate',
            videoUrl: exercise.videoUrl || 'https://www.youtube.com/watch?v=example'
          });
        }
      });
    });
    return exercises;
  };

  // Predefined exercise videos (60 total)
  const exerciseVideos = [
    { id: '1', name: 'Push-ups', category: 'Chest', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
    { id: '2', name: 'Squats', category: 'Legs', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=YaXPRqUwItQ' },
    { id: '3', name: 'Pull-ups', category: 'Back', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
    { id: '4', name: 'Deadlifts', category: 'Back', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q' },
    { id: '5', name: 'Bench Press', category: 'Chest', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg' },
    { id: '6', name: 'Overhead Press', category: 'Shoulders', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=QAJK64eMqB0' },
    { id: '7', name: 'Lunges', category: 'Legs', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=3XDriUn0udo' },
    { id: '8', name: 'Planks', category: 'Core', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw' },
    { id: '9', name: 'Bicep Curls', category: 'Arms', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo' },
    { id: '10', name: 'Tricep Dips', category: 'Arms', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=6kALZikBxLc' },
    { id: '11', name: 'Incline Bench Press', category: 'Chest', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=8iPEnov-lmU' },
    { id: '12', name: 'Romanian Deadlifts', category: 'Legs', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=ytGaGIn3SjE' },
    { id: '13', name: 'Lat Pulldowns', category: 'Back', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Lu78' },
    { id: '14', name: 'Shoulder Press', category: 'Shoulders', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=QAJK64eMqB0' },
    { id: '15', name: 'Leg Press', category: 'Legs', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ' },
    { id: '16', name: 'Chest Flyes', category: 'Chest', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0' },
    { id: '17', name: 'Bent Over Rows', category: 'Back', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=paCfxQrQxU8' },
    { id: '18', name: 'Lateral Raises', category: 'Shoulders', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=3VcKXH1u3kM' },
    { id: '19', name: 'Hammer Curls', category: 'Arms', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=TwD-YGVP4Bk' },
    { id: '20', name: 'Close Grip Bench Press', category: 'Arms', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=nEF0bv2FW94' },
    { id: '21', name: 'Bulgarian Split Squats', category: 'Legs', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE' },
    { id: '22', name: 'Cable Rows', category: 'Back', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74' },
    { id: '23', name: 'Incline Dumbbell Press', category: 'Chest', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=8iPEnov-lmU' },
    { id: '24', name: 'Front Squats', category: 'Legs', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=uYumuLmkVz8' },
    { id: '25', name: 'Face Pulls', category: 'Back', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk' },
    { id: '26', name: 'Dumbbell Rows', category: 'Back', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=roCP6wCXPqo' },
    { id: '27', name: 'Hip Thrusts', category: 'Legs', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=uYumuLmkVz8' },
    { id: '28', name: 'Arnold Press', category: 'Shoulders', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=6Z15_WdXmVw' },
    { id: '29', name: 'Calf Raises', category: 'Legs', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=3VcKXH1u3kM' },
    { id: '30', name: 'Russian Twists', category: 'Core', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI' },
    { id: '31', name: 'Mountain Climbers', category: 'Core', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=nmwgirgXLYM' },
    { id: '32', name: 'Burpees', category: 'Full Body', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=TU8QYVW0gDU' },
    { id: '33', name: 'Jump Squats', category: 'Legs', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=UYt5IF5bHjE' },
    { id: '34', name: 'Diamond Push-ups', category: 'Chest', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=jaxbEHLC4qU' },
    { id: '35', name: 'Chin-ups', category: 'Back', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=brhRXlOeR4s' },
    { id: '36', name: 'Pike Push-ups', category: 'Shoulders', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=3VcKXH1u3kM' },
    { id: '37', name: 'Single Leg Deadlifts', category: 'Legs', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=Q4gMV4uXzxQ' },
    { id: '38', name: 'Inverted Rows', category: 'Back', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=FXo0iD4kIhI' },
    { id: '39', name: 'Decline Push-ups', category: 'Chest', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=SKPab2YC8BE' },
    { id: '40', name: 'Wall Sits', category: 'Legs', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=YQVlZo6tcvA' },
    { id: '41', name: 'Superman', category: 'Back', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=ccMXLH6lcWU' },
    { id: '42', name: 'Side Planks', category: 'Core', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=K2VljzCC16g' },
    { id: '43', name: 'Hindu Push-ups', category: 'Chest', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=4f3Oy5Jnj44' },
    { id: '44', name: 'Glute Bridges', category: 'Legs', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=wPM8icPu6H8' },
    { id: '45', name: 'Reverse Flyes', category: 'Back', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=paCfxQrQxU8' },
    { id: '46', name: 'Pistol Squats', category: 'Legs', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=YaXPRqUwItQ' },
    { id: '47', name: 'Handstand Push-ups', category: 'Shoulders', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=3VcKXH1u3kM' },
    { id: '48', name: 'L-sits', category: 'Core', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=Wx3gVTHHdBY' },
    { id: '49', name: 'Muscle-ups', category: 'Full Body', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=4f3Oy5Jnj44' },
    { id: '50', name: 'Turkish Get-ups', category: 'Full Body', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=0bWRPC49-KI' },
    { id: '51', name: 'Kettlebell Swings', category: 'Full Body', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=YSxHifyI6s8' },
    { id: '52', name: 'Box Jumps', category: 'Legs', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=UYt5IF5bHjE' },
    { id: '53', name: 'Battle Ropes', category: 'Full Body', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=UYt5IF5bHjE' },
    { id: '54', name: 'Farmer\'s Walk', category: 'Full Body', difficulty: 'Beginner', videoUrl: 'https://www.youtube.com/watch?v=Fkzk_RqlYig' },
    { id: '55', name: 'Sled Push', category: 'Full Body', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=UYt5IF5bHjE' },
    { id: '56', name: 'Rope Climbing', category: 'Full Body', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=4f3Oy5Jnj44' },
    { id: '57', name: 'Tire Flips', category: 'Full Body', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=UYt5IF5bHjE' },
    { id: '58', name: 'Sandbag Carries', category: 'Full Body', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=Fkzk_RqlYig' },
    { id: '59', name: 'Sledgehammer Swings', category: 'Full Body', difficulty: 'Intermediate', videoUrl: 'https://www.youtube.com/watch?v=UYt5IF5bHjE' },
    { id: '60', name: 'Atlas Stone Lifts', category: 'Full Body', difficulty: 'Advanced', videoUrl: 'https://www.youtube.com/watch?v=UYt5IF5bHjE' }
  ];

  // Comprehensive Workout Library
  const workoutLibrary = {
    strength: [
      {
        id: 'push-day',
        name: 'Push Day',
        category: 'Strength',
        difficulty: 'Intermediate',
        duration: 75,
        description: 'Complete upper body push workout targeting chest, shoulders, and triceps',
      exercises: [
          { name: 'Bench Press', sets: 4, reps: '8-10', rest: '2-3 min' },
          { name: 'Overhead Press', sets: 4, reps: '8-10', rest: '2-3 min' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '90 sec' },
          { name: 'Lateral Raises', sets: 3, reps: '12-15', rest: '60 sec' },
          { name: 'Tricep Dips', sets: 3, reps: '10-15', rest: '60 sec' },
          { name: 'Close Grip Bench Press', sets: 3, reps: '8-10', rest: '90 sec' }
        ]
      },
      {
        id: 'pull-day',
        name: 'Pull Day',
        category: 'Strength',
      difficulty: 'Intermediate',
        duration: 75,
        description: 'Complete upper body pull workout targeting back and biceps',
      exercises: [
          { name: 'Deadlifts', sets: 4, reps: '5-6', rest: '3-4 min' },
          { name: 'Pull-ups', sets: 4, reps: '6-10', rest: '2-3 min' },
          { name: 'Bent Over Rows', sets: 4, reps: '8-10', rest: '2-3 min' },
          { name: 'Lat Pulldowns', sets: 3, reps: '10-12', rest: '90 sec' },
          { name: 'Bicep Curls', sets: 3, reps: '12-15', rest: '60 sec' },
          { name: 'Hammer Curls', sets: 3, reps: '12-15', rest: '60 sec' }
        ]
      },
      {
        id: 'leg-day',
        name: 'Leg Day',
        category: 'Strength',
      difficulty: 'Intermediate',
        duration: 90,
        description: 'Complete lower body workout targeting quads, hamstrings, and glutes',
      exercises: [
          { name: 'Squats', sets: 4, reps: '8-10', rest: '3-4 min' },
          { name: 'Romanian Deadlifts', sets: 4, reps: '8-10', rest: '2-3 min' },
          { name: 'Leg Press', sets: 3, reps: '12-15', rest: '90 sec' },
          { name: 'Walking Lunges', sets: 3, reps: '12 each leg', rest: '90 sec' },
          { name: 'Leg Curls', sets: 3, reps: '12-15', rest: '60 sec' },
          { name: 'Calf Raises', sets: 4, reps: '15-20', rest: '60 sec' }
        ]
      },
      {
        id: 'upper-body',
        name: 'Upper Body',
        category: 'Strength',
      difficulty: 'Beginner',
        duration: 60,
        description: 'Complete upper body workout for all pushing and pulling muscles',
      exercises: [
          { name: 'Push-ups', sets: 3, reps: '10-15', rest: '60 sec' },
          { name: 'Pull-ups/Assisted', sets: 3, reps: '5-10', rest: '90 sec' },
          { name: 'Dumbbell Press', sets: 3, reps: '10-12', rest: '90 sec' },
          { name: 'Rows', sets: 3, reps: '10-12', rest: '90 sec' },
          { name: 'Lateral Raises', sets: 3, reps: '12-15', rest: '60 sec' },
          { name: 'Bicep Curls', sets: 3, reps: '12-15', rest: '60 sec' }
        ]
      },
      {
        id: 'lower-body',
        name: 'Lower Body',
        category: 'Strength',
        difficulty: 'Beginner',
        duration: 60,
        description: 'Complete lower body workout for legs and glutes',
        exercises: [
          { name: 'Bodyweight Squats', sets: 3, reps: '15-20', rest: '60 sec' },
          { name: 'Lunges', sets: 3, reps: '10 each leg', rest: '90 sec' },
          { name: 'Glute Bridges', sets: 3, reps: '15-20', rest: '60 sec' },
          { name: 'Calf Raises', sets: 3, reps: '15-20', rest: '60 sec' },
          { name: 'Wall Sits', sets: 3, reps: '30-45 sec', rest: '60 sec' },
          { name: 'Step-ups', sets: 3, reps: '10 each leg', rest: '60 sec' }
        ]
      },
      {
        id: 'full-body',
        name: 'Full Body',
        category: 'Strength',
        difficulty: 'Beginner',
        duration: 45,
        description: 'Complete full body workout hitting all major muscle groups',
        exercises: [
          { name: 'Squats', sets: 3, reps: '12-15', rest: '90 sec' },
          { name: 'Push-ups', sets: 3, reps: '8-12', rest: '90 sec' },
          { name: 'Lunges', sets: 3, reps: '8 each leg', rest: '90 sec' },
          { name: 'Planks', sets: 3, reps: '30-45 sec', rest: '60 sec' },
          { name: 'Mountain Climbers', sets: 3, reps: '20-30', rest: '60 sec' },
          { name: 'Burpees', sets: 3, reps: '5-8', rest: '90 sec' }
        ]
      }
    ],
    powerlifting: [
      {
        id: 'powerlifting-beginner',
        name: 'Powerlifting Beginner',
        category: 'Powerlifting',
        difficulty: 'Beginner',
        duration: 90,
        description: 'Introduction to powerlifting with focus on the big three lifts',
        exercises: [
          { name: 'Squats', sets: 5, reps: '5', rest: '3-5 min' },
          { name: 'Bench Press', sets: 5, reps: '5', rest: '3-5 min' },
          { name: 'Deadlifts', sets: 5, reps: '5', rest: '3-5 min' },
          { name: 'Overhead Press', sets: 3, reps: '8', rest: '2-3 min' },
          { name: 'Barbell Rows', sets: 3, reps: '8', rest: '2-3 min' }
        ]
      },
      {
        id: 'powerlifting-intermediate',
        name: 'Powerlifting Intermediate',
        category: 'Powerlifting',
        difficulty: 'Intermediate',
        duration: 120,
        description: 'Intermediate powerlifting program with accessory work',
        exercises: [
          { name: 'Squats', sets: 6, reps: '3', rest: '4-5 min' },
          { name: 'Bench Press', sets: 6, reps: '3', rest: '4-5 min' },
          { name: 'Deadlifts', sets: 6, reps: '3', rest: '4-5 min' },
          { name: 'Incline Bench Press', sets: 4, reps: '6', rest: '3 min' },
          { name: 'Pause Squats', sets: 3, reps: '5', rest: '3 min' },
          { name: 'Romanian Deadlifts', sets: 4, reps: '8', rest: '2-3 min' }
        ]
      }
    ],
    crossfit: [
      {
        id: 'crossfit-amrap',
        name: 'CrossFit AMRAP',
        category: 'CrossFit',
        difficulty: 'Intermediate',
        duration: 20,
        description: 'As Many Rounds As Possible in 20 minutes',
        exercises: [
          { name: 'Burpees', sets: 1, reps: '10', rest: '0' },
          { name: 'Kettlebell Swings', sets: 1, reps: '15', rest: '0' },
          { name: 'Box Jumps', sets: 1, reps: '20', rest: '0' },
          { name: 'Wall Balls', sets: 1, reps: '25', rest: '0' }
        ]
      },
      {
        id: 'crossfit-emom',
        name: 'CrossFit EMOM',
        category: 'CrossFit',
      difficulty: 'Advanced',
        duration: 15,
        description: 'Every Minute On the Minute for 15 minutes',
        exercises: [
          { name: 'Thrusters', sets: 1, reps: '5', rest: '0' },
          { name: 'Pull-ups', sets: 1, reps: '10', rest: '0' },
          { name: 'Double Unders', sets: 1, reps: '20', rest: '0' }
        ]
      },
      {
        id: 'crossfit-hero',
        name: 'CrossFit Hero WOD',
        category: 'CrossFit',
        difficulty: 'Advanced',
        duration: 30,
        description: 'Hero workout honoring fallen soldiers',
        exercises: [
          { name: 'Run', sets: 1, reps: '1 mile', rest: '0' },
          { name: 'Pull-ups', sets: 1, reps: '100', rest: '0' },
          { name: 'Push-ups', sets: 1, reps: '200', rest: '0' },
          { name: 'Squats', sets: 1, reps: '300', rest: '0' },
          { name: 'Run', sets: 1, reps: '1 mile', rest: '0' }
        ]
      }
    ],
    yoga: [
      {
        id: 'morning-yoga',
        name: 'Morning Yoga Flow',
        category: 'Yoga',
        difficulty: 'Beginner',
        duration: 30,
        description: 'Gentle morning yoga routine to start your day',
        videoUrl: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
        thumbnail: 'https://img.youtube.com/vi/v7AYKMP6rOE/maxresdefault.jpg'
      },
      {
        id: 'power-yoga',
        name: 'Power Yoga',
        category: 'Yoga',
        difficulty: 'Intermediate',
        duration: 45,
        description: 'Dynamic power yoga flow for strength and flexibility',
        videoUrl: 'https://www.youtube.com/watch?v=6p6y7k43bXY',
        thumbnail: 'https://img.youtube.com/vi/6p6y7k43bXY/maxresdefault.jpg'
      },
      {
        id: 'yoga-flexibility',
        name: 'Flexibility Yoga',
        category: 'Yoga',
        difficulty: 'Beginner',
        duration: 25,
        description: 'Yoga routine focused on improving flexibility',
        videoUrl: 'https://www.youtube.com/watch?v=4pKly2JojMw',
        thumbnail: 'https://img.youtube.com/vi/4pKly2JojMw/maxresdefault.jpg'
      },
      {
        id: 'yoga-strength',
        name: 'Yoga for Strength',
        category: 'Yoga',
        difficulty: 'Intermediate',
        duration: 40,
        description: 'Yoga practice building strength and stability',
        videoUrl: 'https://www.youtube.com/watch?v=9kOCY0KNByw',
        thumbnail: 'https://img.youtube.com/vi/9kOCY0KNByw/maxresdefault.jpg'
      }
    ],
    stretching: [
      {
        id: 'morning-stretch',
        name: 'Morning Stretch Routine',
        category: 'Stretching',
        difficulty: 'Beginner',
        duration: 15,
        description: 'Quick morning stretching routine to wake up your body',
        videoUrl: 'https://www.youtube.com/watch?v=4pKly2JojMw',
        thumbnail: 'https://img.youtube.com/vi/4pKly2JojMw/maxresdefault.jpg'
      },
      {
        id: 'post-workout-stretch',
        name: 'Post-Workout Stretch',
        category: 'Stretching',
        difficulty: 'Beginner',
      duration: 20,
        description: 'Essential stretches to do after any workout',
        videoUrl: 'https://www.youtube.com/watch?v=4pKly2JojMw',
        thumbnail: 'https://img.youtube.com/vi/4pKly2JojMw/maxresdefault.jpg'
      },
      {
        id: 'flexibility-stretch',
        name: 'Flexibility Stretching',
        category: 'Stretching',
        difficulty: 'Intermediate',
        duration: 30,
        description: 'Deep stretching routine to improve overall flexibility',
        videoUrl: 'https://www.youtube.com/watch?v=4pKly2JojMw',
        thumbnail: 'https://img.youtube.com/vi/4pKly2JojMw/maxresdefault.jpg'
      },
      {
        id: 'hip-flexor-stretch',
        name: 'Hip Flexor Stretch',
        category: 'Stretching',
        difficulty: 'Beginner',
        duration: 10,
        description: 'Targeted stretches for tight hip flexors',
        videoUrl: 'https://www.youtube.com/watch?v=4pKly2JojMw',
        thumbnail: 'https://img.youtube.com/vi/4pKly2JojMw/maxresdefault.jpg'
      }
    ]
  };

  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sample data for demonstration
  const sampleWorkouts: CustomWorkout[] = [
    {
      id: '1',
      name: 'Push Day',
      description: 'Upper body strength training',
      createdAt: new Date(),
      exercises: [
        {
          exercise: {
            id: '1',
            name: 'Bench Press',
            category: 'Chest',
            difficulty: 'Intermediate',
            equipment: 'Barbell',
            muscle: 'Chest, Shoulders, Triceps',
            instructions: 'Lie on bench, lower bar to chest, press up',
            videoUrl: 'https://www.youtube.com/watch?v=example1'
          },
          sets: [
            { reps: 10, weight: 135, restTime: 90, completed: false, actualReps: 10, actualWeight: 135, isActive: false },
            { reps: 8, weight: 155, restTime: 90, completed: false, actualReps: 8, actualWeight: 155, isActive: false },
            { reps: 6, weight: 175, restTime: 120, completed: false, actualReps: 6, actualWeight: 175, isActive: false }
          ]
        },
        {
          exercise: {
            id: '2',
            name: 'Overhead Press',
            category: 'Shoulders',
            difficulty: 'Intermediate',
            equipment: 'Barbell',
            muscle: 'Shoulders, Triceps',
            instructions: 'Press barbell overhead from shoulder level',
            videoUrl: 'https://www.youtube.com/watch?v=example2'
          },
          sets: [
            { reps: 12, weight: 95, restTime: 60, completed: false },
            { reps: 10, weight: 105, restTime: 60, completed: false },
            { reps: 8, weight: 115, restTime: 90, completed: false }
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Pull Day',
      description: 'Back and bicep focused workout',
      createdAt: new Date(),
      exercises: [
        {
          exercise: {
            id: '3',
            name: 'Deadlift',
            category: 'Back',
            difficulty: 'Advanced',
            equipment: 'Barbell',
            muscle: 'Back, Glutes, Hamstrings',
            instructions: 'Lift barbell from floor to hip level',
            videoUrl: 'https://www.youtube.com/watch?v=example3'
          },
          sets: [
            { reps: 8, weight: 225, restTime: 120, completed: false },
            { reps: 6, weight: 245, restTime: 120, completed: false },
            { reps: 4, weight: 275, restTime: 120, completed: false }
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    loadUserData();
    loadCustomWorkouts();
    initializeOfflineManager();
  }, []);

  // Timer effect for workout
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (showWorkoutModal && isTimerRunning) {
      interval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showWorkoutModal, isTimerRunning]);

  useEffect(() => {
    if (showWorkoutCalendar) {
      loadCalendarData(selectedDate);
    }
  }, [showWorkoutCalendar]);

  // Load today's data for dashboard
  useEffect(() => {
    loadCalendarData(new Date());
    loadWeeklyTonnage();
  }, []);

  const loadWeeklyTonnage = async () => {
    try {
      const weekly = await DataStorage.calculateWeeklyTonnage();
      setWeeklyTonnage(weekly);
    } catch (error) {
      console.error('Error loading weekly tonnage:', error);
    }
  };


  const initializeOfflineManager = async () => {
    try {
      if (OfflineManager) {
        const offlineManager = OfflineManager.getInstance();
        const isOnline = offlineManager.getIsOnline();
        setIsOffline(!isOnline);
        
        offlineManager.addListener((online) => {
          setIsOffline(!online);
        });
      }
    } catch (error) {
      console.error('Error initializing offline manager:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const logs = await DataStorage.getWorkoutLogs();
      const stats = await DataStorage.getUserStats();
      setWorkoutLogs(logs);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomWorkouts = async () => {
    try {
      const workouts = await DataStorage.getCustomWorkouts();
      setCustomWorkouts(workouts.length > 0 ? workouts : sampleWorkouts);
    } catch (error) {
      console.error('Error loading custom workouts:', error);
      setCustomWorkouts(sampleWorkouts);
    }
  };

  const handleWorkoutCreated = (newWorkout: CustomWorkout) => {
    setCustomWorkouts(prev => [...prev, newWorkout]);
    setShowCustomBuilder(false);
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };



  const finishWorkout = async () => {
    if (!workoutData || !activeWorkout) return;
    
    const endTime = new Date();
    const totalTime = Math.floor((endTime.getTime() - workoutData.startTime.getTime()) / 1000);
    
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

  const calculateCaloriesBurned = (durationInSeconds: number, tonnage: number) => {
    const caloriesFromDuration = durationInSeconds / 60 * 5;
    const caloriesFromTonnage = tonnage / 1000 * 2;
    return Math.round(caloriesFromDuration + caloriesFromTonnage);
  };

  const calculateCompletionRate = (exercises: any[]) => {
    if (!exercises || exercises.length === 0) return 0;
    
    let totalSets = 0;
    let completedSets = 0;
    
    exercises.forEach(exercise => {
      if (exercise.sets && Array.isArray(exercise.sets)) {
        exercise.sets.forEach(set => {
          totalSets++;
          if (set.completed) {
            completedSets++;
          }
        });
      }
    });
    
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  };

  const handleStartWorkout = (workout: CustomWorkout) => {
    // Start workout directly
    setActiveWorkout(workout);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setWorkoutStartTime(new Date());
    setWorkoutTimer(0);
    setShowWorkoutModal(true);
    
    // Initialize workout data
    const initialWorkoutData = {
      startTime: new Date(),
      endTime: null,
      totalTime: 0,
      timeSpentLifting: 0,
      totalTonnage: 0,
      tonnagePerMuscleGroup: {},
      restTimer: 0,
      exercises: workout.exercises.map(ex => ({
        ...ex,
        sets: Array.isArray(ex.sets) ? ex.sets.map(set => ({ 
          ...set, 
          completed: false, 
          actualReps: set.reps, 
          actualWeight: set.weight,
          isActive: false
        })) : []
      }))
    };
    setWorkoutData(initialWorkoutData);
    
    // Start the workout timer
    startTimer();
  };

  const handlePreviewWorkout = (workout: CustomWorkout) => {
    setPreviewWorkout(workout);
    setShowWorkoutPreview(true);
  };

  const getInputKey = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight') => {
    return `${exerciseIndex}-${setIndex}-${field}`;
  };

  const getInputValue = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', defaultValue: number) => {
    const key = getInputKey(exerciseIndex, setIndex, field);
    if (inputValues[key] !== undefined) {
      return inputValues[key];
    }
    // Only return default value if the field has never been touched
    return '';
  };

  const setInputValue = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) => {
    const key = getInputKey(exerciseIndex, setIndex, field);
    setInputValues(prev => ({ ...prev, [key]: value }));
  };

  const updateSetData = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
    if (!workoutData) return;
    
    const updatedWorkoutData = { ...workoutData };
    const exercise = updatedWorkoutData.exercises[exerciseIndex];
    if (exercise && exercise.sets && exercise.sets[setIndex]) {
      const set = exercise.sets[setIndex];
      if (field === 'reps') {
        set.actualReps = value;
      } else if (field === 'weight') {
        set.actualWeight = value;
      }
      
      // Recalculate total tonnage when values change
      let totalTonnage = 0;
      let tonnagePerMuscleGroup: {[key: string]: number} = {};
      
      updatedWorkoutData.exercises.forEach((ex: any) => {
        if (ex.sets && Array.isArray(ex.sets)) {
          ex.sets.forEach((s: any) => {
            if (s.completed && s.actualReps > 0 && s.actualWeight > 0) {
              const tonnage = s.actualReps * s.actualWeight;
              totalTonnage += tonnage;
              
              // Add to muscle group tonnage
              if (ex.exercise && ex.exercise.targetMuscles) {
                ex.exercise.targetMuscles.forEach((muscle: string) => {
                  tonnagePerMuscleGroup[muscle] = (tonnagePerMuscleGroup[muscle] || 0) + tonnage;
                });
              }
            }
          });
        }
      });
      updatedWorkoutData.totalTonnage = totalTonnage;
      updatedWorkoutData.tonnagePerMuscleGroup = tonnagePerMuscleGroup;
      
      setWorkoutData(updatedWorkoutData);
    }
  };

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    if (!workoutData) return;
    
    const updatedWorkoutData = { ...workoutData };
    const exercise = updatedWorkoutData.exercises[exerciseIndex];
    if (!exercise || !exercise.sets || !exercise.sets[setIndex]) return;
    
    const set = exercise.sets[setIndex];
    
    // Get current input values and update the set
    const weightKey = getInputKey(exerciseIndex, setIndex, 'weight');
    const repsKey = getInputKey(exerciseIndex, setIndex, 'reps');
    const currentWeight = inputValues[weightKey] ? parseInt(inputValues[weightKey]) || 0 : set.actualWeight || 0;
    const currentReps = inputValues[repsKey] ? parseInt(inputValues[repsKey]) || 0 : set.actualReps || 0;
    
    set.actualWeight = currentWeight;
    set.actualReps = currentReps;
    set.completed = true;
    
    // Recalculate total tonnage from all completed sets
    let totalTonnage = 0;
    let tonnagePerMuscleGroup: {[key: string]: number} = {};
    
    updatedWorkoutData.exercises.forEach((ex: any) => {
      if (ex.sets && Array.isArray(ex.sets)) {
        ex.sets.forEach((s: any) => {
          if (s.completed && s.actualReps > 0 && s.actualWeight > 0) {
            const tonnage = s.actualReps * s.actualWeight;
            totalTonnage += tonnage;
            
            // Add to muscle group tonnage
            if (ex.exercise && ex.exercise.targetMuscles) {
              ex.exercise.targetMuscles.forEach((muscle: string) => {
                tonnagePerMuscleGroup[muscle] = (tonnagePerMuscleGroup[muscle] || 0) + tonnage;
              });
            }
          }
        });
      }
    });
    
    updatedWorkoutData.totalTonnage = totalTonnage;
    updatedWorkoutData.tonnagePerMuscleGroup = tonnagePerMuscleGroup;
    
    setWorkoutData(updatedWorkoutData);
    
    // Move to next set or exercise
    const currentExercise = updatedWorkoutData.exercises[exerciseIndex];
    if (setIndex < (currentExercise.sets || []).length - 1) {
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

  const toggleSetTimer = (exerciseIndex: number, setIndex: number) => {
    if (!workoutData) return;
    
    setWorkoutData(prev => {
      if (!prev) return prev;
      
      const updatedWorkoutData = { ...prev };
      const exercise = updatedWorkoutData.exercises[exerciseIndex];
      const set = exercise.sets[setIndex];
      
      // Ensure properties exist with safe defaults
      if (typeof set.isActive !== 'boolean') set.isActive = false;
      if (typeof set.completed !== 'boolean') set.completed = false;
      if (typeof set.actualReps !== 'number') set.actualReps = set.reps || 0;
      if (typeof set.actualWeight !== 'number') set.actualWeight = set.weight || 0;
      
      if (set.isActive) {
        // Stop the set
        set.isActive = false;
        set.completed = true;
        
        // Get current input values and update the set
        const weightKey = getInputKey(exerciseIndex, setIndex, 'weight');
        const repsKey = getInputKey(exerciseIndex, setIndex, 'reps');
        const currentWeight = inputValues[weightKey] ? parseInt(inputValues[weightKey]) || 0 : set.actualWeight || 0;
        const currentReps = inputValues[repsKey] ? parseInt(inputValues[repsKey]) || 0 : set.actualReps || 0;
        
        set.actualWeight = currentWeight;
        set.actualReps = currentReps;
        
        // Recalculate total tonnage from all completed sets
        let totalTonnage = 0;
        let tonnagePerMuscleGroup: {[key: string]: number} = {};
        
        updatedWorkoutData.exercises.forEach((ex: any) => {
          if (ex.sets && Array.isArray(ex.sets)) {
            ex.sets.forEach((s: any) => {
              if (s.completed && s.actualReps > 0 && s.actualWeight > 0) {
                const tonnage = s.actualReps * s.actualWeight;
                totalTonnage += tonnage;
                
                // Add to muscle group tonnage
                if (ex.exercise && ex.exercise.targetMuscles) {
                  ex.exercise.targetMuscles.forEach((muscle: string) => {
                    tonnagePerMuscleGroup[muscle] = (tonnagePerMuscleGroup[muscle] || 0) + tonnage;
                  });
                }
              }
            });
          }
        });
        
        updatedWorkoutData.totalTonnage = totalTonnage;
        updatedWorkoutData.tonnagePerMuscleGroup = tonnagePerMuscleGroup;
        
        // Start rest timer
        updatedWorkoutData.restTimer = set.restTime || 90;
        startRestTimer();
      } else {
        // Start the set
        set.isActive = true;
        // Stop any other active sets
        updatedWorkoutData.exercises.forEach((ex, exIndex) => {
          ex.sets.forEach((s, sIndex) => {
            if (exIndex !== exerciseIndex || sIndex !== setIndex) {
              s.isActive = false;
            }
          });
        });
      }
      
      return updatedWorkoutData;
    });
  };

  const addNewSet = (exerciseIndex: number) => {
    if (!workoutData) return;
    
    const updatedWorkoutData = { ...workoutData };
    const exercise = updatedWorkoutData.exercises[exerciseIndex];
    
    const newSet = {
      reps: 10,
      weight: 135,
      restTime: 90,
      completed: false,
      actualReps: 10,
      actualWeight: 135,
      isActive: false
    };
    
    exercise.sets.push(newSet);
    setWorkoutData(updatedWorkoutData);
  };

  const skipRest = () => {
    if (!workoutData) return;
    
    const updatedWorkoutData = { ...workoutData };
    updatedWorkoutData.restTimer = 0;
    setWorkoutData(updatedWorkoutData);
    stopRestTimer();
  };

  const startRestTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setWorkoutData(prev => {
        if (!prev || !prev.restTimer) return prev;
        
        const newRestTimer = prev.restTimer - 1;
        if (newRestTimer <= 0) {
          clearInterval(timerRef.current!);
          return { ...prev, restTimer: 0 };
        }
        
        return { ...prev, restTimer: newRestTimer };
      });
    }, 1000);
  };

  const stopRestTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const endWorkout = () => {
    if (!workoutData || !workoutStartTime) return;
    
    const endTime = new Date();
    const totalTime = Math.floor((endTime.getTime() - workoutStartTime.getTime()) / 1000);
    
    const finalWorkoutData = {
      ...workoutData,
      endTime,
      totalTime,
      timeSpentLifting: totalTime * 0.7 // Estimate 70% of time spent lifting
    };
    
    setWorkoutData(finalWorkoutData);
    
    // Create workout summary
    const summary = {
      id: `workout_${Date.now()}`,
      workout: activeWorkout,
      date: new Date().toISOString(),
      duration: Math.floor(finalWorkoutData.totalTime / 60), // Convert to minutes
      totalTonnage: finalWorkoutData.totalTonnage,
      completionRate: calculateCompletionRate(finalWorkoutData.exercises),
      caloriesBurned: calculateCaloriesBurned(finalWorkoutData.totalTime, finalWorkoutData.totalTonnage),
      exercises: finalWorkoutData.exercises,
      tonnagePerMuscleGroup: finalWorkoutData.tonnagePerMuscleGroup
    };
    
    setWorkoutSummary(summary);
    setShowWorkoutSummary(true);
    setShowWorkoutModal(false);
  };

  const saveWorkout = async () => {
    if (!workoutData) return;
    
    // Save workout log
    const workoutLog = {
      id: `workout_${Date.now()}`,
      workoutId: activeWorkout?.id,
      workoutName: activeWorkout?.name,
      date: new Date().toISOString(),
      duration: Math.floor(workoutData.totalTime / 60), // Convert seconds to minutes
      totalTonnage: workoutData.totalTonnage,
      exercises: workoutData.exercises,
      tonnagePerMuscleGroup: workoutData.tonnagePerMuscleGroup
    };
    
    try {
      // Save workout log
      await DataStorage.addWorkoutLog(new Date().toISOString().split('T')[0], workoutLog);
      
      // Update tonnage stats
      if (workoutData.totalTonnage > 0) {
        await DataStorage.updateTonnageStats(workoutData.totalTonnage);
      }
      
      // Update workout streak
      await DataStorage.updateWorkoutStreak();
      
      // Check for PRs and show notifications
      await checkForPRs(workoutData.exercises);
      
      // Create workout summary for the second modal
      const summary = {
        id: workoutLog.id,
        workout: activeWorkout,
        date: workoutLog.date,
        duration: workoutLog.duration,
        totalTonnage: workoutLog.totalTonnage,
        completionRate: calculateCompletionRate(workoutData.exercises),
        caloriesBurned: calculateCaloriesBurned(workoutData.totalTime, workoutData.totalTonnage),
        exercises: workoutData.exercises,
        tonnagePerMuscleGroup: workoutData.tonnagePerMuscleGroup
      };
      
      setWorkoutSummary(summary);
      setShowWorkoutSummary(false); // Hide the first modal
      setShowWorkoutSummaryFinal(true); // Show the second modal
      setShowEndWorkoutModal(false);
      
      // Reload weekly tonnage, calendar data, and user stats
      loadWeeklyTonnage();
      loadCalendarData(new Date());
      loadUserStats();
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  const checkForPRs = async (exercises: any[]) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const workoutLogs = await DataStorage.getWorkoutLogs();
      
      for (const exercise of exercises) {
        if (!exercise.exercise || !exercise.sets) continue;
        
        const exerciseName = exercise.exercise.name;
        const completedSets = exercise.sets.filter((set: any) => set.completed && set.actualWeight > 0);
        
        for (const set of completedSets) {
          const currentWeight = set.actualWeight;
          const currentReps = set.actualReps;
          
          // Check for 1RM PR
          if (currentReps === 1) {
            const isPR = await checkIfPR(exerciseName, currentWeight, 1, workoutLogs, today);
            if (isPR) {
              Alert.alert(
                '🏆 New PR!',
                `${exerciseName}: ${currentWeight} lbs for 1 rep!\nNew personal record!`,
                [{ text: 'Awesome!', style: 'default' }]
              );
              
              // Notify team members about the PR
              await notifyTeamMembersOfPR(exerciseName, currentWeight, currentReps, '1RM PR');
            }
          }
          
          // Check for rep PRs (same weight, more reps)
          const isRepPR = await checkIfRepPR(exerciseName, currentWeight, currentReps, workoutLogs, today);
          if (isRepPR) {
            Alert.alert(
              '💪 Rep PR!',
              `${exerciseName}: ${currentWeight} lbs for ${currentReps} reps!\nNew rep record!`,
              [{ text: 'Great job!', style: 'default' }]
            );
            
            // Notify team members about the PR
            await notifyTeamMembersOfPR(exerciseName, currentWeight, currentReps, 'Rep PR');
          }
        }
      }
    } catch (error) {
      console.error('Error checking for PRs:', error);
    }
  };

  const notifyTeamMembersOfPR = async (exerciseName: string, weight: number, reps: number, prType: string) => {
    try {
      if (!user) return;
      
      // Get user's teams
      const myTeams = await TeamService.getMyTeams(user.id);
      
      for (const team of myTeams) {
        // Create team activity for the PR
        const prActivity = {
          team_id: team.id,
          user_id: user.id,
          activity_type: 'pr_achievement',
          activity_data: {
            exercise: exerciseName,
            weight: weight,
            reps: reps,
            prType: prType,
            timestamp: new Date().toISOString(),
            user_name: user.email?.split('@')[0] || 'Anonymous'
          }
        };
        
        // Add the PR activity to the team
        await TeamService.addTeamActivityWithData(prActivity);
        
        console.log(`PR notification sent to team: ${team.name}`);
      }
    } catch (error) {
      console.error('Error notifying team members of PR:', error);
    }
  };

  const checkIfPR = async (exerciseName: string, weight: number, reps: number, workoutLogs: any[], today: string) => {
    try {
      // Get all previous workout logs except today
      const previousLogs = Object.values(workoutLogs).flat().filter((log: any) => {
        if (!log.date) return false;
        const logDate = typeof log.date === 'string' ? log.date : log.date.toISOString();
        return logDate.split('T')[0] !== today;
      });
      
      for (const log of previousLogs) {
        if (!log.exercises) continue;
        
        for (const exercise of log.exercises) {
          if (exercise.exercise?.name === exerciseName && exercise.sets) {
            for (const set of exercise.sets) {
              if (set.completed && set.actualWeight >= weight && set.actualReps >= reps) {
                return false; // Found a previous record that's equal or better
              }
            }
          }
        }
      }
      return true; // No previous record found, this is a PR
    } catch (error) {
      console.error('Error checking PR:', error);
      return false;
    }
  };

  const checkIfRepPR = async (exerciseName: string, weight: number, reps: number, workoutLogs: any[], today: string) => {
    try {
      // Get all previous workout logs except today
      const previousLogs = Object.values(workoutLogs).flat().filter((log: any) => {
        if (!log.date) return false;
        const logDate = typeof log.date === 'string' ? log.date : log.date.toISOString();
        return logDate.split('T')[0] !== today;
      });
      
      for (const log of previousLogs) {
        if (!log.exercises) continue;
        
        for (const exercise of log.exercises) {
          if (exercise.exercise?.name === exerciseName && exercise.sets) {
            for (const set of exercise.sets) {
              if (set.completed && set.actualWeight === weight && set.actualReps > reps) {
                return false; // Found a previous record with same weight but more reps
              }
            }
          }
        }
      }
      return true; // No previous record found with same weight and more reps
    } catch (error) {
      console.error('Error checking rep PR:', error);
      return false;
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
    Alert.alert('Workout Cancelled', 'Workout has been cancelled and not saved.');
  };

  const confirmStartWorkout = () => {
    if (!activeWorkout) return;
    setShowWorkoutModal(true);
    setShowWorkoutStartModal(false);
    startTimer();
    if (activeWorkout.exercises.length > 0 && activeWorkout.exercises[0].sets.length > 0) {
      setActiveSet({
        exerciseIndex: 0,
        setIndex: 0,
        reps: activeWorkout.exercises[0].sets[0].reps,
        weight: activeWorkout.exercises[0].sets[0].weight,
        restTime: activeWorkout.exercises[0].sets[0].restTime,
        isResting: false,
        timeRemaining: 0,
      });
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DataStorage.deleteCustomWorkout(workoutId);
              loadCustomWorkouts();
              Alert.alert('Success', 'Workout deleted successfully');
            } catch (error) {
              console.error('Error deleting workout:', error);
              Alert.alert('Error', 'Failed to delete workout');
            }
          }
        }
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
      await loadUserData();
    await loadCustomWorkouts();
    setRefreshing(false);
  };

  const handleAIGenerate = () => {
    setShowAIGenerator(true);
  };

  const handleAIPremade = () => {
    Alert.alert(
      'AI Premade Plans',
      'Choose a workout plan based on your goals and fitness level.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Beginner Plan', onPress: () => generateAIPlan('beginner') },
        { text: 'Intermediate Plan', onPress: () => generateAIPlan('intermediate') },
        { text: 'Advanced Plan', onPress: () => generateAIPlan('advanced') }
      ]
    );
  };

  const generateAIPlan = (level: string) => {
    const aiWorkouts = {
      beginner: [
        {
          name: 'Beginner Full Body',
          description: 'Perfect for those starting their fitness journey',
          exercises: [
            { name: 'Push-ups', sets: 3, reps: 8, weight: 0, category: 'Chest' },
            { name: 'Bodyweight Squats', sets: 3, reps: 12, weight: 0, category: 'Legs' },
            { name: 'Planks', sets: 3, reps: 30, weight: 0, category: 'Core' },
            { name: 'Lunges', sets: 3, reps: 10, weight: 0, category: 'Legs' }
          ]
        },
        {
          name: 'Beginner Upper Body',
          description: 'Focus on building upper body strength',
          exercises: [
            { name: 'Push-ups', sets: 3, reps: 10, weight: 0, category: 'Chest' },
            { name: 'Diamond Push-ups', sets: 2, reps: 5, weight: 0, category: 'Chest' },
            { name: 'Planks', sets: 3, reps: 45, weight: 0, category: 'Core' },
            { name: 'Superman', sets: 3, reps: 12, weight: 0, category: 'Back' }
          ]
        }
      ],
      intermediate: [
        {
          name: 'Intermediate Strength',
          description: 'Build serious strength with compound movements',
          exercises: [
            { name: 'Bench Press', sets: 4, reps: 8, weight: 135, category: 'Chest' },
            { name: 'Squats', sets: 4, reps: 10, weight: 185, category: 'Legs' },
            { name: 'Deadlifts', sets: 3, reps: 6, weight: 225, category: 'Back' },
            { name: 'Overhead Press', sets: 3, reps: 8, weight: 95, category: 'Shoulders' }
          ]
        },
        {
          name: 'Intermediate HIIT',
          description: 'High intensity interval training for fat loss',
          exercises: [
            { name: 'Burpees', sets: 4, reps: 15, weight: 0, category: 'Full Body' },
            { name: 'Mountain Climbers', sets: 4, reps: 30, weight: 0, category: 'Core' },
            { name: 'Jump Squats', sets: 4, reps: 20, weight: 0, category: 'Legs' },
            { name: 'Battle Ropes', sets: 4, reps: 30, weight: 0, category: 'Full Body' }
          ]
        }
      ],
      advanced: [
        {
          name: 'Advanced Powerlifting',
          description: 'Heavy compound movements for maximum strength',
          exercises: [
            { name: 'Squats', sets: 5, reps: 5, weight: 315, category: 'Legs' },
            { name: 'Bench Press', sets: 5, reps: 5, weight: 225, category: 'Chest' },
            { name: 'Deadlifts', sets: 5, reps: 3, weight: 405, category: 'Back' },
            { name: 'Overhead Press', sets: 4, reps: 6, weight: 135, category: 'Shoulders' }
          ]
        },
        {
          name: 'Advanced Calisthenics',
          description: 'Bodyweight mastery and advanced movements',
          exercises: [
            { name: 'Muscle-ups', sets: 3, reps: 5, weight: 0, category: 'Full Body' },
            { name: 'Handstand Push-ups', sets: 3, reps: 8, weight: 0, category: 'Shoulders' },
            { name: 'Pistol Squats', sets: 3, reps: 10, weight: 0, category: 'Legs' },
            { name: 'L-sits', sets: 3, reps: 30, weight: 0, category: 'Core' }
          ]
        }
      ]
    };

    const plans = aiWorkouts[level as keyof typeof aiWorkouts];
    const randomPlan = plans[Math.floor(Math.random() * plans.length)];
    
    // Convert to CustomWorkout format
    const aiWorkout: CustomWorkout = {
      id: `ai-${Date.now()}`,
      name: randomPlan.name,
      description: randomPlan.description,
      exercises: randomPlan.exercises.map((ex, index) => ({
        id: `ex-${index}`,
        exercise: {
          id: `ex-${index}`,
          name: ex.name,
          category: ex.category,
          difficulty: level.charAt(0).toUpperCase() + level.slice(1),
          videoUrl: `https://www.youtube.com/watch?v=example${index}`
        },
        sets: Array(ex.sets || 3).fill(0).map((_, setIndex) => ({
          id: `set-${setIndex}`,
          reps: ex.reps,
          weight: ex.weight,
          restTime: 90,
          completed: false
        }))
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to custom workouts
    setCustomWorkouts(prev => [...prev, aiWorkout]);
    Alert.alert('AI Plan Generated!', `${randomPlan.name} has been added to your workouts.`);
  };

  // Complex AI Workout Generator
  const generatePersonalizedWorkout = () => {
    setShowAIGenerator(true);
  };

  const createPersonalizedWorkout = async () => {
    // Complex AI algorithm for personalized workout generation
    const exerciseDatabase = {
      chest: [
        { name: 'Push-ups', difficulty: 'beginner', equipment: 'bodyweight', timePerSet: 2, calories: 8 },
        { name: 'Bench Press', difficulty: 'intermediate', equipment: 'barbell', timePerSet: 3, calories: 12 },
        { name: 'Incline Dumbbell Press', difficulty: 'intermediate', equipment: 'dumbbells', timePerSet: 3, calories: 10 },
        { name: 'Diamond Push-ups', difficulty: 'intermediate', equipment: 'bodyweight', timePerSet: 2, calories: 10 },
        { name: 'Chest Flyes', difficulty: 'beginner', equipment: 'dumbbells', timePerSet: 2, calories: 8 }
      ],
      back: [
        { name: 'Pull-ups', difficulty: 'intermediate', equipment: 'bodyweight', timePerSet: 3, calories: 12 },
        { name: 'Deadlifts', difficulty: 'advanced', equipment: 'barbell', timePerSet: 4, calories: 15 },
        { name: 'Bent Over Rows', difficulty: 'intermediate', equipment: 'barbell', timePerSet: 3, calories: 10 },
        { name: 'Lat Pulldowns', difficulty: 'beginner', equipment: 'machine', timePerSet: 2, calories: 8 },
        { name: 'Face Pulls', difficulty: 'beginner', equipment: 'cable', timePerSet: 2, calories: 6 }
      ],
      legs: [
        { name: 'Squats', difficulty: 'beginner', equipment: 'bodyweight', timePerSet: 3, calories: 12 },
        { name: 'Bulgarian Split Squats', difficulty: 'intermediate', equipment: 'bodyweight', timePerSet: 3, calories: 10 },
        { name: 'Lunges', difficulty: 'beginner', equipment: 'bodyweight', timePerSet: 2, calories: 8 },
        { name: 'Romanian Deadlifts', difficulty: 'intermediate', equipment: 'barbell', timePerSet: 3, calories: 10 },
        { name: 'Calf Raises', difficulty: 'beginner', equipment: 'bodyweight', timePerSet: 1, calories: 4 }
      ],
      shoulders: [
        { name: 'Overhead Press', difficulty: 'intermediate', equipment: 'barbell', timePerSet: 3, calories: 10 },
        { name: 'Lateral Raises', difficulty: 'beginner', equipment: 'dumbbells', timePerSet: 2, calories: 6 },
        { name: 'Pike Push-ups', difficulty: 'intermediate', equipment: 'bodyweight', timePerSet: 2, calories: 8 },
        { name: 'Arnold Press', difficulty: 'intermediate', equipment: 'dumbbells', timePerSet: 3, calories: 8 },
        { name: 'Face Pulls', difficulty: 'beginner', equipment: 'cable', timePerSet: 2, calories: 6 }
      ],
      arms: [
        { name: 'Bicep Curls', difficulty: 'beginner', equipment: 'dumbbells', timePerSet: 2, calories: 6 },
        { name: 'Tricep Dips', difficulty: 'intermediate', equipment: 'bodyweight', timePerSet: 2, calories: 8 },
        { name: 'Hammer Curls', difficulty: 'beginner', equipment: 'dumbbells', timePerSet: 2, calories: 6 },
        { name: 'Close Grip Bench Press', difficulty: 'intermediate', equipment: 'barbell', timePerSet: 3, calories: 8 },
        { name: 'Preacher Curls', difficulty: 'intermediate', equipment: 'barbell', timePerSet: 2, calories: 6 }
      ],
      core: [
        { name: 'Planks', difficulty: 'beginner', equipment: 'bodyweight', timePerSet: 1, calories: 4 },
        { name: 'Russian Twists', difficulty: 'beginner', equipment: 'bodyweight', timePerSet: 1, calories: 6 },
        { name: 'Mountain Climbers', difficulty: 'intermediate', equipment: 'bodyweight', timePerSet: 1, calories: 8 },
        { name: 'L-sits', difficulty: 'advanced', equipment: 'bodyweight', timePerSet: 1, calories: 10 },
        { name: 'Side Planks', difficulty: 'intermediate', equipment: 'bodyweight', timePerSet: 1, calories: 6 }
      ]
    };

    // AI Algorithm Logic
    let selectedExercises = [];
    let totalTime = 0;
    let totalCalories = 0;
    
    // Determine workout focus based on goals
    const primaryMuscles = targetMuscles.length > 0 ? targetMuscles : ['chest', 'back', 'legs'];
    const secondaryMuscles = ['shoulders', 'arms', 'core'];
    
    // Calculate exercises per muscle group based on duration
    const exercisesPerMuscle = Math.max(1, Math.floor(workoutDuration / 15));
    const totalExercises = Math.min(8, Math.floor(workoutDuration / 6));
    
    // Select primary muscle exercises
    for (const muscle of primaryMuscles.slice(0, 2)) {
      if (selectedExercises.length >= totalExercises) break;
      
      const muscleExercises = exerciseDatabase[muscle as keyof typeof exerciseDatabase] || [];
      const availableExercises = muscleExercises.filter(ex => 
        equipmentAvailable.includes(ex.equipment) || equipmentAvailable.includes('all')
      );
      
      if (availableExercises.length > 0) {
        const exercise = availableExercises[Math.floor(Math.random() * availableExercises.length)];
        const sets = fitnessLevel === 'beginner' ? 3 : fitnessLevel === 'intermediate' ? 4 : 5;
        const reps = fitnessLevel === 'beginner' ? 12 : fitnessLevel === 'intermediate' ? 10 : 8;
        
        selectedExercises.push({
          ...exercise,
          sets,
          reps,
          weight: exercise.equipment === 'bodyweight' ? 0 : 
                 fitnessLevel === 'beginner' ? 20 : 
                 fitnessLevel === 'intermediate' ? 40 : 60
        });
        
        totalTime += exercise.timePerSet * sets;
        totalCalories += exercise.calories * sets;
      }
    }
    
    // Fill remaining slots with secondary muscles
    for (const muscle of secondaryMuscles) {
      if (selectedExercises.length >= totalExercises) break;
      
      const muscleExercises = exerciseDatabase[muscle as keyof typeof exerciseDatabase] || [];
      const availableExercises = muscleExercises.filter(ex => 
        equipmentAvailable.includes(ex.equipment) || equipmentAvailable.includes('all')
      );
      
      if (availableExercises.length > 0) {
        const exercise = availableExercises[Math.floor(Math.random() * availableExercises.length)];
        const sets = fitnessLevel === 'beginner' ? 2 : fitnessLevel === 'intermediate' ? 3 : 4;
        const reps = fitnessLevel === 'beginner' ? 15 : fitnessLevel === 'intermediate' ? 12 : 10;
        
        selectedExercises.push({
          ...exercise,
          sets,
          reps,
          weight: exercise.equipment === 'bodyweight' ? 0 : 
                 fitnessLevel === 'beginner' ? 15 : 
                 fitnessLevel === 'intermediate' ? 30 : 45
        });
        
        totalTime += exercise.timePerSet * sets;
        totalCalories += exercise.calories * sets;
      }
    }
    
    // Generate workout name based on goals and focus
    let workoutName = '';
    if (userGoals.includes('strength')) {
      workoutName = 'AI Strength Builder';
    } else if (userGoals.includes('muscle')) {
      workoutName = 'AI Muscle Growth';
    } else if (userGoals.includes('endurance')) {
      workoutName = 'AI Endurance Challenge';
    } else if (userGoals.includes('fat_loss')) {
      workoutName = 'AI Fat Burner';
    } else {
      workoutName = 'AI Personalized Workout';
    }
    
    // Create workout description
    const description = `AI-generated ${fitnessLevel} workout targeting ${primaryMuscles.join(', ')}. Estimated ${totalTime} minutes, ${totalCalories} calories burned.`;
    
    // Convert to CustomWorkout format
    const aiWorkout: CustomWorkout = {
      id: `ai-personalized-${Date.now()}`,
      name: workoutName,
      description: description,
      exercises: selectedExercises.map((ex, index) => ({
        id: `ex-${index}`,
        exercise: {
          id: `ex-${index}`,
          name: ex.name,
          category: ex.name.includes('Chest') || ex.name.includes('Push') ? 'Chest' :
                   ex.name.includes('Back') || ex.name.includes('Pull') ? 'Back' :
                   ex.name.includes('Leg') || ex.name.includes('Squat') ? 'Legs' :
                   ex.name.includes('Shoulder') || ex.name.includes('Press') ? 'Shoulders' :
                   ex.name.includes('Bicep') || ex.name.includes('Tricep') ? 'Arms' : 'Core',
          difficulty: ex.difficulty.charAt(0).toUpperCase() + ex.difficulty.slice(1),
          videoUrl: `https://www.youtube.com/watch?v=example${index}`
        },
        sets: Array(ex.sets || 3).fill(0).map((_, setIndex) => ({
          id: `set-${setIndex}`,
          reps: ex.reps,
          weight: ex.weight,
          restTime: ex.difficulty === 'beginner' ? 60 : ex.difficulty === 'intermediate' ? 90 : 120,
          completed: false
        }))
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to custom workouts
    setCustomWorkouts(prev => [...prev, aiWorkout]);
    setShowAIGenerator(false);
    
    // Save to DataStorage
    try {
      await DataStorage.saveCustomWorkout(aiWorkout);
      Alert.alert('AI Workout Generated!', `${workoutName} has been created and saved to your workouts!`);
    } catch (error) {
      console.error('Error saving AI workout:', error);
      Alert.alert('AI Workout Generated!', `${workoutName} has been created based on your preferences!`);
    }
  };

  const handleVideoPress = (exercise: any) => {
    console.log('Video pressed:', exercise.name);
    // Always show video card modal first
    setSelectedVideo(exercise);
    setShowVideoModal(true);
  };

  const getExerciseDescription = (exerciseName: string) => {
    const descriptions: { [key: string]: string } = {
      'Push-ups': 'A classic bodyweight exercise that targets the chest, shoulders, and triceps. Start in a plank position, lower your body until your chest nearly touches the floor, then push back up.',
      'Squats': 'A fundamental lower body exercise that works the quadriceps, hamstrings, and glutes. Stand with feet shoulder-width apart, lower your body as if sitting back into a chair, then return to standing.',
      'Pull-ups': 'An upper body strength exercise that targets the back, biceps, and shoulders. Hang from a bar with palms facing away, pull your body up until your chin clears the bar, then lower with control.',
      'Deadlifts': 'A compound exercise that works the entire posterior chain including hamstrings, glutes, and back. Lift a barbell from the ground to hip level while maintaining a straight back.',
      'Bench Press': 'A chest exercise performed lying on a bench. Lower a barbell to your chest, then press it back up to full arm extension.',
      'Overhead Press': 'A shoulder exercise where you press a weight from shoulder level to overhead. Great for building shoulder strength and stability.',
      'Lunges': 'A single-leg exercise that targets the quadriceps, hamstrings, and glutes. Step forward into a lunge position, lower your back knee toward the ground, then push back to starting position.',
      'Planks': 'An isometric core exercise. Hold a push-up position with your body in a straight line from head to heels, engaging your core muscles.',
      'Bicep Curls': 'An isolation exercise for the biceps. Hold weights with arms at your sides, curl them up toward your shoulders, then lower with control.',
      'Tricep Dips': 'A bodyweight exercise that targets the triceps. Support your body on a bench or chair, lower your body by bending your elbows, then push back up.',
      'Mountain Climbers': 'A dynamic cardio exercise. Start in a plank position, alternate bringing your knees toward your chest in a running motion.',
      'Burpees': 'A full-body exercise combining a squat, push-up, and jump. Start standing, drop to a push-up position, do a push-up, jump feet to hands, then jump up with arms overhead.',
      'Jumping Jacks': 'A cardio exercise. Start standing, jump while spreading your legs and raising your arms overhead, then jump back to starting position.',
      'High Knees': 'A cardio exercise. Run in place while bringing your knees up toward your chest as high as possible.',
      'Butt Kicks': 'A cardio exercise. Run in place while kicking your heels back toward your glutes.',
      'Leg Raises': 'A core exercise. Lie on your back, lift your legs straight up toward the ceiling, then lower them back down without touching the ground.',
      'Russian Twists': 'A core exercise. Sit with knees bent, lean back slightly, and rotate your torso from side to side while holding a weight or with hands clasped.',
      'Wall Sits': 'An isometric leg exercise. Slide your back down a wall until your thighs are parallel to the ground, hold this position.',
      'Calf Raises': 'A lower leg exercise. Stand on the edge of a step, rise up onto your toes, then lower your heels below the step level.',
      'Side Planks': 'A core exercise. Lie on your side, support your body on your forearm, and hold your body in a straight line from head to feet.'
    };
    
    return descriptions[exerciseName] || 'A great exercise to add to your workout routine. Focus on proper form and controlled movements for best results.';
  };

  const toggleFavorite = (workoutId: string) => {
    setFavoritedWorkouts(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(workoutId)) {
        newFavorites.delete(workoutId);
      } else {
        newFavorites.add(workoutId);
        // Save to My Workouts when favorited
        const workout = findWorkoutInLibrary(workoutId);
        if (workout) {
          saveWorkoutToMyWorkouts(workout);
        }
      }
      return newFavorites;
    });
  };

  const findWorkoutInLibrary = (workoutId: string) => {
    // Search through all workout categories
    const allWorkouts = [
      ...workoutLibrary.strength,
      ...workoutLibrary.powerlifting,
      ...workoutLibrary.crossfit,
      ...workoutLibrary.yoga,
      ...workoutLibrary.stretching
    ];
    return allWorkouts.find(w => w.id === workoutId);
  };

  const saveWorkoutToMyWorkouts = (workout: any) => {
    const customWorkout: CustomWorkout = {
      id: `favorite_${workout.id}_${Date.now()}`,
      name: workout.name,
      description: workout.description,
      duration: workout.duration,
      exercises: workout.exercises.map((exercise: any) => ({
        exercise: {
          id: exercise.id || `exercise_${Date.now()}`,
          name: exercise.name,
          category: exercise.category || 'General',
          description: exercise.description || '',
          instructions: exercise.instructions || '',
          tips: exercise.tips || '',
          videoUrl: exercise.videoUrl || '',
          imageUrl: exercise.imageUrl || '',
          difficulty: exercise.difficulty || 'Intermediate',
          equipment: exercise.equipment || [],
          targetMuscles: exercise.targetMuscles || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        sets: exercise.sets || [{ reps: 10, weight: 0, completed: false }]
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to local storage
    DataStorage.addCustomWorkout(customWorkout);
    
    // Update local state
    setCustomWorkouts(prev => [...prev, customWorkout]);
    
    Alert.alert('Added to My Workouts', `${workout.name} has been added to your My Workouts library!`);
  };

  const handleVideoCardPress = (workout: any) => {
    if (workout.videoUrl) {
      setSelectedVideoCard(workout);
      setShowVideoCard(true);
    } else {
      // For non-video workouts, show workout preview
      setSelectedLibraryWorkout(workout);
      setShowLibraryWorkoutPreview(true);
    }
  };

  const handlePlayVideo = (videoUrl: string) => {
    Linking.openURL(videoUrl).catch(err => {
      console.error('Error opening video:', err);
      Alert.alert('Error', 'Could not open video');
    });
  };

  const handleStartLibraryWorkout = (workout: any) => {
    // Convert library workout to CustomWorkout format
    const customWorkout: CustomWorkout = {
      id: workout.id,
      name: workout.name,
      description: workout.description,
      exercises: workout.exercises.map((exercise: any) => ({
        exercise: {
          id: Math.random().toString(),
          name: exercise.name,
          category: workout.category,
          difficulty: workout.difficulty,
          equipment: 'various',
          muscle: workout.category.toLowerCase(),
          instructions: `${exercise.sets} sets of ${exercise.reps} reps`,
        },
        sets: Array.from({ length: exercise.sets }, (_, index) => ({
          reps: parseInt(exercise.reps.split('-')[0]) || 10,
          weight: 0,
          restTime: parseInt(exercise.rest?.replace(/\D/g, '')) || 90,
          completed: false,
        })),
      })),
      createdAt: new Date(),
    };

    setActiveWorkout(customWorkout);
    setShowLibraryWorkoutPreview(false);
    setShowWorkoutLibrary(false);
    setShowWorkoutStartModal(true);
  };

  // Calendar helper functions
  const getTonnageForDate = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const workouts = await DataStorage.getWorkoutLogs(dateStr);
      return workouts.reduce((total, workout) => {
        return total + (workout.totalTonnage || 0);
      }, 0);
    } catch (error) {
      console.error('Error fetching tonnage:', error);
      return 0;
    }
  };

  const getWorkoutCountForDate = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const workouts = await DataStorage.getWorkoutLogs(dateStr);
      return workouts.length;
    } catch (error) {
      console.error('Error fetching workout count:', error);
      return 0;
    }
  };

  const getWorkoutDurationForDate = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const workouts = await DataStorage.getWorkoutLogs(dateStr);
      return workouts.reduce((total, workout) => {
        return total + (workout.duration || 0);
      }, 0);
    } catch (error) {
      console.error('Error fetching workout duration:', error);
      return 0;
    }
  };

  const getWorkoutsForDate = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const workouts = await DataStorage.getWorkoutLogs(dateStr);
      return workouts.map(workout => ({
        name: workout.workoutName,
        description: workout.notes || 'Workout completed',
        duration: workout.duration || 0,
        tonnage: workout.totalTonnage || 0
      }));
    } catch (error) {
      console.error('Error fetching workouts:', error);
      return [];
    }
  };

  const loadCalendarData = async (date: Date) => {
    setCalendarLoading(true);
    try {
      const [tonnage, count, duration, workouts] = await Promise.all([
        getTonnageForDate(date),
        getWorkoutCountForDate(date),
        getWorkoutDurationForDate(date),
        getWorkoutsForDate(date)
      ]);
      
      setCalendarTonnage(tonnage);
      setCalendarWorkoutCount(count);
      setCalendarDuration(duration);
      setCalendarWorkouts(workouts);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setCalendarLoading(false);
    }
  };

  function renderActiveWorkout() {
    if (!activeWorkout || !workoutData) return null;

    const currentExercise = workoutData.exercises[currentExerciseIndex];

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showWorkoutModal}
        onRequestClose={() => setShowEndWorkoutModal(true)}
      >
        <View style={styles.workoutExecutionContainer}>
          {/* Workout Header */}
          <View style={styles.workoutHeader}>
            <TouchableOpacity 
              style={styles.endWorkoutButton}
              onPress={() => setShowEndWorkoutModal(true)}
            >
              <Ionicons name="close" size={24} color="#EF4444" />
            </TouchableOpacity>
            <Text style={styles.workoutTitle}>{activeWorkout.name}</Text>
            <View style={styles.workoutTimer}>
              <Text style={styles.timerText}>
                {Math.floor(workoutData.totalTime / 60)}:{(workoutData.totalTime % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          </View>

          {/* Exercise Navigation */}
          <View style={styles.exerciseNavigation}>
            {workoutData.exercises.map((exercise, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.exerciseNavBtn,
                  currentExerciseIndex === index && styles.activeExerciseNavBtn
                ]}
                onPress={() => setCurrentExerciseIndex(index)}
              >
                <Text style={[
                  styles.exerciseNavBtnText,
                  currentExerciseIndex === index && styles.activeExerciseNavBtnText
                ]}>
                  {exercise.exercise?.name || 'Exercise'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Exercise Info */}
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{currentExercise?.exercise?.name || 'Exercise'}</Text>
            <Text style={styles.exerciseCategory}>{currentExercise?.exercise?.category || 'General'}</Text>
          </View>

          {/* Set Navigation */}
          <View style={styles.setNavigation}>
            <TouchableOpacity
              style={styles.setNavButton}
              onPress={() => setCurrentSetIndex(Math.max(0, currentSetIndex - 1))}
              disabled={currentSetIndex === 0}
            >
              <Ionicons name="chevron-back" size={24} color={currentSetIndex === 0 ? "#6B7280" : "#FFFFFF"} />
            </TouchableOpacity>
            <Text style={styles.setCounter}>
              Set {currentSetIndex + 1} of {currentExercise?.sets?.length || 0}
            </Text>
            <TouchableOpacity
              style={styles.setNavButton}
              onPress={() => setCurrentSetIndex(Math.min((currentExercise?.sets?.length || 1) - 1, currentSetIndex + 1))}
              disabled={currentSetIndex >= (currentExercise?.sets?.length || 1) - 1}
            >
              <Ionicons name="chevron-forward" size={24} color={currentSetIndex >= (currentExercise?.sets?.length || 1) - 1 ? "#6B7280" : "#FFFFFF"} />
            </TouchableOpacity>
          </View>

          {/* Set Input */}
          <View style={styles.setInputContainer}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Weight (lbs)</Text>
              <TextInput
                style={styles.weightInput}
                value={getInputValue('weight', currentExercise?.sets?.[currentSetIndex]?.weight || 0)}
                onChangeText={(text) => setInputValue('weight', text)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#6B7280"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Reps</Text>
              <TextInput
                style={styles.repsInput}
                value={getInputValue('reps', currentExercise?.sets?.[currentSetIndex]?.reps || 0)}
                onChangeText={(text) => setInputValue('reps', text)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>

          {/* Set Actions */}
          <View style={styles.setActions}>
            <TouchableOpacity
              style={[
                styles.setButton,
                currentExercise?.sets?.[currentSetIndex]?.isActive && styles.activeSetButton
              ]}
              onPress={() => toggleSetTimer()}
            >
              <Ionicons 
                name={currentExercise?.sets?.[currentSetIndex]?.isActive ? "stop" : "play"} 
                size={24} 
                color="#FFFFFF" 
              />
              <Text style={styles.setButtonText}>
                {currentExercise?.sets?.[currentSetIndex]?.isActive ? "Stop Set" : "Start Set"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.completeSetButton}
              onPress={() => completeSet()}
            >
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              <Text style={styles.completeSetButtonText}>Complete Set</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Summary */}
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Total Time</Text>
              <Text style={styles.progressValue}>
                {Math.floor(workoutData.totalTime / 60)}:{(workoutData.totalTime % 60).toString().padStart(2, '0')}
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Tonnage</Text>
              <Text style={styles.progressValue}>{workoutData.totalTonnage.toFixed(0)} lbs</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Sets</Text>
              <Text style={styles.progressValue}>
                {workoutData.exercises.reduce((total, ex) => total + (ex.sets?.filter(s => s.completed).length || 0), 0)}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Workout Tracker</Text>
            <Text style={styles.headerSubtitle}>Track your fitness journey</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowWorkoutCalendar(true)}
            style={styles.calendarButton}
          >
            <Ionicons name="calendar-outline" size={20} color="#10B981" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#10B981"
            />
          }
        >
          {/* Hero Stats Dashboard */}
          <View style={styles.heroStatsContainer}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)', 'rgba(0, 0, 0, 0.3)']}
              style={styles.heroStatsGradient}
            >
              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Ionicons name="fitness" size={24} color="#10B981" />
                  </View>
                  <Text style={styles.heroStatValue}>{userStats?.totalWorkouts || 0}</Text>
                  <Text style={styles.heroStatLabel}>Workouts</Text>
                  </View>
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Ionicons name="time" size={24} color="#10B981" />
                  </View>
                  <Text style={styles.heroStatValue}>
                    {workoutData ? Math.floor(workoutData.totalTime / 60) : (calendarDuration || 0)}
                  </Text>
                  <Text style={styles.heroStatLabel}>Minutes</Text>
                </View>
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Ionicons name="barbell" size={24} color="#10B981" />
                  </View>
                  <Text style={styles.heroStatValue}>
                    {workoutData ? workoutData.totalTonnage : (calendarTonnage || 0)}
                  </Text>
                  <Text style={styles.heroStatLabel}>Tonnage</Text>
                </View>
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Ionicons name="trophy" size={24} color="#10B981" />
                  </View>
                  <Text style={styles.heroStatValue}>{userStats?.workoutStreak || 0}</Text>
                  <Text style={styles.heroStatLabel}>Streak</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

          {/* Quick Start Section */}
          <View style={styles.quickStartContainer}>
            <Text style={styles.quickStartTitle}>Quick Start</Text>
            <View style={styles.quickStartButtons}>
              <TouchableOpacity style={styles.quickStartButton} onPress={() => setShowViewAllWorkouts(true)}>
                <Ionicons name="play" size={24} color="#10B981" style={styles.quickStartButtonIcon} />
                <Text style={styles.quickStartButtonText}>Start Workout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Grid */}
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => setShowCustomBuilder(true)}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.2)']}
                style={styles.actionCardGradient}
              >
                <Ionicons name="create" size={28} color="#10B981" />
                <Text style={styles.actionCardTitle}>Create</Text>
                <Text style={styles.actionCardSubtitle}>Custom Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleAIGenerate}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.2)']}
                style={styles.actionCardGradient}
              >
                <Ionicons name="sparkles" size={28} color="#10B981" />
                <Text style={styles.actionCardTitle}>AI Generate</Text>
                <Text style={styles.actionCardSubtitle}>Smart Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => setShowWorkoutLibrary(true)}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.2)']}
                style={styles.actionCardGradient}
              >
                <Ionicons name="library" size={28} color="#10B981" />
                <Text style={styles.actionCardTitle}>Workout Library</Text>
                <Text style={styles.actionCardSubtitle}>Pre-made Programs</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => {
              if (navigation && navigation.navigate) {
                navigation.navigate('analytics');
              } else {
                Alert.alert('Navigation', 'Analytics page navigation not available in this context');
              }
            }}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.2)']}
                style={styles.actionCardGradient}
              >
                <Ionicons name="analytics" size={28} color="#10B981" />
                <Text style={styles.actionCardTitle}>Analytics</Text>
                <Text style={styles.actionCardSubtitle}>Progress Tracking</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* My Workouts Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Workouts</Text>
              {((customWorkouts || []).length > 0) ? (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => setShowViewAllWorkouts(true)}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                  <Ionicons name="chevron-forward" size={16} color="#10B981" />
                </TouchableOpacity>
              ) : null}
            </View>

            {((customWorkouts || []).length === 0) ? (
              <View style={styles.emptyStateContainer}>
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.05)', 'rgba(0, 0, 0, 0.3)']}
                  style={styles.emptyStateGradient}
                >
                  <Ionicons name="fitness-outline" size={60} color="#10B981" />
                  <Text style={styles.emptyStateText}>No Workouts Yet</Text>
                  <Text style={styles.emptyStateDescription}>
                    Create your first custom workout or use AI to generate one
                  </Text>
                  <TouchableOpacity style={styles.emptyStateButton} onPress={() => setShowCustomBuilder(true)}>
                    <Text style={styles.emptyStateButtonText}>Create Workout</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ) : (
              customWorkouts.slice(0, 4).map((workout) => (
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
                        <Ionicons name="repeat" size={16} color="#10B981" />
                        <Text style={styles.workoutStatText}>{workout.exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0)} sets</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Exercise Videos Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exercise Videos</Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => setShowExerciseLibrary(true)}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color="#10B981" />
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exerciseScrollView}>
              {exerciseVideos.map((exercise) => (
                <TouchableOpacity key={exercise.id} style={styles.exerciseCard} onPress={() => handleVideoPress(exercise)}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                    style={styles.exerciseCardGradient}
                  >
                    <View style={styles.exerciseThumbnail}>
                      <Ionicons name="play" size={24} color="#10B981" />
                    </View>
                    <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                    <Text style={styles.exerciseCategory}>{exercise.category}</Text>
                    <View style={styles.exerciseDifficulty}>
                      <Text style={styles.exerciseDifficultyText}>{exercise.difficulty}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Modals */}
        {renderActiveWorkout()}
        <CustomWorkoutBuilder
          visible={showCustomBuilder}
          onClose={() => setShowCustomBuilder(false)}
          onWorkoutCreated={handleWorkoutCreated}
        />
        
        {/* Workout Start Confirmation Modal */}
        <Modal visible={showWorkoutStartModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.workoutStartModal}>
              <Text style={styles.workoutStartTitle}>Start {activeWorkout?.name}?</Text>
              <Text style={styles.workoutStartDescription}>
                Ready to begin your workout? Make sure you're warmed up and have your equipment ready.
                    </Text>
              <View style={styles.workoutStartActions}>
                    <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowWorkoutStartModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={confirmStartWorkout}
                >
                  <Text style={styles.startButtonText}>Start Workout</Text>
                    </TouchableOpacity>
                </View>
              </View>
          </View>
        </Modal>

        {/* Workout Library Modal */}
        <Modal
          visible={showWorkoutLibrary}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <View style={styles.workoutLibraryContainer}>
            <LinearGradient
              colors={['#0F172A', '#1E293B']}
              style={styles.workoutLibraryGradient}
            >
              {/* Header */}
              <View style={styles.workoutLibraryHeader}>
                <TouchableOpacity
                  style={styles.workoutLibraryBackButton}
                  onPress={() => setShowWorkoutLibrary(false)}
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.workoutLibraryTitleContainer}>
                  <Text style={styles.workoutLibraryTitle}>Workout Library</Text>
                  <Text style={styles.workoutLibrarySubtitle}>
                    {premadeWorkouts?.length || 0} premade workouts
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.workoutLibrarySearchButton}
                  onPress={() => {
                    setShowSearchBar(!showSearchBar);
                    if (showSearchBar) {
                      setSearchQuery('');
                    }
                  }}
                >
                  <Ionicons name={showSearchBar ? "close" : "search"} size={24} color="#10B981" />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              {showSearchBar && (
                <View style={styles.workoutSearchContainer}>
                  <View style={styles.workoutSearchBar}>
                    <Ionicons name="search" size={20} color="#6B7280" />
                    <TextInput
                      style={styles.workoutSearchInput}
                      placeholder="Search workouts..."
                      placeholderTextColor="#6B7280"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        style={styles.workoutSearchClear}
                      >
                        <Ionicons name="close-circle" size={20} color="#6B7280" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Workout Grid */}
              <ScrollView style={styles.workoutLibraryGrid}>
                {(premadeWorkouts || [])
                  .filter(workout => 
                    searchQuery === '' || 
                    workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    workout.category.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((workout) => (
                    <TouchableOpacity
                      key={workout.id}
                      style={styles.enhancedWorkoutCard}
                      onPress={() => handlePreviewWorkout(workout)}
                    >
                      <LinearGradient
                        colors={['#1E293B', '#334155']}
                        style={styles.workoutCardGradient}
                      >
                        {/* Workout Header */}
                        <View style={styles.enhancedWorkoutHeader}>
                          <View style={styles.workoutTitleContainer}>
                            <Text style={styles.enhancedWorkoutName}>{workout.name}</Text>
                            <View style={styles.workoutDifficultyBadge}>
                              <Text style={styles.workoutDifficultyText}>
                                {workout.category}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.workoutActionsContainer}>
                            <TouchableOpacity
                              style={styles.workoutMenuButton}
                              onPress={() => {/* TODO: Add menu */}}
                            >
                              <Ionicons name="ellipsis-vertical" size={16} color="#6B7280" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Workout Description */}
                        <Text style={styles.enhancedWorkoutDescription}>
                          {workout.description || 'Premade workout routine'}
                        </Text>

                        {/* Workout Stats Grid */}
                        <View style={styles.enhancedWorkoutStats}>
                          <View style={styles.enhancedWorkoutStat}>
                            <Ionicons name="fitness" size={16} color="#10B981" />
                            <Text style={styles.enhancedWorkoutStatValue}>
                              {workout.exercises?.length || 0}
                            </Text>
                            <Text style={styles.enhancedWorkoutStatLabel}>Exercises</Text>
                          </View>
                          <View style={styles.enhancedWorkoutStat}>
                            <Ionicons name="time" size={16} color="#3B82F6" />
                            <Text style={styles.enhancedWorkoutStatValue}>
                              {workout.duration}
                            </Text>
                            <Text style={styles.enhancedWorkoutStatLabel}>Minutes</Text>
                          </View>
                          <View style={styles.enhancedWorkoutStat}>
                            <Ionicons name="flame" size={16} color="#F59E0B" />
                            <Text style={styles.enhancedWorkoutStatValue}>
                              {workout.calories}
                            </Text>
                            <Text style={styles.enhancedWorkoutStatLabel}>Calories</Text>
                          </View>
                        </View>

                        {/* Workout Actions */}
                        <View style={styles.enhancedWorkoutActions}>
                          <TouchableOpacity
                            style={styles.enhancedWorkoutActionButton}
                            onPress={() => handlePreviewWorkout(workout)}
                          >
                            <Ionicons name="eye" size={16} color="#10B981" />
                            <Text style={styles.enhancedWorkoutActionText}>Preview</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.enhancedWorkoutActionButton, styles.enhancedWorkoutActionButtonPrimary]}
                            onPress={() => handleStartWorkout(workout)}
                          >
                            <Ionicons name="play" size={16} color="#fff" />
                            <Text style={[styles.enhancedWorkoutActionText, styles.enhancedWorkoutActionTextPrimary]}>Start</Text>
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </LinearGradient>
          </View>
        </Modal>

        {/* Exercise Library Modal */}
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
                    {filteredExercises?.length || 0} exercises with video tutorials
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.exerciseLibrarySearchButton}
                  onPress={() => {
                    setShowSearchBar(!showSearchBar);
                    if (showSearchBar) {
                      setExerciseSearchQuery('');
                      setFilteredExercises(exerciseVideos);
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
                          setFilteredExercises(exerciseVideos);
                        } else {
                          const filtered = exerciseVideos.filter(exercise =>
                            exercise.name.toLowerCase().includes(query.toLowerCase()) ||
                            exercise.category.toLowerCase().includes(query.toLowerCase()) ||
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
                          setFilteredExercises(exerciseVideos);
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
                      selectedExerciseCategory === category && styles.exerciseFilterTabActive
                    ]}
                    onPress={() => {
                      setSelectedExerciseCategory(category);
                      if (category === 'All') {
                        setFilteredExercises(exerciseVideos);
                      } else {
                        const filtered = exerciseVideos.filter(exercise =>
                          exercise.category.toLowerCase().includes(category.toLowerCase())
                        );
                        setFilteredExercises(filtered);
                      }
                    }}
                  >
                    <Text style={[
                      styles.exerciseFilterTabText,
                      selectedExerciseCategory === category && styles.exerciseFilterTabTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Exercise Grid */}
              <ScrollView style={styles.exerciseLibraryGrid}>
                {filteredExercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.exerciseLibraryCard}
                    onPress={() => handleVideoPress(exercise)}
                  >
                    <LinearGradient
                      colors={['#1E293B', '#334155']}
                      style={styles.exerciseLibraryCardGradient}
                    >
                      {/* Exercise Header */}
                      <View style={styles.exerciseLibraryCardHeader}>
                        <View style={styles.exerciseLibraryCardThumbnail}>
                          <Ionicons name="play" size={24} color="#10B981" />
                        </View>
                        <View style={styles.exerciseLibraryCardInfo}>
                          <Text style={styles.exerciseLibraryCardTitle}>{exercise.name}</Text>
                          <Text style={styles.exerciseLibraryCardCategory}>{exercise.category}</Text>
                        </View>
                        <View style={styles.exerciseLibraryCardDifficulty}>
                          <Text style={styles.exerciseLibraryCardDifficultyText}>{exercise.difficulty}</Text>
                        </View>
                      </View>

                      {/* Exercise Description */}
                      <Text style={styles.exerciseLibraryCardDescription}>
                        {exercise.description || 'Professional exercise tutorial'}
                      </Text>

                      {/* Exercise Stats */}
                      <View style={styles.exerciseLibraryCardStats}>
                        <View style={styles.exerciseLibraryCardStat}>
                          <Ionicons name="time" size={14} color="#6B7280" />
                          <Text style={styles.exerciseLibraryCardStatText}>{exercise.duration}</Text>
                        </View>
                        <View style={styles.exerciseLibraryCardStat}>
                          <Ionicons name="eye" size={14} color="#6B7280" />
                          <Text style={styles.exerciseLibraryCardStatText}>1.2M views</Text>
                        </View>
                        <View style={styles.exerciseLibraryCardStat}>
                          <Ionicons name="trending-up" size={14} color="#6B7280" />
                          <Text style={styles.exerciseLibraryCardStatText}>{exercise.difficulty}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </LinearGradient>
          </View>
        </Modal>

        {/* View All Workouts Modal */}
        <Modal visible={showViewAllWorkouts} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.workoutLibraryModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.workoutLibraryHeader}>
                <TouchableOpacity onPress={() => setShowViewAllWorkouts(false)} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.workoutLibraryTitle}>My Workouts</Text>
                <View style={styles.placeholder} />
              </View>
              <ScrollView style={styles.workoutLibraryContent}>
                <Text style={styles.libraryDescription}>
                  Your collection of custom workout plans
                </Text>
                
                {(customWorkouts.length === 0) ? (
                  <View style={styles.emptyStateContainer}>
                    <Ionicons name="fitness-outline" size={60} color="#6B7280" />
                    <Text style={styles.emptyStateText}>No Workouts Yet</Text>
                    <Text style={styles.emptyStateSubtext}>Create your first custom workout!</Text>
                  </View>
                ) : (
                  <View style={styles.workoutGrid}>
                    {customWorkouts.map((workout) => (
                    <TouchableOpacity
                      key={workout.id}
                        style={styles.libraryWorkoutCard}
                        onPress={() => {
                          setShowViewAllWorkouts(false);
                          handlePreviewWorkout(workout);
                        }}
                      >
                        <LinearGradient
                          colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                          style={styles.libraryWorkoutGradient}
                        >
                          <Text style={styles.libraryWorkoutTitle}>{workout.name}</Text>
                          <Text style={styles.libraryWorkoutDuration}>{workout.exercises.length} exercises</Text>
                          <Text style={styles.libraryWorkoutDifficulty}>{workout.duration} min</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>

        {/* Exercise Library Modal */}
        <Modal visible={showExerciseLibrary} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.workoutLibraryModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.workoutLibraryHeader}>
                <TouchableOpacity onPress={() => setShowExerciseLibrary(false)} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.workoutLibraryTitle}>Exercise Library</Text>
                <View style={styles.placeholder} />
              </View>
              <ScrollView style={styles.workoutLibraryContent}>
                <Text style={styles.libraryDescription}>
                  Browse our comprehensive library of 60+ exercise videos with proper form demonstrations and instructions.
                        </Text>
                
                <View style={styles.exerciseGrid}>
                  {exerciseVideos.map((exercise) => (
                    <TouchableOpacity
                      key={exercise.id}
                      style={styles.libraryExerciseCard}
                      onPress={() => {
                        setShowExerciseLibrary(false);
                        handleVideoPress(exercise);
                      }}
                    >
                      <LinearGradient
                        colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                        style={styles.libraryExerciseGradient}
                      >
                        <View style={styles.libraryExerciseThumbnail}>
                          <Ionicons name="play-outline" size={20} color="#10B981" />
                      </View>
                        <Text style={styles.libraryExerciseTitle}>{exercise.name}</Text>
                        <Text style={styles.libraryExerciseCategory}>{exercise.category}</Text>
                        <View style={styles.libraryExerciseDifficulty}>
                          <Text style={styles.libraryExerciseDifficultyText}>{exercise.difficulty}</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>

        {/* Workout Preview Modal */}
        <Modal visible={showWorkoutPreview} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.libraryWorkoutPreviewModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.workoutPreviewHeader}>
                <TouchableOpacity onPress={() => setShowWorkoutPreview(false)} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.workoutPreviewTitle}>Workout Preview</Text>
                <View style={styles.placeholder} />
              </View>
              <ScrollView style={styles.modalContent}>
                {previewWorkout && (
                  <>
                    <View style={styles.workoutPreviewContent}>
                      <Text style={styles.workoutPreviewTitle}>{previewWorkout.name}</Text>
                      <Text style={styles.workoutPreviewDescription}>{previewWorkout.description}</Text>
                      <View style={styles.workoutPreviewStats}>
                        <View style={styles.workoutPreviewStat}>
                          <Ionicons name="time" size={16} color="#10B981" />
                          <Text style={styles.workoutPreviewStatText}>{previewWorkout.duration} min</Text>
                        </View>
                        <View style={styles.workoutPreviewStat}>
                          <Ionicons name="barbell" size={16} color="#10B981" />
                          <Text style={styles.workoutPreviewStatText}>{previewWorkout.exercises.length} exercises</Text>
                        </View>
                        <View style={styles.workoutPreviewStat}>
                          <Ionicons name="repeat" size={16} color="#10B981" />
                          <Text style={styles.workoutPreviewStatText}>{previewWorkout.exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0)} sets</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.exerciseList}>
                      <Text style={styles.exerciseListTitle}>Exercises</Text>
                      {previewWorkout.exercises.map((exercise, index) => (
                        <View key={index} style={styles.exercisePreviewItem}>
                          <View style={styles.exercisePreviewInfo}>
                            <Text style={styles.exercisePreviewName}>{exercise.exercise.name}</Text>
                            <Text style={styles.exercisePreviewSets}>
                              {exercise.sets.length} sets
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    <View style={styles.workoutPreviewActions}>
                      <TouchableOpacity
                        style={styles.startWorkoutButton}
                        onPress={() => {
                          setShowWorkoutPreview(false);
                          if (previewWorkout) {
                            handleStartWorkout(previewWorkout);
                          }
                        }}
                      >
                        <Ionicons name="play-outline" size={24} color="#FFFFFF" />
                        <Text style={styles.startWorkoutText}>Start Workout</Text>
                      </TouchableOpacity>
                    </View>
          </>
        )}
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>

        {/* AI Generator Modal */}
        <Modal visible={showAIGenerator} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.aiGeneratorModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>AI Workout Generator</Text>
                <TouchableOpacity onPress={() => setShowAIGenerator(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
    </View>
              <ScrollView style={styles.modalContent}>
                <Text style={styles.aiDescription}>
                  Tell us about your goals and preferences to generate a personalized workout plan.
                    </Text>

                {/* Fitness Level */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Fitness Level</Text>
                  <View style={styles.levelButtons}>
                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={[
                          styles.levelButton,
                          fitnessLevel === level && styles.levelButtonActive
                        ]}
                        onPress={() => setFitnessLevel(level)}
                      >
                        <Text style={[
                          styles.levelButtonText,
                          fitnessLevel === level && styles.levelButtonTextActive
                        ]}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Text>
                    </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Workout Goals */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Workout Goals</Text>
                  <View style={styles.goalButtons}>
                    {['strength', 'muscle', 'endurance', 'fat_loss', 'flexibility'].map((goal) => (
                    <TouchableOpacity
                        key={goal}
                        style={[
                          styles.goalButton,
                          userGoals.includes(goal) && styles.goalButtonActive
                        ]}
                        onPress={() => {
                          if (userGoals.includes(goal)) {
                            setUserGoals(prev => prev.filter(g => g !== goal));
                          } else {
                            setUserGoals(prev => [...prev, goal]);
                          }
                        }}
                      >
                        <Text style={[
                          styles.goalButtonText,
                          userGoals.includes(goal) && styles.goalButtonTextActive
                        ]}>
                          {goal.replace('_', ' ').toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                      </View>
                </View>

                {/* Target Muscles */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Target Muscles</Text>
                  <View style={styles.muscleButtons}>
                    {['chest', 'back', 'legs', 'shoulders', 'arms', 'core'].map((muscle) => (
            <TouchableOpacity
                        key={muscle}
                        style={[
                          styles.muscleButton,
                          targetMuscles.includes(muscle) && styles.muscleButtonActive
                        ]}
              onPress={() => {
                          if (targetMuscles.includes(muscle)) {
                            setTargetMuscles(prev => prev.filter(m => m !== muscle));
                          } else {
                            setTargetMuscles(prev => [...prev, muscle]);
                          }
                        }}
                      >
                        <Text style={[
                          styles.muscleButtonText,
                          targetMuscles.includes(muscle) && styles.muscleButtonTextActive
                        ]}>
                          {muscle.toUpperCase()}
                        </Text>
            </TouchableOpacity>
                    ))}
            </View>
                </View>

                {/* Equipment Available */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Available Equipment</Text>
                  <View style={styles.equipmentButtons}>
                    {['bodyweight', 'dumbbells', 'barbell', 'machine', 'cable', 'all'].map((equipment) => (
            <TouchableOpacity
                        key={equipment}
                        style={[
                          styles.equipmentButton,
                          equipmentAvailable.includes(equipment) && styles.equipmentButtonActive
                        ]}
                        onPress={() => {
                          if (equipmentAvailable.includes(equipment)) {
                            setEquipmentAvailable(prev => prev.filter(e => e !== equipment));
                          } else {
                            setEquipmentAvailable(prev => [...prev, equipment]);
                          }
                        }}
                      >
                        <Text style={[
                          styles.equipmentButtonText,
                          equipmentAvailable.includes(equipment) && styles.equipmentButtonTextActive
                        ]}>
                          {equipment.toUpperCase()}
                        </Text>
            </TouchableOpacity>
                    ))}
    </View>
          </View>

                {/* Workout Duration */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Workout Duration: {workoutDuration} minutes</Text>
                  <View style={styles.durationSlider}>
                    <TouchableOpacity
                      style={styles.durationButton}
                      onPress={() => setWorkoutDuration(Math.max(15, workoutDuration - 15))}
                    >
                      <Ionicons name="remove" size={20} color="#10B981" />
                    </TouchableOpacity>
                    <Text style={styles.durationText}>{workoutDuration} min</Text>
                    <TouchableOpacity
                      style={styles.durationButton}
                      onPress={() => setWorkoutDuration(Math.min(120, workoutDuration + 15))}
                    >
                      <Ionicons name="add" size={20} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Generate Button */}
            <TouchableOpacity
                  style={styles.generateButton}
                  onPress={createPersonalizedWorkout}
                >
                  <Ionicons name="bulb-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>Generate AI Workout</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Workout Calendar Modal */}
        <Modal visible={showWorkoutCalendar} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.calendarModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => setShowWorkoutCalendar(false)} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.calendarTitle}>Workout Calendar</Text>
                <View style={styles.placeholder} />
              </View>
              <ScrollView style={styles.modalContent}>
                <Text style={styles.calendarDescription}>
                  Select a date to view your workout history, tonnage, and completed workouts.
                </Text>

                {/* Date Picker */}
                <View style={styles.datePickerContainer}>
                  <TouchableOpacity
                    style={styles.dateButton}
              onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() - 1);
                      setSelectedDate(newDate);
                      loadCalendarData(newDate);
                    }}
                  >
                    <Ionicons name="chevron-back" size={20} color="#10B981" />
            </TouchableOpacity>
                  
                  <Text style={styles.selectedDateText}>
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                      </Text>
                  
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() + 1);
                      setSelectedDate(newDate);
                      loadCalendarData(newDate);
                    }}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#10B981" />
                  </TouchableOpacity>
                    </View>

                {/* Workout Stats for Selected Date */}
                <View style={styles.workoutStatsContainer}>
                  <View style={styles.statCard}>
                    <Ionicons name="barbell-outline" size={24} color="#10B981" />
                    <Text style={styles.statValue}>{calendarLoading ? '...' : calendarTonnage}</Text>
                    <Text style={styles.statLabel}>Tonnage (lbs)</Text>
                      </View>
                  <View style={styles.statCard}>
                    <Ionicons name="fitness-outline" size={24} color="#10B981" />
                    <Text style={styles.statValue}>{calendarLoading ? '...' : calendarWorkoutCount}</Text>
                    <Text style={styles.statLabel}>Workouts</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Ionicons name="time-outline" size={24} color="#10B981" />
                    <Text style={styles.statValue}>{calendarLoading ? '...' : calendarDuration}</Text>
                    <Text style={styles.statLabel}>Minutes</Text>
                  </View>
                </View>

                {/* Workout List for Selected Date */}
                <View style={styles.workoutListContainer}>
                  <Text style={styles.workoutListTitle}>Workouts on {selectedDate.toLocaleDateString()}</Text>
                  {calendarLoading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.loadingText}>Loading workouts...</Text>
                    </View>
                  ) : (calendarWorkouts.length > 0) ? (
                    calendarWorkouts.map((workout, index) => (
                      <View key={index} style={styles.workoutHistoryItem}>
                        <View style={styles.workoutHistoryInfo}>
                          <Text style={styles.workoutHistoryName}>{workout.name}</Text>
                          <Text style={styles.workoutHistoryDescription}>{workout.description}</Text>
                        </View>
                        <View style={styles.workoutHistoryStats}>
                          <Text style={styles.workoutHistoryDuration}>{workout.duration} min</Text>
                          <Text style={styles.workoutHistoryTonnage}>{workout.tonnage} lbs</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.noWorkoutsContainer}>
                      <Ionicons name="fitness-outline" size={48} color="#6B7280" />
                      <Text style={styles.noWorkoutsText}>No workouts on this date</Text>
                      <Text style={styles.noWorkoutsSubtext}>Start a workout to see it here!</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>


        {/* Exercise Library Modal */}
        <Modal visible={showExerciseLibrary} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.workoutLibraryModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.workoutLibraryHeader}>
                <TouchableOpacity onPress={() => setShowExerciseLibrary(false)} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.workoutLibraryTitle}>Exercise Library</Text>
                <View style={styles.placeholder} />
              </View>
              <ScrollView style={styles.workoutLibraryContent}>
                <Text style={styles.libraryDescription}>
                  60+ exercise videos with detailed instructions and demonstrations
                </Text>
                <View style={styles.exerciseGrid}>
                  {exerciseVideos.map((exercise) => (
                    <TouchableOpacity
                      key={exercise.id}
                      style={styles.libraryExerciseCard}
                      onPress={() => handleVideoPress(exercise)}
                    >
                      <LinearGradient
                        colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                        style={styles.libraryExerciseGradient}
                      >
                        <View style={styles.libraryExerciseThumbnail}>
                          <Ionicons name="play" size={20} color="#10B981" />
                        </View>
                        <Text style={styles.libraryExerciseTitle}>{exercise.name}</Text>
                        <Text style={styles.libraryExerciseCategory}>{exercise.category}</Text>
                        <View style={styles.libraryExerciseDifficulty}>
                          <Text style={styles.libraryExerciseDifficultyText}>{exercise.difficulty}</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>

        {/* Workout Library Modal */}
        <Modal visible={showWorkoutLibrary} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.workoutLibraryModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.workoutLibraryHeader}>
                <TouchableOpacity onPress={() => setShowWorkoutLibrary(false)} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.workoutLibraryTitle}>Workout Library</Text>
                <View style={styles.placeholder} />
              </View>
              <ScrollView style={styles.workoutLibraryContent}>
                <Text style={styles.libraryDescription}>
                  Choose from our comprehensive collection of pre-made workouts
                </Text>

                {/* Strength Workouts */}
                <View style={styles.workoutCategory}>
                  <Text style={styles.categoryTitle}>💪 Strength Training</Text>
                  <View style={styles.workoutGrid}>
                    {workoutLibrary.strength.map((workout) => (
                      <TouchableOpacity
                        key={workout.id}
                        style={styles.libraryWorkoutCard}
                        onPress={() => handleVideoCardPress(workout)}
                      >
                        <LinearGradient
                          colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                          style={styles.libraryWorkoutGradient}
                        >
                          <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              toggleFavorite(workout.id);
                            }}
                          >
                            <Ionicons 
                              name={favoritedWorkouts.has(workout.id) ? "star" : "star-outline"} 
                              size={20} 
                              color={favoritedWorkouts.has(workout.id) ? "#FFD700" : "#FFFFFF"} 
                            />
                          </TouchableOpacity>
                          <Text style={styles.libraryWorkoutTitle}>{workout.name}</Text>
                          <Text style={styles.libraryWorkoutDuration}>{workout.duration} min</Text>
                          <Text style={styles.libraryWorkoutDifficulty}>{workout.difficulty}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                ))}
              </View>
                      </View>

                {/* Powerlifting */}
                <View style={styles.workoutCategory}>
                  <Text style={styles.categoryTitle}>🏋️ Powerlifting</Text>
                  <View style={styles.workoutGrid}>
                    {workoutLibrary.powerlifting.map((workout) => (
                      <TouchableOpacity
                        key={workout.id}
                        style={styles.libraryWorkoutCard}
                        onPress={() => handleVideoCardPress(workout)}
                      >
                        <LinearGradient
                          colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                          style={styles.libraryWorkoutGradient}
                        >
                          <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              toggleFavorite(workout.id);
                            }}
                          >
                            <Ionicons 
                              name={favoritedWorkouts.has(workout.id) ? "star" : "star-outline"} 
                              size={20} 
                              color={favoritedWorkouts.has(workout.id) ? "#FFD700" : "#FFFFFF"} 
                            />
                          </TouchableOpacity>
                          <Text style={styles.libraryWorkoutTitle}>{workout.name}</Text>
                          <Text style={styles.libraryWorkoutDuration}>{workout.duration} min</Text>
                          <Text style={styles.libraryWorkoutDifficulty}>{workout.difficulty}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* CrossFit */}
                <View style={styles.workoutCategory}>
                  <Text style={styles.categoryTitle}>🔥 CrossFit</Text>
                  <View style={styles.workoutGrid}>
                    {workoutLibrary.crossfit.map((workout) => (
                      <TouchableOpacity
                        key={workout.id}
                        style={styles.libraryWorkoutCard}
                        onPress={() => handleVideoCardPress(workout)}
                      >
                        <LinearGradient
                          colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                          style={styles.libraryWorkoutGradient}
                        >
                          <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              toggleFavorite(workout.id);
                            }}
                          >
                            <Ionicons 
                              name={favoritedWorkouts.has(workout.id) ? "star" : "star-outline"} 
                              size={20} 
                              color={favoritedWorkouts.has(workout.id) ? "#FFD700" : "#FFFFFF"} 
                            />
                          </TouchableOpacity>
                          <Text style={styles.libraryWorkoutTitle}>{workout.name}</Text>
                          <Text style={styles.libraryWorkoutDuration}>{workout.duration} min</Text>
                          <Text style={styles.libraryWorkoutDifficulty}>{workout.difficulty}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                ))}
              </View>
                </View>

                {/* Yoga */}
                <View style={styles.workoutCategory}>
                  <Text style={styles.categoryTitle}>🧘 Yoga</Text>
                  <View style={styles.workoutGrid}>
                    {workoutLibrary.yoga.map((workout) => (
                      <TouchableOpacity
                        key={workout.id}
                        style={styles.libraryWorkoutCard}
                        onPress={() => handleVideoCardPress(workout)}
                      >
                        <LinearGradient
                          colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                          style={styles.libraryWorkoutGradient}
                        >
                          <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              toggleFavorite(workout.id);
                            }}
                          >
                            <Ionicons 
                              name={favoritedWorkouts.has(workout.id) ? "star" : "star-outline"} 
                              size={20} 
                              color={favoritedWorkouts.has(workout.id) ? "#FFD700" : "#FFFFFF"} 
                            />
                          </TouchableOpacity>
                          <View style={styles.videoThumbnail}>
                            <Ionicons name="play-outline" size={32} color="#10B981" />
                          </View>
                          <Text style={styles.libraryWorkoutTitle}>{workout.name}</Text>
                          <Text style={styles.libraryWorkoutDuration}>{workout.duration} min</Text>
                          <Text style={styles.libraryWorkoutDifficulty}>{workout.difficulty}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Stretching */}
                <View style={styles.workoutCategory}>
                  <Text style={styles.categoryTitle}>🤸 Stretching</Text>
                  <View style={styles.workoutGrid}>
                    {workoutLibrary.stretching.map((workout) => (
                      <TouchableOpacity
                        key={workout.id}
                        style={styles.libraryWorkoutCard}
                        onPress={() => handleVideoCardPress(workout)}
                      >
                        <LinearGradient
                          colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                          style={styles.libraryWorkoutGradient}
                        >
                          <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              toggleFavorite(workout.id);
                            }}
                          >
                            <Ionicons 
                              name={favoritedWorkouts.has(workout.id) ? "star" : "star-outline"} 
                              size={20} 
                              color={favoritedWorkouts.has(workout.id) ? "#FFD700" : "#FFFFFF"} 
                            />
                          </TouchableOpacity>
                          <View style={styles.videoThumbnail}>
                            <Ionicons name="play-outline" size={32} color="#10B981" />
                          </View>
                          <Text style={styles.libraryWorkoutTitle}>{workout.name}</Text>
                          <Text style={styles.libraryWorkoutDuration}>{workout.duration} min</Text>
                          <Text style={styles.libraryWorkoutDifficulty}>{workout.difficulty}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
          </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>

        {/* Video Card Modal */}
        <Modal visible={showVideoCard} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.videoCardModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Workout Video</Text>
                <TouchableOpacity onPress={() => setShowVideoCard(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.videoCardContent}>
                {selectedVideoCard && (
                  <>
                    <View style={styles.videoThumbnailLarge}>
                      <Ionicons name="play-circle" size={64} color="#10B981" />
                    </View>
                    <Text style={styles.videoCardTitle}>{selectedVideoCard.name}</Text>
                    <Text style={styles.videoCardDescription}>{selectedVideoCard.description}</Text>
                    <View style={styles.videoCardStats}>
                      <View style={styles.videoCardStat}>
                        <Ionicons name="time" size={16} color="#10B981" />
                        <Text style={styles.videoCardStatText}>{selectedVideoCard.duration} min</Text>
                      </View>
                      <View style={styles.videoCardStat}>
                        <Ionicons name="star" size={16} color="#10B981" />
                        <Text style={styles.videoCardStatText}>{selectedVideoCard.difficulty}</Text>
                      </View>
                    </View>
                <TouchableOpacity
                      style={styles.playVideoButton}
                      onPress={() => handlePlayVideo(selectedVideoCard.videoUrl)}
                >
                      <Ionicons name="play" size={24} color="#FFFFFF" />
                      <Text style={styles.playVideoText}>Play Video</Text>
                </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </Modal>

        {/* Library Workout Preview Modal */}
        <Modal visible={showLibraryWorkoutPreview} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.libraryWorkoutPreviewModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.workoutPreviewHeader}>
                <TouchableOpacity onPress={() => setShowLibraryWorkoutPreview(false)} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.workoutPreviewTitle}>Workout Preview</Text>
                <View style={styles.placeholder} />
              </View>
              <ScrollView style={styles.modalContent}>
                {selectedLibraryWorkout && (
                  <>
                    <View style={styles.workoutPreviewContent}>
                      <Text style={styles.workoutPreviewTitle}>{selectedLibraryWorkout.name}</Text>
                      <Text style={styles.workoutPreviewDescription}>{selectedLibraryWorkout.description}</Text>
                      <View style={styles.workoutPreviewStats}>
                        <View style={styles.workoutPreviewStat}>
                          <Ionicons name="time" size={16} color="#10B981" />
                          <Text style={styles.workoutPreviewStatText}>{selectedLibraryWorkout.duration} min</Text>
                        </View>
                        <View style={styles.workoutPreviewStat}>
                          <Ionicons name="star" size={16} color="#10B981" />
                          <Text style={styles.workoutPreviewStatText}>{selectedLibraryWorkout.difficulty}</Text>
                        </View>
                        <View style={styles.workoutPreviewStat}>
                          <Ionicons name="barbell" size={16} color="#10B981" />
                          <Text style={styles.workoutPreviewStatText}>{selectedLibraryWorkout.exercises.length} exercises</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.exerciseList}>
                      <Text style={styles.exerciseListTitle}>Exercises</Text>
                      {selectedLibraryWorkout.exercises.map((exercise: any, index: number) => (
                        <View key={index} style={styles.exercisePreviewItem}>
                          <View style={styles.exercisePreviewInfo}>
                            <Text style={styles.exercisePreviewName}>{exercise.name}</Text>
                            <Text style={styles.exercisePreviewSets}>
                              {exercise.sets} sets × {exercise.reps} reps
                            </Text>
                            {exercise.rest ? (
                              <Text style={styles.exercisePreviewRest}>Rest: {exercise.rest}</Text>
                            ) : null}
                          </View>
                        </View>
                      ))}
                    </View>

                    <View style={styles.workoutPreviewActions}>
                      <TouchableOpacity
                        style={styles.startWorkoutButton}
                        onPress={() => handleStartLibraryWorkout(selectedLibraryWorkout)}
                      >
                        <Ionicons name="play" size={24} color="#FFFFFF" />
                        <Text style={styles.startWorkoutText}>Start Workout</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </ScrollView>
            </SafeAreaView>
          </View>
      </Modal>

        
        {/* End Workout Modal */}
        <Modal visible={showEndWorkoutModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.endWorkoutModal}>
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

        {/* Workout Summary Modal */}
        <Modal visible={showWorkoutSummary} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.workoutSummaryModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.workoutSummaryHeader}>
                <Text style={styles.workoutSummaryTitle}>Workout Complete!</Text>
                <Text style={styles.workoutSummarySubtitle}>{activeWorkout?.name}</Text>
              </View>
              
              <ScrollView style={styles.workoutSummaryContent}>
                {workoutData ? (
                  <>
                    {/* Time Summary */}
                    <View style={styles.summarySection}>
                      <Text style={styles.summarySectionTitle}>Time Summary</Text>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Time</Text>
                        <Text style={styles.summaryValue}>{formatTime(workoutData.totalTime)}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Time Spent Lifting</Text>
                        <Text style={styles.summaryValue}>{formatTime(workoutData.timeSpentLifting)}</Text>
                      </View>
                    </View>

                    {/* Tonnage Summary */}
                    <View style={styles.summarySection}>
                      <Text style={styles.summarySectionTitle}>Tonnage Summary</Text>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Tonnage</Text>
                        <Text style={styles.summaryValue}>{workoutData.totalTonnage.toLocaleString()} lbs</Text>
                      </View>
                    </View>

                    {/* Muscle Group Breakdown */}
                    <View style={styles.summarySection}>
                      <Text style={styles.summarySectionTitle}>Tonnage by Muscle Group</Text>
                      {Object.entries(workoutData.tonnagePerMuscleGroup).map(([muscle, tonnage]) => (
                        <View key={muscle} style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>{muscle}</Text>
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
                  </>
                ) : null}
              </ScrollView>
              
              <View style={styles.workoutSummaryActions}>
                <TouchableOpacity 
                  style={styles.saveWorkoutButton}
                  onPress={saveWorkout}
                >
                  <Text style={styles.saveWorkoutButtonText}>Exit & Save</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </Modal>

        {/* AI Workout Generator Modal */}
        <AIWorkoutGenerator
          visible={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
          onSaveWorkout={(workout) => {
            setCustomWorkouts(prev => [...prev, workout]);
            setShowAIGenerator(false);
          }}
        />

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  calendarButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  calendarButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  heroStatsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  heroStatIcon: {
    marginBottom: 8,
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  quickStartContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickStartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  quickStartButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickStartButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  quickStartButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  quickStartButtonIcon: {
    marginBottom: 8,
  },
  quickStartButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewAllButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  viewAllButtonText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  myWorkoutsContainer: {
    paddingHorizontal: 20,
  },
  workoutCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  workoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  workoutCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutCardStat: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 8,
  },
  workoutCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutCardButtons: {
    flexDirection: 'row',
  },
  workoutCardButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  workoutCardButtonText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
  exerciseVideosContainer: {
    paddingHorizontal: 20,
  },
  exerciseVideoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseVideoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  exerciseVideoDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  exerciseVideoButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  exerciseVideoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  closeButtonText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  startWorkoutButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  startWorkoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addSetBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  addSetBtnText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionCardGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  actionCardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  workoutItem: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workoutItemContent: {
    flex: 1,
  },
  workoutItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutItemDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  workoutItemStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutItemStat: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  exerciseItem: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
  },
  exerciseThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  exerciseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  emptyStateContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyStateGradient: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyStateButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  workoutCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  workoutCardGradient: {
    padding: 20,
  },
  workoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    color: '#94A3B8',
    lineHeight: 20,
  },
  workoutCardActions: {
    marginLeft: 12,
  },
  workoutCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutStatText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 6,
    fontWeight: '500',
  },
  exerciseCard: {
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    width: 160,
  },
  exerciseCardGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
  },
  exerciseDifficulty: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  exerciseDifficultyText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  // Workout Library Modal Styles
  workoutLibraryContainer: {
    flex: 1,
  },
  workoutLibraryGradient: {
    flex: 1,
  },
  workoutLibraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  workoutLibraryBackButton: {
    padding: 8,
    marginRight: 16,
  },
  workoutLibraryTitleContainer: {
    flex: 1,
  },
  workoutLibraryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  workoutLibrarySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  workoutLibrarySearchButton: {
    padding: 8,
    marginLeft: 16,
  },
  workoutSearchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  workoutSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  workoutSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  workoutSearchClear: {
    padding: 4,
  },
  workoutLibraryGrid: {
    flex: 1,
    paddingHorizontal: 20,
  },
  enhancedWorkoutCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  enhancedWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  enhancedWorkoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  workoutDifficultyBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  workoutDifficultyText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  workoutActionsContainer: {
    alignItems: 'flex-end',
  },
  workoutMenuButton: {
    padding: 8,
  },
  enhancedWorkoutDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  enhancedWorkoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  enhancedWorkoutStat: {
    alignItems: 'center',
    gap: 4,
  },
  enhancedWorkoutStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  enhancedWorkoutStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  enhancedWorkoutActions: {
    flexDirection: 'row',
    gap: 12,
  },
  enhancedWorkoutActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    gap: 8,
  },
  enhancedWorkoutActionButtonPrimary: {
    backgroundColor: '#10B981',
  },
  enhancedWorkoutActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  enhancedWorkoutActionTextPrimary: {
    color: '#fff',
  },
  // Exercise Library Modal Styles
  exerciseLibraryContainer: {
    flex: 1,
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
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#fff',
    marginBottom: 4,
  },
  exerciseLibrarySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  exerciseLibrarySearchButton: {
    padding: 8,
    marginLeft: 16,
  },
  exerciseSearchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  exerciseSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  exerciseSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  exerciseSearchClear: {
    padding: 4,
  },
  exerciseFilterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  exerciseFilterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseFilterTabActive: {
    backgroundColor: '#10B981',
  },
  exerciseFilterTabText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  exerciseFilterTabTextActive: {
    color: '#fff',
  },
  exerciseLibraryGrid: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseLibraryCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  exerciseLibraryCardGradient: {
    padding: 16,
  },
  exerciseLibraryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  exerciseLibraryCardThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseLibraryCardInfo: {
    flex: 1,
  },
  exerciseLibraryCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  exerciseLibraryCardCategory: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  exerciseLibraryCardDifficulty: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exerciseLibraryCardDifficultyText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  exerciseLibraryCardDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 12,
  },
  exerciseLibraryCardStats: {
    flexDirection: 'row',
    gap: 16,
  },
  exerciseLibraryCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseLibraryCardStatText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
