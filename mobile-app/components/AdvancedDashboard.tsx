import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataStorage } from '../utils/dataStorage';
import { useAuth } from './AuthProvider';
import CalorieGoalModal from './CalorieGoalModal';

const { width, height } = Dimensions.get('window');

interface AdvancedDashboardProps {
  onNavigate: (screen: string) => void;
}

export default function AdvancedDashboard({ onNavigate }: AdvancedDashboardProps) {
  const { user, isPremium } = useAuth();
  const [animatedValue] = useState(new Animated.Value(0));
  const [pulseValue] = useState(new Animated.Value(1));
  const [streakValue] = useState(new Animated.Value(0));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userStats, setUserStats] = useState(null);
  const [todaysProgress, setTodaysProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [showCalorieConsumedModal, setShowCalorieConsumedModal] = useState(false);
  const [showCalorieBurnedModal, setShowCalorieBurnedModal] = useState(false);
  const [calorieBurnedGoal, setCalorieBurnedGoal] = useState(500);

  // Load real user data
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      const [stats, progress, personal, goals] = await Promise.all([
        DataStorage.getUserStats(),
        DataStorage.getTodaysProgress(),
        DataStorage.getPersonalInfo(),
        DataStorage.getDailyGoals()
      ]);
      
      setUserStats(stats);
      setTodaysProgress(progress);
      setPersonalInfo(personal);
      setCalorieBurnedGoal(goals.caloriesBurned || 500);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Default stats if data not loaded yet
  const defaultStats = {
    streak: 0,
    caloriesToday: 0,
    caloriesGoal: 2000,
    proteinToday: 0,
    proteinGoal: 150,
    workoutsThisWeek: 0,
    workoutsGoal: 1,
    waterIntake: 0,
    waterGoal: 8,
    sleepLastNight: 0,
    sleepGoal: 8,
    heartRate: 0,
    steps: 0,
    stepsGoal: 10000,
    bmi: 0,
    bodyFat: 0,
    muscleMass: 0
  };

  const stats = userStats || defaultStats;
  const progress = todaysProgress || {
    calories: { current: 0, goal: 2000, percentage: 0 },
    protein: { current: 0, goal: 150, percentage: 0 },
    workouts: { current: 0, goal: 1, percentage: 0 }
  };

  const aiRecommendations = [
    {
      id: 1,
      type: 'nutrition',
      title: 'Protein Boost Needed',
      description: 'Add 25g more protein to reach your muscle building goals',
      action: 'View Meal Plan',
      priority: 'high',
      icon: 'nutrition'
    },
    {
      id: 2,
      type: 'workout',
      title: 'Rest Day Recommendation',
      description: 'Your recovery score is 85%. Perfect day for light cardio',
      action: 'Start Recovery',
      priority: 'medium',
      icon: 'heart'
    },
    {
      id: 3,
      type: 'hydration',
      title: 'Hydration Alert',
      description: 'You\'re 1.5L behind your daily water goal',
      action: 'Log Water',
      priority: 'high',
      icon: 'water'
    }
  ];

  const achievements = [
    { id: 1, name: 'Week Warrior', description: '7-day workout streak', icon: 'trophy', earned: true },
    { id: 2, name: 'Protein Power', description: 'Hit protein goal 5 days', icon: 'fitness', earned: true },
    { id: 3, name: 'Hydration Hero', description: 'Perfect water intake week', icon: 'water', earned: false },
    { id: 4, name: 'Sleep Master', description: '8+ hours for 7 days', icon: 'moon', earned: false }
  ];

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.timing(streakValue, {
        toValue: stats?.currentStreak || 0,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      })
    ]).start();

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []); // Remove stats dependency to prevent infinite loop

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "Every rep counts towards your transformation",
      "Consistency is the key to unlocking your potential",
      "Your body can do it, it's your mind you have to convince",
      "Progress, not perfection, is the goal",
      "The only bad workout is the one that didn't happen"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const renderStatCard = (title: string, value: string, goal: string, icon: string, color: string[], progress: number) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient colors={color} style={styles.statGradient}>
        <View style={styles.statHeader}>
          <Ionicons name={icon as any} size={24} color="white" />
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statGoal}>{goal}</Text>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: progress >= 100 ? '#10B981' : '#F59E0B',
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </LinearGradient>
    </Animated.View>
  );

  const renderAIRecommendation = (rec: any, index: number) => (
    <Animated.View
      key={rec.id}
      style={[
        styles.recommendationCard,
        {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [width, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.recommendationHeader}>
        <View style={[styles.priorityDot, { backgroundColor: rec.priority === 'high' ? '#EF4444' : '#F59E0B' }]} />
        <Ionicons name={rec.icon as any} size={20} color="#10B981" />
        <Text style={styles.recommendationTitle}>{rec.title}</Text>
      </View>
      <Text style={styles.recommendationDescription}>{rec.description}</Text>
      <TouchableOpacity 
        style={styles.recommendationAction}
        onPress={() => {
          // Handle different AI recommendation actions
          switch (rec.type) {
            case 'workout':
              Alert.alert('Starting Workout', 'Opening workout tracker...');
              break;
            case 'nutrition':
              Alert.alert('Nutrition Tip', 'Opening food tracker...');
              break;
            case 'rest':
              Alert.alert('Rest Day', 'Take a well-deserved rest! Your body needs it.');
              break;
            case 'hydration':
              Alert.alert('Hydration Reminder', 'Remember to drink water throughout the day!');
              break;
            default:
              Alert.alert('AI Recommendation', rec.description);
          }
        }}
      >
        <Text style={styles.recommendationActionText}>{rec.action}</Text>
        <Ionicons name="arrow-forward" size={16} color="#10B981" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderAchievement = (achievement: any) => (
    <TouchableOpacity
      key={achievement.id}
      style={[
        styles.achievementCard,
        achievement.earned && styles.achievementEarned
      ]}
    >
      <View style={styles.achievementIcon}>
        <Ionicons
          name={achievement.icon as any}
          size={24}
          color={achievement.earned ? '#F59E0B' : '#6B7280'}
        />
      </View>
      <View style={styles.achievementInfo}>
        <Text style={[styles.achievementName, achievement.earned && styles.achievementNameEarned]}>
          {achievement.name}
        </Text>
        <Text style={styles.achievementDescription}>{achievement.description}</Text>
      </View>
      {achievement.earned && (
        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading your fitness data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{personalInfo?.firstName || user?.display_name || 'Champion'}</Text>
            <Text style={styles.motivationalQuote}>{getMotivationalQuote()}</Text>
          </View>
          <Animated.View
            style={[
              styles.avatarContainer,
              {
                transform: [{ scale: pulseValue }],
              },
            ]}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.avatar}
            >
            <Text style={styles.avatarText}>
              {personalInfo?.firstName?.charAt(0)?.toUpperCase() || user?.display_name?.split(' ')[0]?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
            </LinearGradient>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Streak Counter */}
      <Animated.View
        style={[
          styles.streakContainer,
          {
            opacity: animatedValue,
            transform: [
              {
                scale: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.streakGradient}
        >
          <Ionicons name="flame" size={32} color="white" />
          <View style={styles.streakInfo}>
            <Animated.Text style={styles.streakNumber}>
              {streakValue.interpolate({
                inputRange: [0, stats.currentStreak],
                outputRange: [0, stats.currentStreak],
              })}
            </Animated.Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
          <TouchableOpacity style={styles.streakButton}>
            <Text style={styles.streakButtonText}>Keep Going!</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Calories Consumed - Clickable */}
        <TouchableOpacity onPress={() => setShowCalorieConsumedModal(true)}>
          {renderStatCard(
            'Calories',
            `${Math.round(progress?.calories?.current || 0)}/${progress?.calories?.goal || 2000}`,
            'Consumed',
            'restaurant',
            ['#EF4444', '#DC2626'],
            progress?.calories?.percentage || 0
          )}
        </TouchableOpacity>

        {/* Metabolism - Clickable */}
        <TouchableOpacity onPress={() => setShowCalorieBurnedModal(true)}>
          {renderStatCard(
            'Metabolism',
            `${Math.round(progress?.metabolism || 1632)} cal`,
            'BMR (Base Metabolic Rate)',
            'heart',
            ['#F59E0B', '#D97706'],
            0 // No percentage for metabolism
          )}
        </TouchableOpacity>

        {/* Daily Weight Lifted */}
        {renderStatCard(
          'Weight Lifted',
          `${Math.round(progress?.dailyTonnage || 0)} lbs`,
          'Today',
          'barbell',
          ['#3B82F6', '#2563EB'],
          0 // No percentage for weight lifted
        )}

        {renderStatCard(
          'Workouts',
          `${progress?.workouts?.current || 0}/${progress?.workouts?.goal || 1}`,
          'This Week',
          'fitness',
          ['#06B6D4', '#0891B2'],
          progress?.workouts?.percentage || 0
        )}
      </View>

      {/* AI Recommendations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bulb" size={24} color="#10B981" />
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {aiRecommendations.map((rec, index) => renderAIRecommendation(rec, index))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('workouts')}
          >
            <LinearGradient colors={['#10B981', '#059669']} style={styles.actionGradient}>
              <Ionicons name="play" size={28} color="white" />
              <Text style={styles.actionText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('food')}
          >
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionGradient}>
              <Ionicons name="restaurant" size={28} color="white" />
              <Text style={styles.actionText}>Log Food</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('cookbook')}
          >
            <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.actionGradient}>
              <Ionicons name="book" size={28} color="white" />
              <Text style={styles.actionText}>AD's Cookbook</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('analytics')}
          >
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.actionGradient}>
              <Ionicons name="analytics" size={28} color="white" />
              <Text style={styles.actionText}>Analytics</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map(renderAchievement)}
        </View>
      </View>

      {/* Premium Banner */}
      {!isPremium && (
        <TouchableOpacity
          style={styles.premiumBanner}
          onPress={() => onNavigate('subscription')}
        >
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.premiumBannerGradient}
          >
            <Ionicons name="star" size={24} color="white" />
            <View style={styles.premiumBannerContent}>
              <Text style={styles.premiumBannerTitle}>Unlock Premium</Text>
              <Text style={styles.premiumBannerSubtitle}>Get AI insights, advanced analytics, and more!</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Calorie Goal Modals */}
        <CalorieGoalModal
          visible={showCalorieConsumedModal}
          onClose={() => setShowCalorieConsumedModal(false)}
          type="consumed"
          currentValue={Math.round(progress?.calories?.current || 0)}
          currentGoal={progress?.calories?.goal || 2000}
          onGoalUpdated={async (newGoal) => {
            // Save the new goal to DataStorage
            const goals = await DataStorage.getDailyGoals();
            await DataStorage.saveDailyGoals({
              ...goals,
              calories: newGoal
            });
            
            // Update the progress state
            setTodaysProgress(prev => ({
              ...prev,
              calories: {
                ...prev?.calories,
                goal: newGoal,
                percentage: ((prev?.calories?.current || 0) / newGoal) * 100
              }
            }));
            
            // Reload user data to ensure everything is updated
            loadUserData();
          }}
        />

        <CalorieGoalModal
          visible={showCalorieBurnedModal}
          onClose={() => setShowCalorieBurnedModal(false)}
          type="burned"
          currentValue={Math.round(progress?.caloriesBurned || 0)}
          currentGoal={calorieBurnedGoal}
          onGoalUpdated={async (newGoal) => {
            // Save the new goal to DataStorage
            const goals = await DataStorage.getDailyGoals();
            await DataStorage.saveDailyGoals({
              ...goals,
              caloriesBurned: newGoal
            });
            
            setCalorieBurnedGoal(newGoal);
            
            // Update the progress state
            setTodaysProgress(prev => ({
              ...prev,
              caloriesBurnedGoal: newGoal
            }));
            
            // Reload user data to ensure everything is updated
            loadUserData();
          }}
        />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  motivationalQuote: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    maxWidth: width * 0.6,
  },
  avatarContainer: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  streakInfo: {
    flex: 1,
    marginLeft: 16,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakLabel: {
    fontSize: 16,
    color: '#E5E7EB',
  },
  streakButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#E5E7EB',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statGoal: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#E5E7EB',
    textAlign: 'right',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  recommendationCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    marginLeft: 20,
    width: width * 0.8,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  recommendationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendationActionText: {
    color: '#10B981',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  achievementsGrid: {
    paddingHorizontal: 20,
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  achievementEarned: {
    borderColor: '#F59E0B',
    backgroundColor: '#F59E0B10',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  achievementNameEarned: {
    color: '#F59E0B',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  premiumBanner: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  premiumBannerContent: {
    flex: 1,
    marginLeft: 12,
  },
  premiumBannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  premiumBannerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '600',
  },
  // Calorie tracking styles
  caloriesContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  calorieCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  calorieGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  calorieIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  calorieContent: {
    flex: 1,
  },
  calorieLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  calorieGoal: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  calorieProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  calorieProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  calorieArrow: {
    marginLeft: 12,
  },
});
