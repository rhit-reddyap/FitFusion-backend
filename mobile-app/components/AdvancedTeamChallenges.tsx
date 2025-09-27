import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-chart-kit';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'tonnage' | 'workouts' | 'streak' | 'calories' | 'custom';
  category: 'team' | 'individual' | 'global';
  target: number;
  current: number;
  startDate: string;
  endDate: string;
  reward: {
    type: 'xp' | 'badge' | 'premium' | 'custom';
    value: string;
    amount?: number;
  };
  participants: number;
  maxParticipants: number;
  isActive: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  requirements: string[];
  leaderboard: Participant[];
  teamId?: string;
  createdBy: string;
  createdAt: string;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  progress: number;
  rank: number;
  level: number;
  team?: string;
  isYou: boolean;
}

interface AdvancedTeamChallengesProps {
  onBack: () => void;
}

const screenWidth = Dimensions.get('window').width;

export default function AdvancedTeamChallenges({ onBack }: AdvancedTeamChallengesProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'team' | 'individual' | 'global'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard' | 'extreme'>('all');
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [showChallengeDetails, setShowChallengeDetails] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  const mockChallenges: Challenge[] = [
    {
      id: '1',
      title: 'March Madness Tonnage',
      description: 'Lift 50,000 lbs as a team this month and earn exclusive rewards!',
      type: 'tonnage',
      category: 'team',
      target: 50000,
      current: 32000,
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      reward: {
        type: 'badge',
        value: 'March Madness Champion',
        amount: 1000
      },
      participants: 12,
      maxParticipants: 20,
      isActive: true,
      difficulty: 'hard',
      requirements: ['Must be in a team', 'Minimum 3 workouts per week'],
      leaderboard: [
        { id: '1', name: 'Alex Johnson', progress: 4500, rank: 1, level: 12, isYou: true },
        { id: '2', name: 'Sarah Chen', progress: 3800, rank: 2, level: 10, isYou: false },
        { id: '3', name: 'Mike Rodriguez', progress: 3200, rank: 3, level: 8, isYou: false }
      ],
      teamId: 'team1',
      createdBy: 'Alex Johnson',
      createdAt: '2024-02-28'
    },
    {
      id: '2',
      title: '7-Day Workout Streak',
      description: 'Complete a workout every day for 7 consecutive days',
      type: 'streak',
      category: 'individual',
      target: 7,
      current: 4,
      startDate: '2024-03-15',
      endDate: '2024-03-22',
      reward: {
        type: 'xp',
        value: 'Streak Master',
        amount: 500
      },
      participants: 8,
      maxParticipants: 50,
      isActive: true,
      difficulty: 'medium',
      requirements: ['Any workout type counts', 'Must be consecutive days'],
      leaderboard: [
        { id: '1', name: 'You', progress: 4, rank: 1, level: 12, isYou: true },
        { id: '2', name: 'Emma Wilson', progress: 3, rank: 2, level: 9, isYou: false },
        { id: '3', name: 'David Lee', progress: 2, rank: 3, level: 7, isYou: false }
      ],
      createdBy: 'System',
      createdAt: '2024-03-14'
    },
    {
      id: '3',
      title: 'Global Calorie Burn',
      description: 'Join the global community in burning 1 million calories!',
      type: 'calories',
      category: 'global',
      target: 1000000,
      current: 750000,
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      reward: {
        type: 'premium',
        value: '1 Month Premium',
        amount: 1
      },
      participants: 1250,
      maxParticipants: 10000,
      isActive: true,
      difficulty: 'easy',
      requirements: ['Any activity counts', 'Minimum 100 calories per day'],
      leaderboard: [
        { id: '1', name: 'You', progress: 2500, rank: 1, level: 12, isYou: true },
        { id: '2', name: 'FitnessFan123', progress: 2200, rank: 2, level: 15, isYou: false },
        { id: '3', name: 'GymRat99', progress: 1900, rank: 3, level: 11, isYou: false }
      ],
      createdBy: 'FitFusion AI',
      createdAt: '2024-02-28'
    },
    {
      id: '4',
      title: 'Extreme Powerlifting',
      description: 'Complete 100 heavy compound lifts in one week',
      type: 'custom',
      category: 'individual',
      target: 100,
      current: 45,
      startDate: '2024-03-18',
      endDate: '2024-03-25',
      reward: {
        type: 'badge',
        value: 'Powerlifting Beast',
        amount: 2000
      },
      participants: 5,
      maxParticipants: 25,
      isActive: true,
      difficulty: 'extreme',
      requirements: ['Squat, Deadlift, or Bench Press only', 'Minimum 80% of 1RM'],
      leaderboard: [
        { id: '1', name: 'You', progress: 45, rank: 1, level: 12, isYou: true },
        { id: '2', name: 'StrongMan', progress: 38, rank: 2, level: 14, isYou: false },
        { id: '3', name: 'IronMike', progress: 32, rank: 3, level: 10, isYou: false }
      ],
      createdBy: 'Powerlifting Pro',
      createdAt: '2024-03-17'
    }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: 'grid' },
    { id: 'team', name: 'Team', icon: 'people' },
    { id: 'individual', name: 'Individual', icon: 'person' },
    { id: 'global', name: 'Global', icon: 'globe' }
  ];

  const difficulties = [
    { id: 'all', name: 'All', color: '#6B7280' },
    { id: 'easy', name: 'Easy', color: '#10B981' },
    { id: 'medium', name: 'Medium', color: '#F59E0B' },
    { id: 'hard', name: 'Hard', color: '#EF4444' },
    { id: 'extreme', name: 'Extreme', color: '#8B5CF6' }
  ];

  const filteredChallenges = mockChallenges.filter(challenge => {
    const categoryMatch = selectedCategory === 'all' || challenge.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    const diff = difficulties.find(d => d.id === difficulty);
    return diff?.color || '#6B7280';
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTimeLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const prepareLeaderboardData = (challenge: Challenge) => {
    const top5 = challenge.leaderboard.slice(0, 5);
    return {
      labels: top5.map(p => p.name.split(' ')[0]),
      datasets: [{
        data: top5.map(p => p.progress),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  const handleJoinChallenge = (challenge: Challenge) => {
    if (challenge.participants >= challenge.maxParticipants) {
      Alert.alert('Challenge Full', 'This challenge has reached maximum participants');
      return;
    }
    
    Alert.alert('Success', `Joined challenge: ${challenge.title}`);
  };

  const handleCreateChallenge = () => {
    setShowCreateChallenge(true);
  };

  const renderChallengeCard = ({ item: challenge }: { item: Challenge }) => (
    <TouchableOpacity
      style={styles.challengeCard}
      onPress={() => {
        setSelectedChallenge(challenge);
        setShowChallengeDetails(true);
      }}
    >
      <LinearGradient
        colors={[getDifficultyColor(challenge.difficulty) + '20', getDifficultyColor(challenge.difficulty) + '05']}
        style={styles.challengeGradient}
      >
        <View style={styles.challengeHeader}>
          <View style={styles.challengeTitleContainer}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
              <Text style={styles.difficultyText}>{challenge.difficulty.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.categoryBadge}>
            <Ionicons 
              name={
                challenge.category === 'team' ? 'people' :
                challenge.category === 'individual' ? 'person' : 'globe'
              } 
              size={16} 
              color="#FFFFFF" 
            />
          </View>
        </View>

        <Text style={styles.challengeDescription}>{challenge.description}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressText}>
              {formatNumber(challenge.current)} / {formatNumber(challenge.target)}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${getProgressPercentage(challenge.current, challenge.target)}%`,
                  backgroundColor: getDifficultyColor(challenge.difficulty)
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.challengeFooter}>
          <View style={styles.challengeStats}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={16} color="#9CA3AF" />
              <Text style={styles.statText}>{challenge.participants}/{challenge.maxParticipants}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={16} color="#9CA3AF" />
              <Text style={styles.statText}>{getTimeLeft(challenge.endDate)}d left</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={16} color="#9CA3AF" />
              <Text style={styles.statText}>{challenge.reward.value}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}
            onPress={() => handleJoinChallenge(challenge)}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Challenges</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateChallenge}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.filterButton,
                  selectedCategory === category.id && styles.filterButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id as any)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={16} 
                  color={selectedCategory === category.id ? '#FFFFFF' : '#9CA3AF'} 
                />
                <Text style={[
                  styles.filterButtonText,
                  selectedCategory === category.id && styles.filterButtonTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Difficulty Filter */}
        <View style={styles.difficultyContainer}>
          <Text style={styles.filterTitle}>Difficulty</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {difficulties.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.id}
                style={[
                  styles.difficultyButton,
                  { borderColor: difficulty.color },
                  selectedDifficulty === difficulty.id && { backgroundColor: difficulty.color }
                ]}
                onPress={() => setSelectedDifficulty(difficulty.id as any)}
              >
                <Text style={[
                  styles.difficultyButtonText,
                  { color: selectedDifficulty === difficulty.id ? '#FFFFFF' : difficulty.color }
                ]}>
                  {difficulty.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Challenges List */}
        <FlatList
          data={filteredChallenges}
          renderItem={renderChallengeCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>

      {/* Challenge Details Modal */}
      <Modal visible={showChallengeDetails} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedChallenge && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedChallenge.title}</Text>
                  <TouchableOpacity onPress={() => setShowChallengeDetails(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScrollView}>
                  <Text style={styles.modalDescription}>{selectedChallenge.description}</Text>

                  <View style={styles.modalStats}>
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatLabel}>Difficulty</Text>
                      <View style={[styles.modalDifficultyBadge, { backgroundColor: getDifficultyColor(selectedChallenge.difficulty) }]}>
                        <Text style={styles.modalDifficultyText}>{selectedChallenge.difficulty.toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatLabel}>Participants</Text>
                      <Text style={styles.modalStatValue}>{selectedChallenge.participants}/{selectedChallenge.maxParticipants}</Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatLabel}>Time Left</Text>
                      <Text style={styles.modalStatValue}>{getTimeLeft(selectedChallenge.endDate)} days</Text>
                    </View>
                  </View>

                  <View style={styles.modalProgressContainer}>
                    <Text style={styles.modalProgressTitle}>Progress</Text>
                    <View style={styles.modalProgressBar}>
                      <View 
                        style={[
                          styles.modalProgressFill,
                          { 
                            width: `${getProgressPercentage(selectedChallenge.current, selectedChallenge.target)}%`,
                            backgroundColor: getDifficultyColor(selectedChallenge.difficulty)
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.modalProgressText}>
                      {formatNumber(selectedChallenge.current)} / {formatNumber(selectedChallenge.target)}
                    </Text>
                  </View>

                  <View style={styles.modalLeaderboard}>
                    <Text style={styles.modalLeaderboardTitle}>Leaderboard</Text>
                    <BarChart
                      data={prepareLeaderboardData(selectedChallenge)}
                      width={screenWidth - 80}
                      height={200}
                      chartConfig={{
                        backgroundColor: '#1F2937',
                        backgroundGradientFrom: '#1F2937',
                        backgroundGradientTo: '#1F2937',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: { borderRadius: 16 }
                      }}
                      style={styles.leaderboardChart}
                    />
                  </View>

                  <View style={styles.modalReward}>
                    <Text style={styles.modalRewardTitle}>Reward</Text>
                    <View style={styles.modalRewardCard}>
                      <Ionicons name="trophy" size={24} color="#F59E0B" />
                      <Text style={styles.modalRewardText}>{selectedChallenge.reward.value}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.modalJoinButton, { backgroundColor: getDifficultyColor(selectedChallenge.difficulty) }]}
                    onPress={() => {
                      setShowChallengeDetails(false);
                      handleJoinChallenge(selectedChallenge);
                    }}
                  >
                    <Text style={styles.modalJoinButtonText}>Join Challenge</Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Create Challenge Modal */}
      <Modal visible={showCreateChallenge} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Challenge</Text>
              <TouchableOpacity onPress={() => setShowCreateChallenge(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Create your own fitness challenge and compete with friends!
            </Text>
            
            <TouchableOpacity style={styles.createChallengeButton} onPress={() => {
              setShowCreateChallenge(false);
              Alert.alert('Success', 'Challenge creation feature coming soon!');
            }}>
              <Text style={styles.createChallengeButtonText}>Create Challenge</Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#111111',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  createButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#1F2937',
    borderRadius: 20,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  difficultyContainer: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  difficultyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderRadius: 20,
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  challengeCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: 20,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  categoryBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 16,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  progressText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  joinButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
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
    maxHeight: '90%',
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
    flex: 1,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  modalStatValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalDifficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalDifficultyText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalProgressContainer: {
    marginBottom: 20,
  },
  modalProgressTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  modalProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 8,
  },
  modalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  modalLeaderboard: {
    marginBottom: 20,
  },
  modalLeaderboardTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  leaderboardChart: {
    borderRadius: 16,
  },
  modalReward: {
    marginBottom: 20,
  },
  modalRewardTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  modalRewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  modalRewardText: {
    fontSize: 16,
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  modalJoinButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalJoinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createChallengeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createChallengeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});








