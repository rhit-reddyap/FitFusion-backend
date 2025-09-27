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


