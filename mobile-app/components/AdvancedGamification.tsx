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
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface AdvancedGamificationProps {
  onBack: () => void;
}

export default function AdvancedGamification({ onBack }: AdvancedGamificationProps) {
  const [selectedTab, setSelectedTab] = useState('achievements');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));
  const [pulseValue] = useState(new Animated.Value(1));

  const tabs = [
    { id: 'achievements', name: 'Achievements', icon: 'trophy' },
    { id: 'levels', name: 'Levels', icon: 'star' },
    { id: 'streaks', name: 'Streaks', icon: 'flame' },
    { id: 'rewards', name: 'Rewards', icon: 'gift' }
  ];

  const userStats = {
    level: 12,
    xp: 2450,
    xpToNext: 500,
    totalXp: 12450,
    streak: 47,
    longestStreak: 89,
    achievements: 23,
    totalAchievements: 45,
    points: 12850,
    rank: 4
  };

  const achievements = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first workout',
      icon: 'walk',
      rarity: 'common',
      xp: 50,
      earned: true,
      earnedDate: '2024-01-15',
      progress: 100
    },
    {
      id: 2,
      name: 'Week Warrior',
      description: 'Complete 7 workouts in a week',
      icon: 'calendar',
      rarity: 'rare',
      xp: 200,
      earned: true,
      earnedDate: '2024-01-22',
      progress: 100
    },
    {
      id: 3,
      name: 'Protein Power',
      description: 'Hit your protein goal 30 days in a row',
      icon: 'fitness',
      rarity: 'epic',
      xp: 500,
      earned: false,
      earnedDate: null,
      progress: 75
    },
    {
      id: 4,
      name: 'Hydration Hero',
      description: 'Drink 8 glasses of water for 21 days',
      icon: 'water',
      rarity: 'rare',
      xp: 300,
      earned: false,
      earnedDate: null,
      progress: 60
    },
    {
      id: 5,
      name: 'Sleep Master',
      description: 'Get 8+ hours of sleep for 30 days',
      icon: 'moon',
      rarity: 'legendary',
      xp: 1000,
      earned: false,
      earnedDate: null,
      progress: 25
    },
    {
      id: 6,
      name: 'Social Butterfly',
      description: 'Share 10 posts in the community',
      icon: 'people',
      rarity: 'common',
      xp: 100,
      earned: true,
      earnedDate: '2024-02-01',
      progress: 100
    }
  ];

  const levels = [
    { level: 1, xpRequired: 0, title: 'Beginner', color: '#6B7280' },
    { level: 5, xpRequired: 1000, title: 'Novice', color: '#10B981' },
    { level: 10, xpRequired: 3000, title: 'Intermediate', color: '#3B82F6' },
    { level: 15, xpRequired: 6000, title: 'Advanced', color: '#8B5CF6' },
    { level: 20, xpRequired: 10000, title: 'Expert', color: '#F59E0B' },
    { level: 25, xpRequired: 15000, title: 'Master', color: '#EF4444' },
    { level: 30, xpRequired: 25000, title: 'Legend', color: '#F59E0B' }
  ];

  const streaks = [
    {
      id: 1,
      name: 'Workout Streak',
      current: 47,
      longest: 89,
      icon: 'fitness',
      color: ['#10B981', '#059669'],
      reward: '50 XP'
    },
    {
      id: 2,
      name: 'Nutrition Streak',
      current: 23,
      longest: 45,
      icon: 'nutrition',
      color: ['#3B82F6', '#2563EB'],
      reward: '25 XP'
    },
    {
      id: 3,
      name: 'Sleep Streak',
      current: 12,
      longest: 28,
      icon: 'moon',
      color: ['#8B5CF6', '#7C3AED'],
      reward: '15 XP'
    },
    {
      id: 4,
      name: 'Hydration Streak',
      current: 8,
      longest: 21,
      icon: 'water',
      color: ['#06B6D4', '#0891B2'],
      reward: '10 XP'
    }
  ];

  const rewards = [
    {
      id: 1,
      name: 'Premium Workout Plan',
      description: 'Unlock exclusive AI-generated workout plans',
      cost: 500,
      icon: 'fitness',
      color: ['#10B981', '#059669'],
      available: true
    },
    {
      id: 2,
      name: 'Custom Meal Recipes',
      description: 'Get personalized meal recipes based on your preferences',
      cost: 300,
      icon: 'restaurant',
      color: ['#F59E0B', '#D97706'],
      available: true
    },
    {
      id: 3,
      name: 'Advanced Analytics',
      description: 'Access detailed progress analytics and insights',
      cost: 750,
      icon: 'analytics',
      color: ['#8B5CF6', '#7C3AED'],
      available: false
    },
    {
      id: 4,
      name: 'Personal Trainer Chat',
      description: '30-minute session with a certified personal trainer',
      cost: 1000,
      icon: 'chatbubble',
      color: ['#EF4444', '#DC2626'],
      available: false
    },
    {
      id: 5,
      name: 'Fitness Gear Discount',
      description: '20% off on premium fitness equipment',
      cost: 200,
      icon: 'gift',
      color: ['#06B6D4', '#0891B2'],
      available: true
    }
  ];

  const dailyQuests = [
    {
      id: 1,
      title: 'Morning Warrior',
      description: 'Complete a workout before 10 AM',
      xp: 50,
      progress: 0,
      maxProgress: 1,
      completed: false
    },
    {
      id: 2,
      title: 'Hydration Hero',
      description: 'Drink 8 glasses of water today',
      xp: 25,
      progress: 5,
      maxProgress: 8,
      completed: false
    },
    {
      id: 3,
      title: 'Protein Power',
      description: 'Hit your protein goal for the day',
      xp: 75,
      progress: 0,
      maxProgress: 1,
      completed: false
    }
  ];

  const weeklyChallenges = [
    {
      id: 1,
      title: 'Cardio Crusher',
      description: 'Complete 5 cardio workouts this week',
      xp: 200,
      progress: 3,
      maxProgress: 5,
      completed: false,
      timeLeft: '3 days'
    },
    {
      id: 2,
      title: 'Nutrition Ninja',
      description: 'Hit all macro goals for 5 days',
      xp: 300,
      progress: 2,
      maxProgress: 5,
      completed: false,
      timeLeft: '3 days'
    }
  ];

  useEffect(() => {
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
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      )
    ]).start();
  }, []);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#6B7280';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getCurrentLevel = () => {
    return levels.find(level => userStats.level >= level.level) || levels[0];
  };

  const renderAchievement = (achievement) => (
    <Animated.View
      key={achievement.id}
      style={[
        styles.achievementCard,
        achievement.earned && styles.earnedAchievement,
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
      <View style={[
        styles.achievementIcon,
        { backgroundColor: getRarityColor(achievement.rarity) + '20' }
      ]}>
        <Ionicons
          name={achievement.icon as any}
          size={24}
          color={getRarityColor(achievement.rarity)}
        />
        {achievement.earned && (
          <View style={styles.earnedBadge}>
            <Ionicons name="checkmark" size={12} color="white" />
          </View>
        )}
      </View>
      <View style={styles.achievementInfo}>
        <View style={styles.achievementHeader}>
          <Text style={[
            styles.achievementName,
            achievement.earned && styles.earnedText
          ]}>
            {achievement.name}
          </Text>
          <Text style={styles.achievementXp}>+{achievement.xp} XP</Text>
        </View>
        <Text style={styles.achievementDescription}>{achievement.description}</Text>
        {achievement.earned ? (
          <Text style={styles.achievementDate}>
            Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
          </Text>
        ) : (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${achievement.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{achievement.progress}%</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderStreak = (streak) => (
    <Animated.View
      key={streak.id}
      style={[
        styles.streakCard,
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
      <LinearGradient colors={streak.color} style={styles.streakGradient}>
        <View style={styles.streakHeader}>
          <Ionicons name={streak.icon as any} size={24} color="white" />
          <Text style={styles.streakName}>{streak.name}</Text>
        </View>
        <View style={styles.streakStats}>
          <View style={styles.streakStat}>
            <Text style={styles.streakCurrent}>{streak.current}</Text>
            <Text style={styles.streakLabel}>Current</Text>
          </View>
          <View style={styles.streakStat}>
            <Text style={styles.streakLongest}>{streak.longest}</Text>
            <Text style={styles.streakLabel}>Best</Text>
          </View>
        </View>
        <Text style={styles.streakReward}>Reward: {streak.reward}</Text>
      </LinearGradient>
    </Animated.View>
  );

  const renderReward = (reward) => (
    <TouchableOpacity
      key={reward.id}
      style={[
        styles.rewardCard,
        !reward.available && styles.unavailableReward
      ]}
      onPress={() => {
        if (reward.available) {
          setSelectedReward(reward);
          setShowRewardModal(true);
        }
      }}
    >
      <LinearGradient
        colors={reward.available ? reward.color : ['#1F2937', '#111111']}
        style={styles.rewardGradient}
      >
        <View style={styles.rewardHeader}>
          <Ionicons
            name={reward.icon as any}
            size={24}
            color={reward.available ? "white" : "#6B7280"}
          />
          <Text style={[
            styles.rewardName,
            !reward.available && styles.unavailableText
          ]}>
            {reward.name}
          </Text>
        </View>
        <Text style={[
          styles.rewardDescription,
          !reward.available && styles.unavailableText
        ]}>
          {reward.description}
        </Text>
        <View style={styles.rewardFooter}>
          <Text style={[
            styles.rewardCost,
            !reward.available && styles.unavailableText
          ]}>
            {reward.cost} points
          </Text>
          {!reward.available && (
            <Text style={styles.lockedText}>Locked</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderQuest = (quest) => (
    <View key={quest.id} style={styles.questCard}>
      <View style={styles.questHeader}>
        <Text style={styles.questTitle}>{quest.title}</Text>
        <Text style={styles.questXp}>+{quest.xp} XP</Text>
      </View>
      <Text style={styles.questDescription}>{quest.description}</Text>
      <View style={styles.questProgress}>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { width: `${(quest.progress / quest.maxProgress) * 100}%` }
          ]} />
        </View>
        <Text style={styles.questProgressText}>
          {quest.progress}/{quest.maxProgress}
        </Text>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'achievements':
        return (
          <View style={styles.tabContent}>
            {achievements.map(renderAchievement)}
          </View>
        );
      case 'levels':
        return (
          <View style={styles.tabContent}>
            <View style={styles.levelCard}>
              <LinearGradient colors={['#111111', '#1F2937']} style={styles.levelGradient}>
                <View style={styles.levelHeader}>
                  <Text style={styles.levelTitle}>Current Level</Text>
                  <Text style={styles.levelNumber}>{userStats.level}</Text>
                </View>
                <Text style={styles.levelName}>{getCurrentLevel().title}</Text>
                <View style={styles.xpContainer}>
                  <Text style={styles.xpText}>
                    {userStats.xp} / {userStats.xp + userStats.xpToNext} XP
                  </Text>
                  <View style={styles.xpBar}>
                    <View style={[
                      styles.xpFill,
                      { width: `${(userStats.xp / (userStats.xp + userStats.xpToNext)) * 100}%` }
                    ]} />
                  </View>
                </View>
                <Text style={styles.nextLevelText}>
                  {userStats.xpToNext} XP to next level
                </Text>
              </LinearGradient>
            </View>
            <Text style={styles.sectionTitle}>Level Progression</Text>
            {levels.map((level, index) => (
              <View key={level.level} style={styles.levelItem}>
                <View style={styles.levelItemLeft}>
                  <View style={[
                    styles.levelItemIcon,
                    { backgroundColor: level.color + '20' }
                  ]}>
                    <Text style={[styles.levelItemNumber, { color: level.color }]}>
                      {level.level}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.levelItemTitle}>{level.title}</Text>
                    <Text style={styles.levelItemXp}>{level.xpRequired} XP required</Text>
                  </View>
                </View>
                {userStats.level >= level.level && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
              </View>
            ))}
          </View>
        );
      case 'streaks':
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.streaksContainer}>
              {streaks.map(renderStreak)}
            </View>
          </ScrollView>
        );
      case 'rewards':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Available Rewards</Text>
            <View style={styles.rewardsGrid}>
              {rewards.map(renderReward)}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.pageTitle}>Gamification</Text>
          <Text style={styles.pageSubtitle}>Level up your fitness journey</Text>
        </View>
        <View style={styles.pointsContainer}>
          <Ionicons name="diamond" size={20} color="#F59E0B" />
          <Text style={styles.pointsText}>{userStats.points}</Text>
        </View>
      </View>

      {/* Stats Overview */}
      <Animated.View
        style={[
          styles.statsOverview,
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
        <LinearGradient colors={['#111111', '#1F2937']} style={styles.statsGradient}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.achievements}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>#{userStats.rank}</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Daily Quests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Quests</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.questsContainer}>
            {dailyQuests.map(renderQuest)}
          </View>
        </ScrollView>
      </View>

      {/* Weekly Challenges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Challenges</Text>
        <View style={styles.challengesContainer}>
          {weeklyChallenges.map(renderQuest)}
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              selectedTab === tab.id && styles.activeTabButton
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={selectedTab === tab.id ? '#10B981' : '#6B7280'}
            />
            <Text style={[
              styles.tabText,
              selectedTab === tab.id && styles.activeTabText
            ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      {/* Reward Modal */}
      <Modal
        visible={showRewardModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRewardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Redeem Reward</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowRewardModal(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedReward && (
              <View style={styles.modalBody}>
                <View style={styles.rewardModalIcon}>
                  <Ionicons name={selectedReward.icon as any} size={48} color="#F59E0B" />
                </View>
                <Text style={styles.rewardModalName}>{selectedReward.name}</Text>
                <Text style={styles.rewardModalDescription}>{selectedReward.description}</Text>
                <Text style={styles.rewardModalCost}>Cost: {selectedReward.cost} points</Text>
                <Text style={styles.rewardModalBalance}>
                  Your balance: {userStats.points} points
                </Text>
                <TouchableOpacity style={styles.redeemButton}>
                  <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.redeemButtonGradient}>
                    <Text style={styles.redeemButtonText}>Redeem Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  pointsText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsOverview: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  questsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  questCard: {
    width: width * 0.7,
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  questXp: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  questDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  questProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#1F2937',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  questProgressText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  challengesContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: '#10B98120',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#10B981',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  earnedAchievement: {
    borderColor: '#10B981',
    backgroundColor: '#10B98110',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  earnedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  earnedText: {
    color: '#10B981',
  },
  achievementXp: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  achievementDate: {
    fontSize: 12,
    color: '#10B981',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  levelCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  levelGradient: {
    padding: 24,
    alignItems: 'center',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginRight: 12,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  levelName: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  xpContainer: {
    width: '100%',
    marginBottom: 8,
  },
  xpText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  xpBar: {
    height: 8,
    backgroundColor: '#1F2937',
    borderRadius: 4,
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  nextLevelText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  levelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  levelItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelItemNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  levelItemXp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  streaksContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  streakCard: {
    width: width * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
  },
  streakGradient: {
    padding: 20,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  streakStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  streakStat: {
    flex: 1,
    alignItems: 'center',
  },
  streakCurrent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  streakLongest: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 12,
    color: '#E5E7EB',
  },
  streakReward: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rewardCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  unavailableReward: {
    opacity: 0.6,
  },
  rewardGradient: {
    padding: 16,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  unavailableText: {
    color: '#6B7280',
  },
  rewardDescription: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 12,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardCost: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  lockedText: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    alignItems: 'center',
  },
  rewardModalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F59E0B20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardModalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  rewardModalDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  rewardModalCost: {
    fontSize: 18,
    color: '#F59E0B',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rewardModalBalance: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  redeemButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  redeemButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  redeemButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
