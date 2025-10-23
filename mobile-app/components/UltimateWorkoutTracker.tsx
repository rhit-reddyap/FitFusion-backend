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
  const [showMonthlyView, setShowMonthlyView] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [calendarTonnage, setCalendarTonnage] = useState(0);
  const [calendarWorkoutCount, setCalendarWorkoutCount] = useState(0);
  const [calendarDuration, setCalendarDuration] = useState(0);
  const [calendarWorkouts, setCalendarWorkouts] = useState<any[]>([]);
  const [weeklyTonnage, setWeeklyTonnage] = useState(0);
  const [dailyTonnage, setDailyTonnage] = useState(0);
  const [dailyMinutes, setDailyMinutes] = useState(0);
  const [dailyWorkouts, setDailyWorkouts] = useState(0);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [showWorkoutLibrary, setShowWorkoutLibrary] = useState(false);
  const [showVideoCard, setShowVideoCard] = useState(false);
  const [selectedVideoCard, setSelectedVideoCard] = useState<any>(null);
  const [selectedLibraryWorkout, setSelectedLibraryWorkout] = useState<any>(null);
  const [showLibraryWorkoutPreview, setShowLibraryWorkoutPreview] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
  const [selectedExerciseCategory, setSelectedExerciseCategory] = useState('All');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [favoritedWorkouts, setFavoritedWorkouts] = useState<Set<string>>(new Set());
  const [showPRNotifications, setShowPRNotifications] = useState(false);
  const [recentPRs, setRecentPRs] = useState<any[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<CustomWorkout | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Import data from chunk files
  const { premadeWorkouts, exerciseVideos } = require('./UltimateWorkoutTracker_chunk2');

  useEffect(() => {
    loadUserData();
    loadCustomWorkouts();
    initializeOfflineManager();
  }, []);

  // Refresh data when component becomes visible
  useEffect(() => {
    const refreshData = async () => {
      await loadUserData();
      await loadWeeklyTonnage();
      await loadDailyTonnage();
      await loadDailyMinutes();
      await loadDailyWorkouts();
    };
    refreshData();
  }, []);

  // Load today's data for dashboard
  useEffect(() => {
    loadCalendarData(new Date());
    loadWeeklyTonnage();
    loadDailyTonnage();
    loadDailyMinutes();
  }, []);

  // Timer effect for workout
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (showWorkoutModal && workoutStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - workoutStartTime.getTime()) / 1000);
        setWorkoutTimer(elapsedSeconds);
        
        if (workoutData) {
          setWorkoutData((prev: any) => prev ? { ...prev, totalTime: elapsedSeconds } : prev);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showWorkoutModal, workoutStartTime]);

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
      
      // Calculate actual workout streak based on consecutive days with workouts
      const actualStreak = await calculateWorkoutStreak();
      const updatedStats = {
        ...stats,
        workoutStreak: actualStreak
      };
      
      console.log('Loaded user stats:', updatedStats);
      console.log('Actual workout streak:', actualStreak);
      setWorkoutLogs(logs);
      setUserStats(updatedStats);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomWorkouts = async () => {
    try {
      const workouts = await DataStorage.getCustomWorkouts();
      setCustomWorkouts(workouts.length > 0 ? workouts : []);
    } catch (error) {
      console.error('Error loading custom workouts:', error);
      setCustomWorkouts([]);
    }
  };

  const loadCalendarData = async (date: Date) => {
    setCalendarLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const workouts = await DataStorage.getWorkoutLogs(dateStr);
      const tonnage = workouts.reduce((total: number, workout: any) => {
        return total + (workout.totalTonnage || 0);
      }, 0);
      const duration = workouts.reduce((total: number, workout: any) => {
        return total + (workout.duration || 0);
      }, 0);
      
      setCalendarTonnage(tonnage);
      setCalendarWorkoutCount(workouts.length);
      setCalendarDuration(duration);
      setCalendarWorkouts(workouts.map((workout: any) => ({
        name: workout.workoutName,
        description: workout.notes || 'Workout completed',
        duration: workout.duration || 0,
        tonnage: workout.totalTonnage || 0
      })));
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setCalendarLoading(false);
    }
  };

  const loadWeeklyTonnage = async () => {
    try {
      const weekly = await DataStorage.calculateWeeklyTonnage();
      console.log('Loaded weekly tonnage:', weekly);
      setWeeklyTonnage(weekly || 0);
    } catch (error) {
      console.error('Error loading weekly tonnage:', error);
      setWeeklyTonnage(0);
    }
  };

  const loadDailyTonnage = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const workouts = await DataStorage.getWorkoutLogs(today);
      const totalTonnage = workouts.reduce((total: number, workout: any) => {
        return total + (workout.totalTonnage || 0);
      }, 0);
      console.log('Loaded daily tonnage:', totalTonnage);
      setDailyTonnage(totalTonnage);
    } catch (error) {
      console.error('Error loading daily tonnage:', error);
      setDailyTonnage(0);
    }
  };

  const loadDailyMinutes = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const workouts = await DataStorage.getWorkoutLogs(today);
      const totalMinutes = workouts.reduce((total: number, workout: any) => {
        return total + (workout.duration || 0);
      }, 0);
      console.log('Loaded daily minutes:', totalMinutes);
      setDailyMinutes(Math.floor(totalMinutes / 60)); // Convert seconds to minutes
    } catch (error) {
      console.error('Error loading daily minutes:', error);
      setDailyMinutes(0);
    }
  };

  const loadDailyWorkouts = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const workouts = await DataStorage.getWorkoutLogs(today);
      const workoutCount = Array.isArray(workouts) ? workouts.length : 0;
      console.log('Loaded daily workouts:', workoutCount);
      setDailyWorkouts(workoutCount);
    } catch (error) {
      console.error('Error loading daily workouts:', error);
      setDailyWorkouts(0);
    }
  };

  // Calculate actual workout streak based on consecutive days with workouts
  const calculateWorkoutStreak = async () => {
    try {
      const today = new Date();
      let streak = 0;
      
      // Check backwards from today to find consecutive days with workouts
      for (let i = 0; i < 30; i++) { // Check up to 30 days back
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        try {
          const dayWorkouts = await DataStorage.getWorkoutLogs(dateStr);
          if (Array.isArray(dayWorkouts) && dayWorkouts.length > 0) {
            streak++;
          } else {
            // If we find a day without workouts, stop counting
            break;
          }
        } catch (error) {
          console.error('Error checking workouts for date:', dateStr, error);
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating workout streak:', error);
      return 0;
    }
  };

  // Monthly calendar functions
  const generateMonthlyCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const calendar = [];
    const current = new Date(startDate);
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        weekDays.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      calendar.push(weekDays);
      
      // Stop if we've covered the entire month
      if (current.getMonth() !== month && week >= 4) break;
    }
    
    return calendar;
  };

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    await loadCalendarData(date);
    setShowMonthlyView(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date, month: Date) => {
    return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
  };

  const loadRecentPRs = async () => {
    try {
      const personalRecords = await DataStorage.getPersonalRecords();
      
      // Convert personal records to array with timestamps and sort by date
      const prArray = Object.entries(personalRecords).map(([key, record]: [string, any]) => ({
        id: key,
        exerciseName: record.exercise,
        weight: record.weight,
        reps: record.reps,
        date: record.date,
        timestamp: new Date(record.date).getTime(),
        type: key.includes('_reps') ? 'Rep PR' : 'Weight PR'
      }));
      
      // Sort by most recent first and take last 10
      const sortedPRs = prArray
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
      
      console.log('Loaded recent PRs:', sortedPRs);
      setRecentPRs(sortedPRs);
    } catch (error) {
      console.error('Error loading recent PRs:', error);
      setRecentPRs([]);
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await DataStorage.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleWorkoutCreated = (newWorkout: CustomWorkout) => {
    setCustomWorkouts(prev => [...prev, newWorkout]);
    setShowCustomBuilder(false);
  };

  const handleEditWorkout = (workout: CustomWorkout) => {
    console.log('Editing workout:', workout);
    console.log('Workout exercises:', workout.exercises);
    setEditingWorkout(workout);
    setShowWorkoutPreview(false);
    setShowCustomBuilder(true);
  };

  const handleWorkoutUpdated = (updatedWorkout: CustomWorkout) => {
    if (editingWorkout) {
      setCustomWorkouts(prev => 
        prev.map(workout => 
          workout.id === editingWorkout.id ? updatedWorkout : workout
        )
      );
      // Save to DataStorage
      DataStorage.saveCustomWorkouts(
        customWorkouts.map(workout => 
          workout.id === editingWorkout.id ? updatedWorkout : workout
        )
      );
    }
    setEditingWorkout(null);
    setShowCustomBuilder(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUserData();
      await loadCustomWorkouts();
      await loadWeeklyTonnage();
      await loadDailyTonnage();
      await loadDailyMinutes();
      await loadDailyWorkouts();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setRefreshing(false);
  };

  const handlePreviewWorkout = (workout: CustomWorkout) => {
    setActiveWorkout(workout);
    setShowWorkoutPreview(true);
  };

  const handleVideoPress = (exercise: any) => {
    console.log('Video pressed:', exercise.name);
    if (exercise.videoUrl) {
      Linking.openURL(exercise.videoUrl);
    } else {
      setSelectedVideo(exercise);
      setShowVideoModal(true);
    }
  };

  const toggleFavorite = (workoutId: string) => {
    setFavoritedWorkouts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId);
      } else {
        newSet.add(workoutId);
        // Save to My Workouts if favorited
        const workout = findWorkoutInLibrary(workoutId);
        if (workout) {
          saveWorkoutToMyWorkouts(workout);
        }
      }
      return newSet;
    });
  };

  const findWorkoutInLibrary = (workoutId: string) => {
    if (!premadeWorkouts) return null;
    
    for (const category of Object.values(premadeWorkouts)) {
      if (Array.isArray(category)) {
        const workout = category.find((w: any) => w.id === workoutId);
        if (workout) return workout;
      }
    }
    return null;
  };

  const saveWorkoutToMyWorkouts = async (workout: any) => {
    try {
      const customWorkout: CustomWorkout = {
        id: `custom_${Date.now()}`,
        name: workout.name,
        description: workout.description,
        exercises: workout.exercises || [],
        createdAt: new Date(),
        lastUsed: new Date()
      };
      
      setCustomWorkouts(prev => [...prev, customWorkout]);
      await DataStorage.saveCustomWorkouts([customWorkout]);
    } catch (error) {
      console.error('Error saving workout to My Workouts:', error);
    }
  };

  const handlePlayVideo = (workout: any) => {
    if (workout.videoUrl) {
      Linking.openURL(workout.videoUrl);
    } else {
      Alert.alert('No Video', 'This workout does not have a video available.');
    }
  };

  const handleVideoCardPress = (exercise: any) => {
    if (exercise.videoUrl) {
      Linking.openURL(exercise.videoUrl);
    } else {
      setSelectedVideoCard(exercise);
      setShowVideoCard(true);
    }
  };

  const handleStartLibraryWorkout = (workout: any) => {
    // Convert library workout to custom workout format
    const customWorkout: CustomWorkout = {
      id: `library_${workout.id}`,
      name: workout.name,
      description: workout.description,
      exercises: workout.exercises || [],
      createdAt: new Date(),
      lastUsed: new Date()
    };
    
    setActiveWorkout(customWorkout);
    setShowLibraryWorkoutPreview(false);
    setShowWorkoutStartModal(true);
  };

  // PR Notification Functions
  const checkForPRs = async (exerciseName: string, weight: number, reps: number) => {
    try {
      const isPR = await checkIfPR(exerciseName, weight, reps);
      const isRepPR = await checkIfRepPR(exerciseName, weight, reps);
      
      if (isPR || isRepPR) {
        const prType = isPR ? 'Weight PR' : 'Rep PR';
        const prMessage = `🎉 New ${prType}! ${exerciseName}: ${weight}lbs x ${reps} reps`;
        
        Alert.alert('Personal Record!', prMessage, [
          { text: 'Share with Team', onPress: () => showTeamSelectionForPR(exerciseName, weight, reps, prType) },
          { text: 'Awesome!', style: 'default' }
        ]);
        
        // Vibrate for PR
        Vibration.vibrate([0, 200, 100, 200]);
      }
    } catch (error) {
      console.error('Error checking for PRs:', error);
    }
  };

  const checkIfPR = async (exerciseName: string, weight: number, reps: number) => {
    try {
      const personalRecords = await DataStorage.getPersonalRecords();
      const exerciseKey = exerciseName.toLowerCase().replace(/\s+/g, '_');
      const currentRecord = personalRecords[exerciseKey];
      
      if (!currentRecord || weight > currentRecord.weight) {
        // Save new weight PR
        await DataStorage.savePersonalRecord(exerciseKey, {
          exercise: exerciseName,
          weight: weight,
          reps: reps,
          date: new Date().toISOString()
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking weight PR:', error);
      return false;
    }
  };

  const checkIfRepPR = async (exerciseName: string, weight: number, reps: number) => {
    try {
      const personalRecords = await DataStorage.getPersonalRecords();
      const exerciseKey = exerciseName.toLowerCase().replace(/\s+/g, '_');
      const repKey = `${exerciseKey}_reps`;
      const currentRecord = personalRecords[repKey];
      
      if (!currentRecord || (weight >= currentRecord.weight && reps > currentRecord.reps)) {
        // Save new rep PR
        await DataStorage.savePersonalRecord(repKey, {
          exercise: exerciseName,
          weight: weight,
          reps: reps,
          date: new Date().toISOString()
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking rep PR:', error);
      return false;
    }
  };

  const showTeamSelectionForPR = async (exerciseName: string, weight: number, reps: number, prType: string) => {
    try {
      // Get user's teams
      const userTeams = await DataStorage.getUserTeams();
      
      if (!userTeams || userTeams.length === 0) {
        Alert.alert('No Teams', 'You are not part of any teams yet. Join or create a team to share your PRs!', [
          { text: 'OK', style: 'default' }
        ]);
        return;
      }
      
      // Create team selection options
      const teamOptions = userTeams.map((team: any) => ({
        text: team.name,
        onPress: () => shareWithSpecificTeam(team.id, team.name, exerciseName, weight, reps, prType)
      }));
      
      // Add "Share with All Teams" option if user has multiple teams
      if (userTeams.length > 1) {
        teamOptions.unshift({
          text: 'Share with All Teams',
          onPress: () => shareWithAllTeams(userTeams, exerciseName, weight, reps, prType)
        });
      }
      
      // Add cancel option
      teamOptions.push({ text: 'Cancel', style: 'cancel' });
      
      Alert.alert('Select Team(s)', 'Choose which team(s) to share your PR with:', teamOptions);
      
    } catch (error) {
      console.error('Error showing team selection:', error);
      Alert.alert('Error', 'Failed to load teams');
    }
  };

  const shareWithSpecificTeam = async (teamId: string, teamName: string, exerciseName: string, weight: number, reps: number, prType: string) => {
    try {
      // In a real implementation, you'd call TeamService.sharePR(teamId, prData)
      Alert.alert('Shared!', `Your ${prType} has been shared with ${teamName}!`);
    } catch (error) {
      console.error('Error sharing with team:', error);
      Alert.alert('Error', 'Failed to share PR with team');
    }
  };

  const shareWithAllTeams = async (teams: any[], exerciseName: string, weight: number, reps: number, prType: string) => {
    try {
      // In a real implementation, you'd loop through teams and call TeamService.sharePR for each
      const teamNames = teams.map(team => team.name).join(', ');
      Alert.alert('Shared!', `Your ${prType} has been shared with all your teams: ${teamNames}!`);
    } catch (error) {
      console.error('Error sharing with all teams:', error);
      Alert.alert('Error', 'Failed to share PR with teams');
    }
  };

  const notifyTeamMembersOfPR = async (exerciseName: string, weight: number, reps: number, prType: string) => {
    try {
      // For now, just show a success message
      // In a real implementation, you'd integrate with TeamService
      Alert.alert('Shared!', 'Your PR has been shared with your team!');
    } catch (error) {
      console.error('Error notifying team of PR:', error);
      Alert.alert('Error', 'Failed to share PR with team');
    }
  };

  // Workout execution functions
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

  const handleStartWorkout = (workout: CustomWorkout) => {
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

  const getInputKey = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight') => {
    return `${exerciseIndex}-${setIndex}-${field}`;
  };

  const getInputValue = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', defaultValue: number) => {
    const key = getInputKey(exerciseIndex, setIndex, field);
    if (inputValues[key] !== undefined) {
      return inputValues[key];
    }
    return '';
  };

  const setInputValue = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) => {
    const key = getInputKey(exerciseIndex, setIndex, field);
    setInputValues(prev => ({ ...prev, [key]: value }));
  };


  const toggleSetTimer = (exerciseIndex: number, setIndex: number) => {
    if (!workoutData) return;
    
    setWorkoutData((prev: any) => {
      if (!prev) return prev;
      
      const updatedWorkoutData = { ...prev };
      const exercise = updatedWorkoutData.exercises[exerciseIndex];
      if (!exercise || !exercise.sets || !exercise.sets[setIndex]) return prev;
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
        const currentWeight = inputValues[weightKey] !== undefined && inputValues[weightKey] !== '' 
          ? parseInt(inputValues[weightKey]) || 0 
          : set.actualWeight || 0;
        const currentReps = inputValues[repsKey] !== undefined && inputValues[repsKey] !== '' 
          ? parseInt(inputValues[repsKey]) || 0 
          : set.actualReps || 0;
        
        set.actualWeight = currentWeight;
        set.actualReps = currentReps;
        
        // Check for PRs if this is a completed set with actual values
        if (currentWeight > 0 && currentReps > 0) {
          checkForPRs(exercise.exercise.name, currentWeight, currentReps);
        }
        
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
        
        // Auto-progress to next set
        const nextSetIndex = setIndex + 1;
        if (nextSetIndex < exercise.sets.length) {
          // Move to next set in same exercise
          updatedWorkoutData.currentSetIndex = nextSetIndex;
        } else {
          // Move to first set of next exercise
          const nextExerciseIndex = exerciseIndex + 1;
          if (nextExerciseIndex < updatedWorkoutData.exercises.length) {
            updatedWorkoutData.currentExerciseIndex = nextExerciseIndex;
            updatedWorkoutData.currentSetIndex = 0;
          }
        }
        
        // Start rest timer
        updatedWorkoutData.restTimer = set.restTime || 90;
        startRestTimer();
      } else {
        // Start the set - stop rest timer and start set timer
        set.isActive = true;
        
        // Stop rest timer
        stopRestTimer();
        
        // Stop any other active sets
        updatedWorkoutData.exercises.forEach((ex: any, exIndex: number) => {
          ex.sets.forEach((s: any, sIndex: number) => {
            if (exIndex !== exerciseIndex || sIndex !== setIndex) {
              s.isActive = false;
            }
          });
        });
        
        // Reset rest timer
        updatedWorkoutData.restTimer = 0;
      }
      
      return updatedWorkoutData;
    });
  };

  const addSet = (exerciseIndex: number) => {
    if (!workoutData) return;
    
    setWorkoutData((prev: any) => {
      if (!prev) return prev;
      
      const updatedWorkoutData = { ...prev };
      const exercise = updatedWorkoutData.exercises[exerciseIndex];
      
      if (exercise && exercise.sets) {
        // Get the last set to use as template
        const lastSet = exercise.sets[exercise.sets.length - 1];
        const newSet = {
          reps: lastSet?.reps || 8,
          weight: lastSet?.weight || 0,
          restTime: lastSet?.restTime || 90,
          completed: false,
          actualReps: lastSet?.reps || 8,
          actualWeight: lastSet?.weight || 0,
          isActive: false
        };
        
        exercise.sets.push(newSet);
      }
      
      return updatedWorkoutData;
    });
  };

  const startRestTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setWorkoutData((prev: any) => {
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

  const endWorkout = async () => {
    if (!workoutData || !workoutStartTime) return;
    
    const endTime = new Date();
    const totalTime = Math.floor((endTime.getTime() - workoutStartTime.getTime()) / 1000);
    
    const finalWorkoutData = {
      ...workoutData,
      endTime,
      totalTime,
      timeSpentLifting: totalTime * 0.7 // Estimate 70% of time spent lifting
    };
    
    // Save workout log
    try {
      const today = new Date().toISOString().split('T')[0];
      await DataStorage.addWorkoutLog(today, {
        id: `workout_${Date.now()}`,
        name: activeWorkout?.name || 'Workout',
        date: new Date().toISOString(),
        duration: totalTime,
        totalTonnage: finalWorkoutData.totalTonnage || 0,
        exercises: finalWorkoutData.exercises || []
      });
      
      // Update user stats with day-based streak
      const currentStats = await DataStorage.getUserStats();
      const lastWorkoutDate = currentStats.lastWorkoutDate;
      
      let newStreak = currentStats.workoutStreak || 0;
      
      // Only increment streak if this is the first workout of the day
      if (lastWorkoutDate !== today) {
        // Check if this continues the streak (yesterday) or breaks it
        if (lastWorkoutDate) {
          const lastDate = new Date(lastWorkoutDate);
          const todayDate = new Date(today);
          const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            // Consecutive day - increment streak
            newStreak = newStreak + 1;
          } else if (daysDiff > 1) {
            // Gap in days - reset streak to 1
            newStreak = 1;
          }
          // If daysDiff === 0, it's the same day, don't change streak
        } else {
          // First workout ever
          newStreak = 1;
        }
      }
      
      const updatedStats = {
        ...currentStats,
        totalWorkouts: (currentStats.totalWorkouts || 0) + 1,
        totalTonnage: (currentStats.totalTonnage || 0) + (finalWorkoutData.totalTonnage || 0),
        workoutStreak: newStreak,
        lastWorkoutDate: today
      };
      
      await DataStorage.saveUserStats(updatedStats);
      
      // Refresh data on main page
      await loadUserData();
      await loadWeeklyTonnage();
      await loadDailyTonnage();
      await loadDailyMinutes();
      await loadDailyWorkouts();
      
    } catch (error) {
      console.error('Error saving workout:', error);
    }
    
    setWorkoutData(finalWorkoutData);
    setShowWorkoutSummary(true);
    setShowWorkoutModal(false);
    setIsTimerRunning(false);
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
      
      // Reload weekly tonnage, calendar data, and user stats
      await loadWeeklyTonnage();
      await loadDailyTonnage();
      await loadDailyMinutes();
      await loadDailyWorkouts();
      await loadCalendarData(new Date());
      await loadUserData();
      
      setShowWorkoutSummary(false);
      setShowEndWorkoutModal(false);
      setActiveWorkout(null);
      setWorkoutData(null);
      
      Alert.alert('Workout Saved!', 'Your workout has been saved successfully.');
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  const renderActiveWorkout = () => {
    if (!showWorkoutModal || !activeWorkout || !workoutData) return null;

    const currentExercise = workoutData.exercises[currentExerciseIndex];
    const currentSet = currentExercise?.sets?.[currentSetIndex];

    return (
      <Modal visible={showWorkoutModal} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.workoutExecutionContainer}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.workoutHeader}>
              <TouchableOpacity 
                style={styles.workoutBackButton}
                onPress={() => setShowEndWorkoutModal(true)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.workoutHeaderContent}>
                <Text style={styles.workoutHeaderTitle}>{activeWorkout.name}</Text>
                <Text style={styles.workoutHeaderTimer}>{formatTime(workoutTimer)}</Text>
              </View>
              <TouchableOpacity 
                style={styles.workoutEndButton}
                onPress={() => setShowEndWorkoutModal(true)}
              >
                <Text style={styles.workoutEndButtonText}>End</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.workoutScrollView} 
              contentContainerStyle={styles.workoutScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Exercise Progress */}
              <View style={styles.exerciseProgress}>
              <Text style={styles.exerciseProgressText}>
                Exercise {currentExerciseIndex + 1} of {workoutData?.exercises?.length || 0}
              </Text>
              <View style={styles.exerciseProgressBar}>
                <View 
                  style={[
                    styles.exerciseProgressFill, 
                    { width: `${((currentExerciseIndex + 1) / (workoutData?.exercises?.length || 1)) * 100}%` }
                  ]} 
                />
              </View>
            </View>

            {/* Current Exercise Card */}
            <View style={styles.currentExerciseCard}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                style={styles.currentExerciseGradient}
              >
                <Text style={styles.currentExerciseName}>{currentExercise?.exercise?.name}</Text>
                <Text style={styles.currentExerciseCategory}>{currentExercise?.exercise?.category}</Text>
                <Text style={styles.currentExerciseMuscle}>{currentExercise?.exercise?.muscle}</Text>
              </LinearGradient>
            </View>

            {/* Set Progress */}
            <View style={styles.setProgress}>
              <Text style={styles.setProgressText}>
                Set {currentSetIndex + 1} of {currentExercise?.sets?.length || 0}
              </Text>
              <View style={styles.setProgressBar}>
                <View 
                  style={[
                    styles.setProgressFill, 
                    { width: `${((currentSetIndex + 1) / (currentExercise?.sets?.length || 1)) * 100}%` }
                  ]} 
                />
              </View>
            </View>

            {/* Set Input Card */}
            <View style={styles.setInputCard}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.08)', 'rgba(0, 0, 0, 0.4)']}
                style={styles.setInputGradient}
              >
                <View style={styles.setInputRow}>
                  <View style={styles.setInputField}>
                    <Text style={styles.setInputLabel}>Weight (lbs)</Text>
                    <TextInput
                      style={styles.setInput}
                      value={getInputValue(currentExerciseIndex, currentSetIndex, 'weight', 0)}
                      onChangeText={(value) => setInputValue(currentExerciseIndex, currentSetIndex, 'weight', value)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <View style={styles.setInputField}>
                    <Text style={styles.setInputLabel}>Reps</Text>
                    <TextInput
                      style={styles.setInput}
                      value={getInputValue(currentExerciseIndex, currentSetIndex, 'reps', 0)}
                      onChangeText={(value) => setInputValue(currentExerciseIndex, currentSetIndex, 'reps', value)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Rest Timer */}
            {workoutData.restTimer > 0 && (
              <View style={styles.restTimerCard}>
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                  style={styles.restTimerGradient}
                >
                  <Text style={styles.restTimerText}>Rest Time</Text>
                  <Text style={styles.restTimerValue}>{formatTime(workoutData.restTimer)}</Text>
                </LinearGradient>
              </View>
            )}

            {/* Set Actions */}
            <View style={styles.setActions}>
              <View style={styles.setActionButtons}>
                <TouchableOpacity 
                  style={[
                    styles.setActionButton,
                    currentSet?.isActive ? styles.setActionButtonActive : styles.setActionButtonInactive
                  ]}
                  onPress={() => toggleSetTimer(currentExerciseIndex, currentSetIndex)}
                >
                  <Ionicons 
                    name={currentSet?.isActive ? "pause" : "play"} 
                    size={24} 
                    color={currentSet?.isActive ? "#FFFFFF" : "#10B981"} 
                  />
                  <Text style={[
                    styles.setActionButtonText,
                    currentSet?.isActive ? styles.setActionButtonTextActive : styles.setActionButtonTextInactive
                  ]}>
                    {currentSet?.isActive ? "Stop Set" : "Start Set"}
                  </Text>
                </TouchableOpacity>

              </View>
              
              {/* Add Set Button */}
              <TouchableOpacity 
                style={styles.addSetButton}
                onPress={() => addSet(currentExerciseIndex)}
              >
                <Ionicons name="add" size={20} color="#10B981" />
                <Text style={styles.addSetButtonText}>Add Set</Text>
              </TouchableOpacity>
            </View>

            {/* Navigation */}
            <View style={styles.workoutNavigation}>
              <TouchableOpacity 
                style={[styles.navButton, currentExerciseIndex === 0 && styles.navButtonDisabled]}
                onPress={() => {
                  if (currentExerciseIndex > 0) {
                    setCurrentExerciseIndex(currentExerciseIndex - 1);
                    setCurrentSetIndex(0);
                  }
                }}
                disabled={currentExerciseIndex === 0}
              >
                <Ionicons name="chevron-back" size={20} color={currentExerciseIndex === 0 ? "#666" : "#10B981"} />
                <Text style={[styles.navButtonText, currentExerciseIndex === 0 && styles.navButtonTextDisabled]}>
                  Previous
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.navButton, currentExerciseIndex === (workoutData?.exercises?.length || 1) - 1 && styles.navButtonDisabled]}
                onPress={() => {
                  if (currentExerciseIndex < (workoutData?.exercises?.length || 1) - 1) {
                    setCurrentExerciseIndex(currentExerciseIndex + 1);
                    setCurrentSetIndex(0);
                  }
                }}
                disabled={currentExerciseIndex === (workoutData?.exercises?.length || 1) - 1}
              >
                <Text style={[styles.navButtonText, currentExerciseIndex === (workoutData?.exercises?.length || 1) - 1 && styles.navButtonTextDisabled]}>
                  Next
                </Text>
                <Ionicons name="chevron-forward" size={20} color={currentExerciseIndex === (workoutData?.exercises?.length || 1) - 1 ? "#666" : "#10B981"} />
              </TouchableOpacity>
            </View>

            {/* Workout Stats */}
            <View style={styles.workoutStats}>
              <View style={styles.workoutStatItem}>
                <Text style={styles.workoutStatLabel}>Total Tonnage</Text>
                <Text style={styles.workoutStatValue}>{workoutData.totalTonnage.toLocaleString()} lbs</Text>
              </View>
              <View style={styles.workoutStatItem}>
                <Text style={styles.workoutStatLabel}>Time</Text>
                <Text style={styles.workoutStatValue}>{formatTime(workoutTimer)}</Text>
              </View>
            </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    );
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Advanced Training</Text>
            <Text style={styles.headerSubtitle}>Track your fitness journey</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={async () => {
                await loadRecentPRs();
                setShowPRNotifications(true);
              }}
              style={styles.prButton}
            >
              <Ionicons name="trophy-outline" size={20} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowWorkoutCalendar(true)}
              style={styles.calendarButton}
            >
              <Ionicons name="calendar-outline" size={20} color="#10B981" />
            </TouchableOpacity>
          </View>
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
                  <Text style={styles.heroStatValue}>{dailyWorkouts}</Text>
                  <Text style={styles.heroStatLabel}>Workouts</Text>
                </View>
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Ionicons name="time" size={24} color="#10B981" />
                  </View>
                  <Text style={styles.heroStatValue}>
                    {workoutData ? Math.floor(workoutData.totalTime / 60) : dailyMinutes}
                  </Text>
                  <Text style={styles.heroStatLabel}>Minutes</Text>
                </View>
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}>
                    <Ionicons name="barbell" size={24} color="#10B981" />
                  </View>
                  <Text style={styles.heroStatValue}>
                    {dailyTonnage.toLocaleString()}
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
            
            <TouchableOpacity style={styles.actionCard} onPress={() => setShowAIGenerator(true)}>
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
              (customWorkouts || []).slice(0, 4).map((workout) => (
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
              {(exerciseVideos || []).slice(0, 10).map((exercise: any) => (
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
        <CustomWorkoutBuilder
          visible={showCustomBuilder}
          onClose={() => {
            setShowCustomBuilder(false);
            setEditingWorkout(null);
          }}
          onWorkoutCreated={async () => {
            // The CustomWorkoutBuilder doesn't pass the workout back
            // We'll need to reload the custom workouts instead
            await loadCustomWorkouts();
          }}
          editingWorkout={editingWorkout}
          onWorkoutUpdated={handleWorkoutUpdated}
        />

        {/* AI Workout Generator Modal */}
        <AIWorkoutGenerator
          visible={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
          onSaveWorkout={(workout: any) => {
            setCustomWorkouts(prev => [...prev, workout]);
            setShowAIGenerator(false);
          }}
        />

        {/* Workout Execution Modal */}
        {renderActiveWorkout()}

        {/* Workout Library Modal */}
        <Modal visible={showWorkoutLibrary} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.libraryModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.libraryHeader}>
                <TouchableOpacity 
                  style={styles.libraryBackButton}
                  onPress={() => setShowWorkoutLibrary(false)}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.libraryTitle}>Workout Library</Text>
                <View style={styles.libraryHeaderSpacer} />
              </View>
              
              <ScrollView style={styles.libraryContent}>
                {/* Strength Training */}
                <View style={styles.librarySection}>
                  <Text style={styles.librarySectionTitle}>Strength Training</Text>
                  {premadeWorkouts?.strength?.map((workout: any) => (
                    <TouchableOpacity
                      key={workout.id}
                      style={styles.libraryWorkoutCard}
                      onPress={() => {
                        setSelectedLibraryWorkout(workout);
                        setShowLibraryWorkoutPreview(true);
                      }}
                    >
                      <LinearGradient
                        colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                        style={styles.libraryWorkoutGradient}
                      >
                        <View style={styles.libraryWorkoutHeader}>
                          <Text style={styles.libraryWorkoutName}>{workout.name}</Text>
                          <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={() => toggleFavorite(workout.id)}
                          >
                            <Ionicons 
                              name={favoritedWorkouts.has(workout.id) ? "star" : "star-outline"} 
                              size={20} 
                              color={favoritedWorkouts.has(workout.id) ? "#10B981" : "#94A3B8"} 
                            />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.libraryWorkoutDescription}>{workout.description}</Text>
                        <View style={styles.libraryWorkoutStats}>
                          <View style={styles.libraryWorkoutStat}>
                            <Ionicons name="time" size={16} color="#10B981" />
                            <Text style={styles.libraryWorkoutStatText}>{workout.duration} min</Text>
                          </View>
                          <View style={styles.libraryWorkoutStat}>
                            <Ionicons name="fitness" size={16} color="#10B981" />
                            <Text style={styles.libraryWorkoutStatText}>{workout.difficulty}</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Powerlifting */}
                <View style={styles.librarySection}>
                  <Text style={styles.librarySectionTitle}>Powerlifting</Text>
                  {premadeWorkouts?.powerlifting?.map((workout: any) => (
                    <TouchableOpacity
                      key={workout.id}
                      style={styles.libraryWorkoutCard}
                      onPress={() => {
                        setSelectedLibraryWorkout(workout);
                        setShowLibraryWorkoutPreview(true);
                      }}
                    >
                      <LinearGradient
                        colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                        style={styles.libraryWorkoutGradient}
                      >
                        <View style={styles.libraryWorkoutHeader}>
                          <Text style={styles.libraryWorkoutName}>{workout.name}</Text>
                          <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={() => toggleFavorite(workout.id)}
                          >
                            <Ionicons 
                              name={favoritedWorkouts.has(workout.id) ? "star" : "star-outline"} 
                              size={20} 
                              color={favoritedWorkouts.has(workout.id) ? "#10B981" : "#94A3B8"} 
                            />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.libraryWorkoutDescription}>{workout.description}</Text>
                        <View style={styles.libraryWorkoutStats}>
                          <View style={styles.libraryWorkoutStat}>
                            <Ionicons name="time" size={16} color="#10B981" />
                            <Text style={styles.libraryWorkoutStatText}>{workout.duration} min</Text>
                          </View>
                          <View style={styles.libraryWorkoutStat}>
                            <Ionicons name="fitness" size={16} color="#10B981" />
                            <Text style={styles.libraryWorkoutStatText}>{workout.difficulty}</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* CrossFit */}
                <View style={styles.librarySection}>
                  <Text style={styles.librarySectionTitle}>CrossFit</Text>
                  {premadeWorkouts?.crossfit?.map((workout: any) => (
                    <TouchableOpacity
                      key={workout.id}
                      style={styles.libraryWorkoutCard}
                      onPress={() => {
                        setSelectedLibraryWorkout(workout);
                        setShowLibraryWorkoutPreview(true);
                      }}
                    >
                      <LinearGradient
                        colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                        style={styles.libraryWorkoutGradient}
                      >
                        <View style={styles.libraryWorkoutHeader}>
                          <Text style={styles.libraryWorkoutName}>{workout.name}</Text>
                          <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={() => toggleFavorite(workout.id)}
                          >
                            <Ionicons 
                              name={favoritedWorkouts.has(workout.id) ? "star" : "star-outline"} 
                              size={20} 
                              color={favoritedWorkouts.has(workout.id) ? "#10B981" : "#94A3B8"} 
                            />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.libraryWorkoutDescription}>{workout.description}</Text>
                        <View style={styles.libraryWorkoutStats}>
                          <View style={styles.libraryWorkoutStat}>
                            <Ionicons name="time" size={16} color="#10B981" />
                            <Text style={styles.libraryWorkoutStatText}>{workout.duration} min</Text>
                          </View>
                          <View style={styles.libraryWorkoutStat}>
                            <Ionicons name="fitness" size={16} color="#10B981" />
                            <Text style={styles.libraryWorkoutStatText}>{workout.difficulty}</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Yoga */}
                <View style={styles.librarySection}>
                  <Text style={styles.librarySectionTitle}>Yoga</Text>
                  {premadeWorkouts?.yoga?.map((workout: any) => (
                    <TouchableOpacity
                      key={workout.id}
                      style={styles.libraryWorkoutCard}
                      onPress={() => handlePlayVideo(workout)}
                    >
                      <LinearGradient
                        colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                        style={styles.libraryWorkoutGradient}
                      >
                        <View style={styles.libraryWorkoutHeader}>
                          <Text style={styles.libraryWorkoutName}>{workout.name}</Text>
                          <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={() => toggleFavorite(workout.id)}
                          >
                            <Ionicons 
                              name={favoritedWorkouts.has(workout.id) ? "star" : "star-outline"} 
                              size={20} 
                              color={favoritedWorkouts.has(workout.id) ? "#10B981" : "#94A3B8"} 
                            />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.libraryWorkoutDescription}>{workout.description}</Text>
                        <View style={styles.libraryWorkoutStats}>
                          <View style={styles.libraryWorkoutStat}>
                            <Ionicons name="time" size={16} color="#10B981" />
                            <Text style={styles.libraryWorkoutStatText}>{workout.duration} min</Text>
                          </View>
                          <View style={styles.libraryWorkoutStat}>
                            <Ionicons name="play" size={16} color="#10B981" />
                            <Text style={styles.libraryWorkoutStatText}>Video</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Stretching */}
                <View style={styles.librarySection}>
                  <Text style={styles.librarySectionTitle}>Stretching</Text>
                  {premadeWorkouts?.stretching?.map((workout: any) => (
                    <TouchableOpacity
                      key={workout.id}
                      style={styles.libraryWorkoutCard}
                      onPress={() => handlePlayVideo(workout)}
                    >
                      <LinearGradient
                        colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                        style={styles.libraryWorkoutGradient}
                      >
                        <View style={styles.libraryWorkoutHeader}>
                          <Text style={styles.libraryWorkoutName}>{workout.name}</Text>
                          <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={() => toggleFavorite(workout.id)}
                          >
                            <Ionicons 
                              name={favoritedWorkouts.has(workout.id) ? "star" : "star-outline"} 
                              size={20} 
                              color={favoritedWorkouts.has(workout.id) ? "#10B981" : "#94A3B8"} 
                            />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.libraryWorkoutDescription}>{workout.description}</Text>
                        <View style={styles.libraryWorkoutStats}>
                          <View style={styles.libraryWorkoutStat}>
                            <Ionicons name="time" size={16} color="#10B981" />
                            <Text style={styles.libraryWorkoutStatText}>{workout.duration} min</Text>
                          </View>
                          <View style={styles.libraryWorkoutStat}>
                            <Ionicons name="play" size={16} color="#10B981" />
                            <Text style={styles.libraryWorkoutStatText}>Video</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>

        {/* Exercise Library Modal */}
        <Modal visible={showExerciseLibrary} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.libraryModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.libraryHeader}>
                <TouchableOpacity 
                  style={styles.libraryBackButton}
                  onPress={() => setShowExerciseLibrary(false)}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.libraryTitle}>Exercise Library</Text>
                <TouchableOpacity 
                  style={styles.librarySearchButton}
                  onPress={() => setShowSearchBar(!showSearchBar)}
                >
                  <Ionicons name="search" size={20} color="#10B981" />
                </TouchableOpacity>
              </View>

              {showSearchBar && (
                <View style={styles.searchBarContainer}>
                  <TextInput
                    style={styles.searchBar}
                    placeholder="Search exercises..."
                    placeholderTextColor="#94A3B8"
                    value={exerciseSearchQuery}
                    onChangeText={setExerciseSearchQuery}
                  />
                </View>
              )}

              <ScrollView style={styles.libraryContent}>
                <View style={styles.exerciseGrid}>
                  {(exerciseVideos || [])
                    .filter((exercise: any) => 
                      exerciseSearchQuery === '' ||
                      exercise.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
                      exercise.category.toLowerCase().includes(exerciseSearchQuery.toLowerCase())
                    )
                    .map((exercise: any) => (
                    <TouchableOpacity
                      key={exercise.id}
                      style={styles.exerciseLibraryCard}
                      onPress={() => handleVideoCardPress(exercise)}
                    >
                      <LinearGradient
                        colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                        style={styles.exerciseLibraryGradient}
                      >
                        <View style={styles.exerciseLibraryThumbnail}>
                          <Ionicons name="play" size={24} color="#10B981" />
                        </View>
                        <Text style={styles.exerciseLibraryTitle}>{exercise.name}</Text>
                        <Text style={styles.exerciseLibraryCategory}>{exercise.category}</Text>
                        <View style={styles.exerciseLibraryDifficulty}>
                          <Text style={styles.exerciseLibraryDifficultyText}>{exercise.difficulty}</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>

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
                  onPress={() => {
                    setShowWorkoutStartModal(false);
                    handleStartWorkout(activeWorkout!);
                  }}
                >
                  <Text style={styles.startButtonText}>Start Workout</Text>
                </TouchableOpacity>
              </View>
            </View>
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
                  onPress={() => setShowEndWorkoutModal(false)}
                >
                  <Text style={styles.endWorkoutActionText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.endWorkoutActionButton, styles.deleteButton]}
                  onPress={() => {
                    setShowEndWorkoutModal(false);
                    setShowWorkoutModal(false);
                    setActiveWorkout(null);
                    setWorkoutData(null);
                    Alert.alert('Workout Cancelled', 'Workout has been cancelled and not saved.');
                  }}
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

        {/* Workout Calendar Modal */}
        <Modal visible={showWorkoutCalendar} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.calendarModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity 
                  style={styles.calendarBackButton}
                  onPress={() => setShowWorkoutCalendar(false)}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.calendarTitle}>Workout Calendar</Text>
                <TouchableOpacity 
                  style={styles.monthlyViewButton}
                  onPress={() => setShowMonthlyView(true)}
                >
                  <Text style={styles.monthlyViewButtonText}>Monthly View</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.calendarContent}>
                <View style={styles.calendarStats}>
                  <View style={styles.calendarStatItem}>
                    <Text style={styles.calendarStatValue}>{calendarTonnage.toLocaleString()}</Text>
                    <Text style={styles.calendarStatLabel}>Total Tonnage</Text>
                  </View>
                  <View style={styles.calendarStatItem}>
                    <Text style={styles.calendarStatValue}>{calendarWorkoutCount}</Text>
                    <Text style={styles.calendarStatLabel}>Workouts</Text>
                  </View>
                  <View style={styles.calendarStatItem}>
                    <Text style={styles.calendarStatValue}>{Math.floor(calendarDuration / 60)}</Text>
                    <Text style={styles.calendarStatLabel}>Minutes</Text>
                  </View>
                </View>

                <View style={styles.calendarWorkouts}>
                  <Text style={styles.calendarWorkoutsTitle}>Today's Workouts</Text>
                  {calendarWorkouts.length > 0 ? (
                    calendarWorkouts.map((workout, index) => (
                      <View key={`calendar-${workout.name}-${index}`} style={styles.calendarWorkoutCard}>
                        <LinearGradient
                          colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                          style={styles.calendarWorkoutGradient}
                        >
                          <Text style={styles.calendarWorkoutName}>{workout.name}</Text>
                          <Text style={styles.calendarWorkoutDescription}>{workout.description}</Text>
                          <View style={styles.calendarWorkoutStats}>
                            <View style={styles.calendarWorkoutStat}>
                              <Ionicons name="time" size={16} color="#10B981" />
                              <Text style={styles.calendarWorkoutStatText}>{workout.duration} min</Text>
                            </View>
                            <View style={styles.calendarWorkoutStat}>
                              <Ionicons name="barbell" size={16} color="#10B981" />
                              <Text style={styles.calendarWorkoutStatText}>{workout.tonnage.toLocaleString()} lbs</Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </View>
                    ))
                  ) : (
                    <View style={styles.calendarEmptyState}>
                      <Ionicons name="fitness-outline" size={48} color="#94A3B8" />
                      <Text style={styles.calendarEmptyText}>No workouts today</Text>
                      <Text style={styles.calendarEmptyDescription}>
                        Start a workout to see it here
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </SafeAreaView>
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
                      {Object.entries(workoutData.tonnagePerMuscleGroup).map(([muscle, tonnage]: [string, any]) => (
                        <View key={muscle} style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>{muscle}</Text>
                          <Text style={styles.summaryValue}>{tonnage.toLocaleString()} lbs</Text>
                        </View>
                      ))}
                    </View>

                    {/* Exercise Breakdown */}
                    <View style={styles.summarySection}>
                      <Text style={styles.summarySectionTitle}>Exercise Breakdown</Text>
                      {(workoutData.exercises || []).map((exercise: any, index: number) => (
                        <View key={`exercise-${exercise.exercise?.id || index}`} style={styles.exerciseSummary}>
                          <Text style={styles.exerciseSummaryName}>{exercise.exercise.name}</Text>
                          <Text style={styles.exerciseSummarySets}>
                            {exercise.sets.filter((s: any) => s.completed).length} / {exercise.sets.length} sets completed
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

        {/* Workout Preview Modal */}
        <Modal visible={showWorkoutPreview} animationType="slide" presentationStyle="fullScreen">
          <LinearGradient
            colors={['#0F172A', '#1E293B']}
            style={styles.workoutPreviewModal}
          >
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.workoutPreviewHeader}>
                <TouchableOpacity 
                  style={styles.workoutPreviewBackButton}
                  onPress={() => setShowWorkoutPreview(false)}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.workoutPreviewTitle}>{activeWorkout?.name}</Text>
                <View style={styles.workoutPreviewHeaderSpacer} />
              </View>
              
              <ScrollView style={styles.workoutPreviewContent} showsVerticalScrollIndicator={false}>
                <View style={styles.workoutPreviewHero}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                    style={styles.workoutPreviewHeroGradient}
                  >
                    <Text style={styles.workoutPreviewHeroTitle}>{activeWorkout?.name}</Text>
                    <Text style={styles.workoutPreviewHeroDescription}>
                      {activeWorkout?.description || 'Ready to start your workout'}
                    </Text>
                  </LinearGradient>
                </View>

                <View style={styles.workoutPreviewStats}>
                  <View style={styles.workoutPreviewStatCard}>
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.2)']}
                      style={styles.workoutPreviewStatGradient}
                    >
                      <Ionicons name="barbell-outline" size={24} color="#10B981" />
                      <Text style={styles.workoutPreviewStatValue}>{activeWorkout?.exercises?.length || 0}</Text>
                      <Text style={styles.workoutPreviewStatLabel}>Exercises</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.workoutPreviewStatCard}>
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.2)']}
                      style={styles.workoutPreviewStatGradient}
                    >
                      <Ionicons name="list-outline" size={24} color="#10B981" />
                      <Text style={styles.workoutPreviewStatValue}>
                        {activeWorkout?.exercises?.reduce((total: number, ex: any) => total + (ex.sets?.length || 0), 0) || 0}
                      </Text>
                      <Text style={styles.workoutPreviewStatLabel}>Sets</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.workoutPreviewStatCard}>
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.2)']}
                      style={styles.workoutPreviewStatGradient}
                    >
                      <Ionicons name="time-outline" size={24} color="#10B981" />
                      <Text style={styles.workoutPreviewStatValue}>45</Text>
                      <Text style={styles.workoutPreviewStatLabel}>Minutes</Text>
                    </LinearGradient>
                  </View>
                </View>

                <View style={styles.exerciseList}>
                  <Text style={styles.exerciseListTitle}>Exercise Breakdown</Text>
                  {activeWorkout?.exercises?.map((exercise: any, index: number) => {
                    console.log('Exercise data:', exercise);
                    return (
                    <View key={`preview-${activeWorkout?.id || 'workout'}-${exercise.exercise?.id || exercise.id || `exercise-${index}`}`} style={styles.exercisePreviewCard}>
                      <LinearGradient
                        colors={['rgba(16, 185, 129, 0.05)', 'rgba(0, 0, 0, 0.3)']}
                        style={styles.exercisePreviewCardGradient}
                      >
                        <View style={styles.exercisePreviewCardHeader}>
                          <View style={styles.exercisePreviewCardInfo}>
                            <Text style={styles.exercisePreviewCardName}>{exercise.exercise?.name || exercise.name}</Text>
                            <Text style={styles.exercisePreviewCardCategory}>{exercise.exercise?.category || exercise.category}</Text>
                          </View>
                          <View style={styles.exercisePreviewCardSets}>
                            <Text style={styles.exercisePreviewCardSetsText}>
                              {exercise.sets?.length || 0} sets
                            </Text>
                          </View>
                        </View>
                        <View style={styles.exercisePreviewCardDetails}>
                          {(() => {
                            try {
                              if (Array.isArray(exercise.sets) && exercise.sets.length > 0) {
                                return exercise.sets.map((set: any, setIndex: number) => (
                                  <View key={`set-${activeWorkout?.id || 'workout'}-${exercise.exercise?.id || exercise.id || index}-${setIndex}`} style={styles.setPreviewItem}>
                                    <Text style={styles.setPreviewText}>
                                      Set {setIndex + 1}: {set.reps || 0} reps @ {set.weight || 0}lbs
                                    </Text>
                                  </View>
                                ));
                              } else {
                                return <Text style={styles.noSetsText}>No sets defined</Text>;
                              }
                            } catch (error) {
                              console.error('Error rendering sets:', error);
                              return <Text style={styles.noSetsText}>Error loading sets</Text>;
                            }
                          })()}
                        </View>
                      </LinearGradient>
                    </View>
                    );
                  }) || (
                    <View style={styles.noExercisesContainer}>
                      <Ionicons name="barbell-outline" size={48} color="#94A3B8" />
                      <Text style={styles.noExercisesText}>No exercises found</Text>
                    </View>
                  )}
                </View>

                <View style={styles.workoutPreviewActions}>
                  <View style={styles.workoutPreviewActionButtons}>
                    <TouchableOpacity 
                      style={styles.editWorkoutButton}
                      onPress={() => {
                        if (activeWorkout) {
                          handleEditWorkout(activeWorkout);
                        }
                      }}
                    >
                      <LinearGradient
                        colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                        style={styles.editWorkoutButtonGradient}
                      >
                        <Ionicons name="create-outline" size={20} color="#10B981" />
                        <Text style={styles.editWorkoutButtonText}>Edit Workout</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.startWorkoutButton}
                      onPress={() => {
                        setShowWorkoutPreview(false);
                        setShowWorkoutStartModal(true);
                      }}
                    >
                      <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.startWorkoutButtonGradient}
                      >
                        <Ionicons name="play" size={20} color="#FFFFFF" />
                        <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>

        {/* Library Workout Preview Modal */}
        <Modal visible={showLibraryWorkoutPreview} animationType="slide" presentationStyle="fullScreen">
          <LinearGradient
            colors={['#0F172A', '#1E293B']}
            style={styles.workoutPreviewModal}
          >
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.workoutPreviewHeader}>
                <TouchableOpacity 
                  style={styles.workoutPreviewBackButton}
                  onPress={() => setShowLibraryWorkoutPreview(false)}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.workoutPreviewTitle}>{selectedLibraryWorkout?.name}</Text>
                <View style={styles.workoutPreviewHeaderSpacer} />
              </View>
              
              <ScrollView style={styles.workoutPreviewContent} showsVerticalScrollIndicator={false}>
                <View style={styles.workoutPreviewHero}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                    style={styles.workoutPreviewHeroGradient}
                  >
                    <Text style={styles.workoutPreviewHeroTitle}>{selectedLibraryWorkout?.name}</Text>
                    <Text style={styles.workoutPreviewHeroDescription}>
                      {selectedLibraryWorkout?.description || 'Ready to start your workout'}
                    </Text>
                  </LinearGradient>
                </View>

                <View style={styles.workoutPreviewStats}>
                  <View style={styles.workoutPreviewStatCard}>
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.2)']}
                      style={styles.workoutPreviewStatGradient}
                    >
                      <Ionicons name="barbell-outline" size={24} color="#10B981" />
                      <Text style={styles.workoutPreviewStatValue}>{selectedLibraryWorkout?.exercises?.length || 0}</Text>
                      <Text style={styles.workoutPreviewStatLabel}>Exercises</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.workoutPreviewStatCard}>
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.2)']}
                      style={styles.workoutPreviewStatGradient}
                    >
                      <Ionicons name="list-outline" size={24} color="#10B981" />
                      <Text style={styles.workoutPreviewStatValue}>
                        {selectedLibraryWorkout?.exercises?.reduce((total: number, ex: any) => total + (ex.sets?.length || 0), 0) || 0}
                      </Text>
                      <Text style={styles.workoutPreviewStatLabel}>Sets</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.workoutPreviewStatCard}>
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.2)']}
                      style={styles.workoutPreviewStatGradient}
                    >
                      <Ionicons name="time-outline" size={24} color="#10B981" />
                      <Text style={styles.workoutPreviewStatValue}>{selectedLibraryWorkout?.duration || 45}</Text>
                      <Text style={styles.workoutPreviewStatLabel}>Minutes</Text>
                    </LinearGradient>
                  </View>
                </View>

                <View style={styles.exerciseList}>
                  <Text style={styles.exerciseListTitle}>Exercise Breakdown</Text>
                  {selectedLibraryWorkout?.exercises?.map((exercise: any, index: number) => (
                    <View key={`library-preview-${exercise.id || index}`} style={styles.exercisePreviewCard}>
                      <LinearGradient
                        colors={['rgba(16, 185, 129, 0.05)', 'rgba(0, 0, 0, 0.3)']}
                        style={styles.exercisePreviewCardGradient}
                      >
                        <View style={styles.exercisePreviewCardHeader}>
                          <View style={styles.exercisePreviewCardInfo}>
                            <Text style={styles.exercisePreviewCardName}>{exercise.name}</Text>
                            <Text style={styles.exercisePreviewCardCategory}>{exercise.category}</Text>
                          </View>
                          <View style={styles.exercisePreviewCardSets}>
                            <Text style={styles.exercisePreviewCardSetsText}>
                              {exercise.sets?.length || 0} sets
                            </Text>
                          </View>
                        </View>
                        <View style={styles.exercisePreviewCardDetails}>
                          {exercise.sets?.map((set: any, setIndex: number) => (
                            <View key={`library-set-${exercise.id}-${setIndex}`} style={styles.setPreviewItem}>
                              <Text style={styles.setPreviewText}>
                                Set {setIndex + 1}: {set.reps || 0} reps @ {set.weight || 0}lbs
                              </Text>
                            </View>
                          ))}
                        </View>
                      </LinearGradient>
                    </View>
                  ))}
                </View>

                <View style={styles.workoutPreviewActions}>
                  <TouchableOpacity 
                    style={styles.editWorkoutButton}
                    onPress={() => {
                      // Convert library workout to custom workout format
                      const customWorkout: CustomWorkout = {
                        id: selectedLibraryWorkout.id,
                        name: selectedLibraryWorkout.name,
                        description: selectedLibraryWorkout.description,
                        exercises: selectedLibraryWorkout.exercises,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      };
                      setEditingWorkout(customWorkout);
                      setShowLibraryWorkoutPreview(false);
                      setShowCustomBuilder(true);
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color="#10B981" />
                    <Text style={styles.editWorkoutButtonText}>Edit Workout</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.startWorkoutButton}
                    onPress={() => {
                      // Convert library workout to active workout format
                      const activeWorkoutData = {
                        id: selectedLibraryWorkout.id,
                        name: selectedLibraryWorkout.name,
                        description: selectedLibraryWorkout.description,
                        exercises: selectedLibraryWorkout.exercises.map((ex: any) => ({
                          exercise: ex,
                          sets: ex.sets || []
                        })),
                        totalTonnage: 0,
                        tonnagePerMuscleGroup: {}
                      };
                      setActiveWorkout(activeWorkoutData);
                      setShowLibraryWorkoutPreview(false);
                      setShowWorkoutStartModal(true);
                    }}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.startWorkoutButtonGradient}
                    >
                      <Ionicons name="play" size={20} color="#FFFFFF" />
                      <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>

        {/* View All My Workouts Modal */}
        <Modal visible={showViewAllWorkouts} animationType="slide" presentationStyle="fullScreen">
          <LinearGradient
            colors={['#0F172A', '#1E293B']}
            style={styles.viewAllWorkoutsModal}
          >
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.viewAllWorkoutsHeader}>
                <TouchableOpacity 
                  style={styles.viewAllWorkoutsBackButton}
                  onPress={() => setShowViewAllWorkouts(false)}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.viewAllWorkoutsTitle}>My Workouts</Text>
                <View style={styles.viewAllWorkoutsHeaderSpacer} />
              </View>
              
              <ScrollView style={styles.viewAllWorkoutsContent} showsVerticalScrollIndicator={false}>
                {customWorkouts && customWorkouts.length > 0 ? (
                  <View style={styles.workoutsGrid}>
                    {customWorkouts.map((workout) => (
                      <TouchableOpacity
                        key={workout.id}
                        style={styles.viewAllWorkoutCard}
                        onPress={() => {
                          setActiveWorkout(workout);
                          setShowViewAllWorkouts(false);
                          setShowWorkoutPreview(true);
                        }}
                      >
                        <LinearGradient
                          colors={['rgba(16, 185, 129, 0.08)', 'rgba(0, 0, 0, 0.4)']}
                          style={styles.viewAllWorkoutCardGradient}
                        >
                          <View style={styles.viewAllWorkoutCardHeader}>
                            <Text style={styles.viewAllWorkoutCardName}>{workout.name}</Text>
                            <TouchableOpacity
                              style={styles.viewAllWorkoutCardDelete}
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
                                        setCustomWorkouts(prev => prev.filter(w => w.id !== workout.id));
                                        DataStorage.saveCustomWorkouts(customWorkouts.filter(w => w.id !== workout.id));
                                      }
                                    }
                                  ]
                                );
                              }}
                            >
                              <Ionicons name="trash-outline" size={16} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.viewAllWorkoutCardDescription}>
                            {workout.description || 'No description available'}
                          </Text>
                          <View style={styles.viewAllWorkoutCardStats}>
                            <View style={styles.viewAllWorkoutCardStat}>
                              <Ionicons name="barbell-outline" size={14} color="#10B981" />
                              <Text style={styles.viewAllWorkoutCardStatText}>
                                {workout.exercises?.length || 0} exercises
                              </Text>
                            </View>
                            <View style={styles.viewAllWorkoutCardStat}>
                              <Ionicons name="list-outline" size={14} color="#10B981" />
                              <Text style={styles.viewAllWorkoutCardStatText}>
                                {workout.exercises?.reduce((total: number, ex: any) => total + (ex.sets?.length || 0), 0) || 0} sets
                              </Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.viewAllWorkoutsEmpty}>
                    <Ionicons name="barbell-outline" size={64} color="#94A3B8" />
                    <Text style={styles.viewAllWorkoutsEmptyTitle}>No Workouts Yet</Text>
                    <Text style={styles.viewAllWorkoutsEmptyDescription}>
                      Create your first custom workout to get started!
                    </Text>
                    <TouchableOpacity
                      style={styles.viewAllWorkoutsCreateButton}
                      onPress={() => {
                        setShowViewAllWorkouts(false);
                        setShowCustomBuilder(true);
                      }}
                    >
                      <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.viewAllWorkoutsCreateButtonGradient}
                      >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                        <Text style={styles.viewAllWorkoutsCreateButtonText}>Create Workout</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>

        {/* Monthly Calendar View Modal */}
        <Modal visible={showMonthlyView} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.monthlyCalendarModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.monthlyCalendarHeader}>
                <TouchableOpacity 
                  style={styles.monthlyCalendarBackButton}
                  onPress={() => setShowMonthlyView(false)}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.monthlyCalendarTitle}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <View style={styles.monthlyCalendarNavigation}>
                  <TouchableOpacity 
                    style={styles.monthNavButton}
                    onPress={() => navigateMonth('prev')}
                  >
                    <Ionicons name="chevron-back" size={20} color="#10B981" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.monthNavButton}
                    onPress={() => navigateMonth('next')}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#10B981" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.monthlyCalendarContent}>
                {/* Day Headers */}
                <View style={styles.dayHeadersRow}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Text key={day} style={styles.dayHeader}>{day}</Text>
                  ))}
                </View>

                {/* Calendar Grid */}
                <View style={styles.calendarGrid}>
                  {generateMonthlyCalendar(currentMonth).map((week, weekIndex) => (
                    <View key={weekIndex} style={styles.calendarWeek}>
                      {week.map((date, dayIndex) => (
                        <TouchableOpacity
                          key={dayIndex}
                          style={[
                            styles.calendarDay,
                            !isSameMonth(date, currentMonth) && styles.calendarDayOtherMonth,
                            isToday(date) && styles.calendarDayToday,
                            selectedDate.toDateString() === date.toDateString() && styles.calendarDaySelected
                          ]}
                          onPress={() => handleDateSelect(date)}
                        >
                          <Text style={[
                            styles.calendarDayText,
                            !isSameMonth(date, currentMonth) && styles.calendarDayTextOtherMonth,
                            isToday(date) && styles.calendarDayTextToday,
                            selectedDate.toDateString() === date.toDateString() && styles.calendarDayTextSelected
                          ]}>
                            {date.getDate()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>

                {/* Selected Date Stats */}
                {selectedDate && (
                  <View style={styles.selectedDateStats}>
                    <Text style={styles.selectedDateTitle}>
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Text>
                    
                    <View style={styles.selectedDateStatsGrid}>
                      <View style={styles.selectedDateStatCard}>
                        <Text style={styles.selectedDateStatValue}>{calendarTonnage.toLocaleString()}</Text>
                        <Text style={styles.selectedDateStatLabel}>Tonnage</Text>
                      </View>
                      <View style={styles.selectedDateStatCard}>
                        <Text style={styles.selectedDateStatValue}>{calendarWorkoutCount}</Text>
                        <Text style={styles.selectedDateStatLabel}>Workouts</Text>
                      </View>
                      <View style={styles.selectedDateStatCard}>
                        <Text style={styles.selectedDateStatValue}>{Math.floor(calendarDuration / 60)}</Text>
                        <Text style={styles.selectedDateStatLabel}>Minutes</Text>
                      </View>
                    </View>

                    {/* Workouts for Selected Date */}
                    {calendarWorkouts.length > 0 && (
                      <View style={styles.selectedDateWorkouts}>
                        <Text style={styles.selectedDateWorkoutsTitle}>Workouts</Text>
                        {calendarWorkouts.map((workout: any, index: number) => (
                          <View key={index} style={styles.selectedDateWorkoutCard}>
                            <LinearGradient
                              colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                              style={styles.selectedDateWorkoutGradient}
                            >
                              <Text style={styles.selectedDateWorkoutName}>{workout.name}</Text>
                              <Text style={styles.selectedDateWorkoutDescription}>{workout.description}</Text>
                              <View style={styles.selectedDateWorkoutStats}>
                                <View style={styles.selectedDateWorkoutStat}>
                                  <Ionicons name="time" size={16} color="#10B981" />
                                  <Text style={styles.selectedDateWorkoutStatText}>{workout.duration} min</Text>
                                </View>
                                <View style={styles.selectedDateWorkoutStat}>
                                  <Ionicons name="barbell" size={16} color="#10B981" />
                                  <Text style={styles.selectedDateWorkoutStatText}>{workout.tonnage.toLocaleString()} lbs</Text>
                                </View>
                              </View>
                            </LinearGradient>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>

        {/* PR Notifications Modal */}
        <Modal visible={showPRNotifications} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.prNotificationsModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.prNotificationsHeader}>
                <TouchableOpacity 
                  style={styles.prNotificationsBackButton}
                  onPress={() => setShowPRNotifications(false)}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.prNotificationsTitle}>PR Notifications</Text>
                <View style={styles.prNotificationsHeaderSpacer} />
              </View>
              
              <ScrollView style={styles.prNotificationsContent}>
                <View style={styles.prNotificationsSection}>
                  <Text style={styles.prNotificationsSectionTitle}>Your Recent PRs</Text>
                  {recentPRs.length > 0 ? recentPRs.map((pr: any, index: number) => (
                    <View key={`recent-pr-${pr.id}-${index}`} style={styles.prNotificationCard}>
                      <LinearGradient
                        colors={['rgba(16, 185, 129, 0.1)', 'rgba(0, 0, 0, 0.3)']}
                        style={styles.prNotificationGradient}
                      >
                        <View style={styles.prNotificationHeader}>
                          <Ionicons name="trophy" size={20} color="#10B981" />
                          <View style={styles.prNotificationHeaderText}>
                            <Text style={styles.prNotificationExercise}>{pr.exerciseName}</Text>
                            <Text style={styles.prNotificationType}>{pr.type}</Text>
                          </View>
                        </View>
                        <Text style={styles.prNotificationDetails}>
                          {pr.weight}lbs × {pr.reps} reps
                        </Text>
                        <Text style={styles.prNotificationDate}>
                          {new Date(pr.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Text>
                      </LinearGradient>
                    </View>
                  )) : (
                    <View style={styles.prNotificationsEmpty}>
                      <Ionicons name="trophy-outline" size={48} color="#94A3B8" />
                      <Text style={styles.prNotificationsEmptyText}>No PRs yet</Text>
                      <Text style={styles.prNotificationsEmptyDescription}>
                        Complete some sets to start tracking your personal records!
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.prNotificationsSection}>
                  <Text style={styles.prNotificationsSectionTitle}>Team PRs</Text>
                  {/* Team PRs will be implemented when team functionality is added */}
                  {false && userStats?.teamPRs?.map((pr: any, index: number) => (
                    <View key={`team-pr-${pr.memberName}-${pr.exerciseName}-${index}`} style={styles.teamPRCard}>
                      <LinearGradient
                        colors={['rgba(16, 185, 129, 0.08)', 'rgba(0, 0, 0, 0.4)']}
                        style={styles.teamPRGradient}
                      >
                        <View style={styles.teamPRHeader}>
                          <Text style={styles.teamPRMember}>{pr.memberName}</Text>
                          <Text style={styles.teamPRType}>{pr.prType}</Text>
                        </View>
                        <Text style={styles.teamPRExercise}>{pr.exerciseName}</Text>
                        <Text style={styles.teamPRDetails}>
                          {pr.weight}lbs x {pr.reps} reps
                        </Text>
                        <Text style={styles.teamPRDate}>
                          {new Date(pr.timestamp).toLocaleDateString()}
                        </Text>
                      </LinearGradient>
                    </View>
                  )) || (
                    <View style={styles.prNotificationsEmpty}>
                      <Ionicons name="people-outline" size={48} color="#94A3B8" />
                      <Text style={styles.prNotificationsEmptyText}>No team PRs</Text>
                      <Text style={styles.prNotificationsEmptyDescription}>
                        Join a team to see your teammates' personal records!
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
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
  calendarButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  heroStatsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  heroStatsGradient: {
    borderRadius: 16,
    padding: 20,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroStatItem: {
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
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  quickStartButtonIcon: {
    marginBottom: 8,
  },
  quickStartButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
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
  exerciseScrollView: {
    paddingHorizontal: 20,
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
    marginBottom: 8,
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
  // Workout Execution Styles
  workoutExecutionContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  workoutScrollView: {
    flex: 1,
  },
  workoutScrollContent: {
    paddingBottom: 20,
  },
  safeArea: {
    flex: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.1)',
  },
  workoutBackButton: {
    padding: 8,
  },
  workoutHeaderContent: {
    flex: 1,
    alignItems: 'center',
  },
  workoutHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutHeaderTimer: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  workoutEndButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  workoutEndButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseProgress: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  exerciseProgressText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
    textAlign: 'center',
  },
  exerciseProgressBar: {
    height: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  exerciseProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  currentExerciseCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  currentExerciseGradient: {
    padding: 20,
    alignItems: 'center',
  },
  currentExerciseName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  currentExerciseCategory: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: 4,
    textAlign: 'center',
  },
  currentExerciseMuscle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  setProgress: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  setProgressText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
    textAlign: 'center',
  },
  setProgressBar: {
    height: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  setProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  setInputCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  setInputGradient: {
    padding: 20,
  },
  setInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  setInputField: {
    flex: 1,
    marginHorizontal: 8,
  },
  setInputLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
    textAlign: 'center',
  },
  setInput: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  restTimerCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  restTimerGradient: {
    padding: 20,
    alignItems: 'center',
  },
  restTimerText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  restTimerValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  setActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  setActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
  },
  setActionButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  setActionButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: '#10B981',
  },
  setActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  setActionButtonTextActive: {
    color: '#FFFFFF',
  },
  setActionButtonTextInactive: {
    color: '#10B981',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  addSetButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  setActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  workoutNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  navButtonDisabled: {
    borderColor: '#666',
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
  },
  navButtonText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginHorizontal: 4,
  },
  navButtonTextDisabled: {
    color: '#666',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.1)',
  },
  workoutStatItem: {
    alignItems: 'center',
  },
  workoutStatLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  workoutStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutStartModal: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: 400,
    width: '100%',
  },
  workoutStartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  workoutStartDescription: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  workoutStartActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  startButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    marginLeft: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  endWorkoutModal: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: 400,
    width: '100%',
  },
  endWorkoutModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  endWorkoutModalText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  endWorkoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  endWorkoutActionButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  endWorkoutActionText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
  saveButton: {
    borderColor: '#10B981',
  },
  saveButtonText: {
    color: '#10B981',
  },
  workoutSummaryModal: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  workoutSummaryHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
  },
  workoutSummaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  workoutSummarySubtitle: {
    fontSize: 16,
    color: '#10B981',
  },
  workoutSummaryContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summarySection: {
    marginBottom: 24,
  },
  summarySectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.1)',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  exerciseSummary: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.1)',
  },
  exerciseSummaryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseSummarySets: {
    fontSize: 14,
    color: '#94A3B8',
  },
  workoutSummaryActions: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.1)',
  },
  saveWorkoutButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveWorkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Library Modal Styles
  libraryModal: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  libraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.1)',
  },
  libraryBackButton: {
    padding: 8,
  },
  libraryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  libraryHeaderSpacer: {
    width: 40,
  },
  librarySearchButton: {
    padding: 8,
  },
  libraryContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  librarySection: {
    marginBottom: 24,
  },
  librarySectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  libraryWorkoutCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  libraryWorkoutGradient: {
    padding: 16,
  },
  libraryWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  libraryWorkoutName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  libraryWorkoutDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
    lineHeight: 20,
  },
  libraryWorkoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  libraryWorkoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  libraryWorkoutStatText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 4,
    fontWeight: '500',
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.1)',
  },
  searchBar: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  exerciseLibraryCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  exerciseLibraryGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
  },
  exerciseLibraryThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  exerciseLibraryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  exerciseLibraryCategory: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 8,
  },
  exerciseLibraryDifficulty: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exerciseLibraryDifficultyText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  // Calendar Modal Styles
  calendarModal: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.1)',
  },
  calendarBackButton: {
    padding: 8,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  calendarHeaderSpacer: {
    width: 40,
  },
  monthlyViewButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  monthlyViewButtonText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  calendarStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.1)',
  },
  calendarStatItem: {
    alignItems: 'center',
  },
  calendarStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  calendarStatLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  calendarWorkouts: {
    paddingVertical: 20,
  },
  calendarWorkoutsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  calendarWorkoutCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  calendarWorkoutGradient: {
    padding: 16,
  },
  calendarWorkoutName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  calendarWorkoutDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  calendarWorkoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarWorkoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarWorkoutStatText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 4,
    fontWeight: '500',
  },
  calendarEmptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  calendarEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  calendarEmptyDescription: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  // Header Buttons
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10B981',
    marginRight: 8,
  },
  // PR Notifications Modal Styles
  prNotificationsModal: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  prNotificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.1)',
  },
  prNotificationsBackButton: {
    padding: 8,
  },
  prNotificationsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  prNotificationsHeaderSpacer: {
    width: 40,
  },
  prNotificationsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  prNotificationsSection: {
    marginBottom: 24,
  },
  prNotificationsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  prNotificationCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  prNotificationGradient: {
    padding: 16,
  },
  prNotificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prNotificationHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  prNotificationExercise: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  prNotificationType: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  prNotificationDetails: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  prNotificationDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  teamPRCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  teamPRGradient: {
    padding: 16,
  },
  teamPRHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  teamPRMember: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  teamPRType: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  teamPRExercise: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: 4,
    fontWeight: '600',
  },
  teamPRDetails: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  teamPRDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  prNotificationsEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  prNotificationsEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  prNotificationsEmptyDescription: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Workout Preview Modal Styles
  workoutPreviewModal: {
    flex: 1,
  },
  workoutPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.1)',
  },
  workoutPreviewBackButton: {
    padding: 8,
  },
  workoutPreviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  workoutPreviewHeaderSpacer: {
    width: 40,
  },
  workoutPreviewContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  workoutPreviewHero: {
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  workoutPreviewHeroGradient: {
    padding: 24,
    alignItems: 'center',
  },
  workoutPreviewHeroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  workoutPreviewHeroDescription: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 24,
  },
  workoutPreviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  workoutPreviewStatCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  workoutPreviewStatGradient: {
    padding: 16,
    alignItems: 'center',
  },
  workoutPreviewStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  workoutPreviewStatLabel: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseList: {
    marginBottom: 24,
  },
  exerciseListTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  exercisePreviewCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  exercisePreviewCardGradient: {
    padding: 16,
  },
  exercisePreviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exercisePreviewCardInfo: {
    flex: 1,
  },
  exercisePreviewCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exercisePreviewCardCategory: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  exercisePreviewCardSets: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exercisePreviewCardSetsText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  exercisePreviewCardDetails: {
    marginTop: 8,
  },
  setPreviewItem: {
    paddingVertical: 4,
  },
  setPreviewText: {
    fontSize: 14,
    color: '#E2E8F0',
  },
  noSetsText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  noExercisesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noExercisesText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
  },
  workoutPreviewActions: {
    paddingBottom: 40,
  },
  startWorkoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startWorkoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startWorkoutButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  workoutPreviewActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editWorkoutButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  editWorkoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  editWorkoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 8,
  },
  // View All My Workouts Modal Styles
  viewAllWorkoutsModal: {
    flex: 1,
  },
  viewAllWorkoutsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.1)',
  },
  viewAllWorkoutsBackButton: {
    padding: 8,
  },
  viewAllWorkoutsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  viewAllWorkoutsHeaderSpacer: {
    width: 40,
  },
  viewAllWorkoutsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  workoutsGrid: {
    paddingTop: 20,
  },
  viewAllWorkoutCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  viewAllWorkoutCardGradient: {
    padding: 20,
  },
  viewAllWorkoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  viewAllWorkoutCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  viewAllWorkoutCardDelete: {
    padding: 4,
  },
  viewAllWorkoutCardDescription: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 12,
    lineHeight: 20,
  },
  viewAllWorkoutCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewAllWorkoutCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewAllWorkoutCardStatText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
  },
  viewAllWorkoutsEmpty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  viewAllWorkoutsEmptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  viewAllWorkoutsEmptyDescription: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  viewAllWorkoutsCreateButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  viewAllWorkoutsCreateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  viewAllWorkoutsCreateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  // Additional styles for View All My Workouts
  libraryHeaderSpacer: {
    width: 40,
  },
  workoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  libraryWorkoutCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  libraryWorkoutCardGradient: {
    padding: 16,
  },
  libraryWorkoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  libraryWorkoutCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  libraryWorkoutCardDescription: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 12,
    lineHeight: 20,
  },
  libraryWorkoutCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  libraryWorkoutCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  libraryWorkoutCardStatText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 4,
    fontWeight: '600',
  },
  libraryEmpty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  libraryEmptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  libraryEmptyDescription: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  libraryEmptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  libraryEmptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  libraryEmptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  
  // Monthly Calendar Styles
  monthlyCalendarModal: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  monthlyCalendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthlyCalendarBackButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthlyCalendarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  monthlyCalendarNavigation: {
    flexDirection: 'row',
    gap: 8,
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  monthlyCalendarContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dayHeadersRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  calendarGrid: {
    paddingVertical: 10,
  },
  calendarWeek: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDayToday: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  calendarDaySelected: {
    backgroundColor: '#10B981',
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  calendarDayTextOtherMonth: {
    color: '#64748B',
  },
  calendarDayTextToday: {
    color: '#10B981',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
  },
  selectedDateStats: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  selectedDateStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  selectedDateStatCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 15,
    minWidth: 80,
  },
  selectedDateStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  selectedDateStatLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  selectedDateWorkouts: {
    marginTop: 10,
  },
  selectedDateWorkoutsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  selectedDateWorkoutCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedDateWorkoutGradient: {
    padding: 15,
  },
  selectedDateWorkoutName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedDateWorkoutDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 10,
  },
  selectedDateWorkoutStats: {
    flexDirection: 'row',
    gap: 15,
  },
  selectedDateWorkoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  selectedDateWorkoutStatText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
