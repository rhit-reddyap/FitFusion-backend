import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  totalTonnage: number;
  weeklyTonnage: number;
  level: number;
  xp: number;
  badges: string[];
  isPrivate: boolean;
  joinCode?: string;
  adminId: string;
  createdAt: string;
  color: string;
  image?: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  weeklyTonnage: number;
  totalTonnage: number;
  joinDate: string;
  isAdmin: boolean;
  isOnline: boolean;
  lastActive: string;
}

interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  type: 'tonnage' | 'workouts' | 'streak' | 'calories' | 'custom';
  target: number;
  current: number;
  startDate: string;
  endDate: string;
  reward: string;
  participants: number;
  isActive: boolean;
  leaderboard: TeamMember[];
}

interface TeamActivity {
  id: string;
  type: 'workout' | 'achievement' | 'challenge' | 'join' | 'leave';
  user: string;
  message: string;
  timestamp: string;
  data?: any;
}

interface AdvancedTeamDashboardProps {
  onBack: () => void;
}

const screenWidth = Dimensions.get('window').width;

export default function AdvancedTeamDashboard({ onBack }: AdvancedTeamDashboardProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamChallenges, setTeamChallenges] = useState<TeamChallenge[]>([]);
  const [teamActivities, setTeamActivities] = useState<TeamActivity[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const [showTeamSettings, setShowTeamSettings] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for demonstration
  const mockTeams: Team[] = [
    {
      id: '1',
      name: 'Iron Titans',
      description: 'Elite powerlifters pushing the limits',
      memberCount: 12,
      maxMembers: 20,
      totalTonnage: 125000,
      weeklyTonnage: 8500,
      level: 15,
      xp: 12500,
      badges: ['Powerlifting', 'Elite', 'Consistent'],
      isPrivate: false,
      adminId: 'admin1',
      createdAt: '2024-01-15',
      color: '#FF6B35',
      image: 'https://via.placeholder.com/100'
    },
    {
      id: '2',
      name: 'Cardio Kings',
      description: 'Endurance athletes and runners',
      memberCount: 8,
      maxMembers: 15,
      totalTonnage: 45000,
      weeklyTonnage: 3200,
      level: 8,
      xp: 6800,
      badges: ['Endurance', 'Active'],
      isPrivate: true,
      joinCode: 'CARDIO2024',
      adminId: 'admin2',
      createdAt: '2024-02-01',
      color: '#4ECDC4'
    }
  ];

  const mockMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      level: 12,
      xp: 8500,
      weeklyTonnage: 1200,
      totalTonnage: 15000,
      joinDate: '2024-01-15',
      isAdmin: true,
      isOnline: true,
      lastActive: '2 minutes ago'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      level: 10,
      xp: 7200,
      weeklyTonnage: 980,
      totalTonnage: 12000,
      joinDate: '2024-01-20',
      isAdmin: false,
      isOnline: true,
      lastActive: '5 minutes ago'
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      level: 8,
      xp: 5600,
      weeklyTonnage: 750,
      totalTonnage: 8500,
      joinDate: '2024-02-01',
      isAdmin: false,
      isOnline: false,
      lastActive: '2 hours ago'
    }
  ];

  const mockChallenges: TeamChallenge[] = [
    {
      id: '1',
      title: 'March Madness Tonnage',
      description: 'Lift 50,000 lbs as a team this month',
      type: 'tonnage',
      target: 50000,
      current: 32000,
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      reward: 'Team Badge + 1000 XP',
      participants: 12,
      isActive: true,
      leaderboard: mockMembers
    },
    {
      id: '2',
      title: 'Workout Streak Challenge',
      description: 'Maintain a 7-day workout streak',
      type: 'streak',
      target: 7,
      current: 4,
      startDate: '2024-03-15',
      endDate: '2024-03-22',
      reward: 'Individual Badge + 500 XP',
      participants: 8,
      isActive: true,
      leaderboard: mockMembers
    }
  ];

  const mockActivities: TeamActivity[] = [
    {
      id: '1',
      type: 'workout',
      user: 'Alex Johnson',
      message: 'Completed a 2-hour powerlifting session',
      timestamp: '2 minutes ago',
      data: { tonnage: 1200, duration: 120 }
    },
    {
      id: '2',
      type: 'achievement',
      user: 'Sarah Chen',
      message: 'Earned the "Consistent" badge',
      timestamp: '15 minutes ago',
      data: { badge: 'Consistent' }
    },
    {
      id: '3',
      type: 'challenge',
      user: 'Mike Rodriguez',
      message: 'Completed the daily workout challenge',
      timestamp: '1 hour ago',
      data: { challenge: 'Daily Workout' }
    }
  ];

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTeamMembers(mockMembers);
      setTeamChallenges(mockChallenges);
      setTeamActivities(mockActivities);
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTeamData();
    setRefreshing(false);
  };

  const handleJoinTeam = () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a team join code');
      return;
    }
    
    // Simulate joining team
    Alert.alert('Success', `Joined team with code: ${joinCode}`);
    setShowJoinTeam(false);
    setJoinCode('');
  };

  const handleCreateTeam = () => {
    setShowCreateTeam(true);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const prepareTonnageChartData = () => {
    const data = [
      { week: 'Week 1', tonnage: 7500 },
      { week: 'Week 2', tonnage: 8200 },
      { week: 'Week 3', tonnage: 7800 },
      { week: 'Week 4', tonnage: 8500 }
    ];

    return {
      labels: data.map(d => d.week),
      datasets: [{
        data: data.map(d => d.tonnage / 1000),
        color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
        strokeWidth: 3
      }]
    };
  };

  const prepareMemberChartData = () => {
    const data = mockMembers.map(member => ({
      name: member.name.split(' ')[0],
      tonnage: member.weeklyTonnage
    }));

    return {
      labels: data.map(d => d.name),
      datasets: [{
        data: data.map(d => d.tonnage / 100),
        color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Team Dashboard</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => setShowTeamSettings(true)}>
          <Ionicons name="settings" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Team Selection */}
        <View style={styles.teamSelector}>
          <Text style={styles.sectionTitle}>Select Team</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockTeams.map((team) => (
              <TouchableOpacity
                key={team.id}
                style={[
                  styles.teamCard,
                  selectedTeam?.id === team.id && styles.selectedTeamCard
                ]}
                onPress={() => setSelectedTeam(team)}
              >
                <LinearGradient
                  colors={[team.color, team.color + '80']}
                  style={styles.teamGradient}
                >
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamLevel}>Level {team.level}</Text>
                  <Text style={styles.teamMembers}>{team.memberCount}/{team.maxMembers} members</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addTeamCard} onPress={handleCreateTeam}>
              <Ionicons name="add" size={32} color="#6B7280" />
              <Text style={styles.addTeamText}>Create Team</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {selectedTeam && (
          <>
            {/* Team Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Tonnage</Text>
                <Text style={styles.statValue}>{formatNumber(selectedTeam.totalTonnage)} lbs</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Weekly Tonnage</Text>
                <Text style={styles.statValue}>{formatNumber(selectedTeam.weeklyTonnage)} lbs</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Team Level</Text>
                <Text style={styles.statValue}>{selectedTeam.level}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>XP</Text>
                <Text style={styles.statValue}>{formatNumber(selectedTeam.xp)}</Text>
              </View>
            </View>

            {/* Weekly Tonnage Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Weekly Tonnage Progress</Text>
              <LineChart
                data={prepareTonnageChartData()}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  backgroundColor: '#1F2937',
                  backgroundGradientFrom: '#1F2937',
                  backgroundGradientTo: '#1F2937',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: { r: '6', strokeWidth: '2', stroke: '#FF6B35' }
                }}
                bezier
                style={styles.chart}
              />
            </View>

            {/* Active Challenges */}
            <View style={styles.challengesContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Challenges</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              
              {mockChallenges.map((challenge) => (
                <View key={challenge.id} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <Text style={styles.challengeReward}>{challenge.reward}</Text>
                  </View>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { 
                            width: `${getProgressPercentage(challenge.current, challenge.target)}%`,
                            backgroundColor: selectedTeam.color
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {challenge.current.toLocaleString()} / {challenge.target.toLocaleString()}
                    </Text>
                  </View>
                  
                  <View style={styles.challengeFooter}>
                    <Text style={styles.participantsText}>
                      {challenge.participants} participants
                    </Text>
                    <Text style={styles.timeLeftText}>
                      {Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Team Members */}
            <View style={styles.membersContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Team Members</Text>
                <TouchableOpacity style={styles.inviteButton}>
                  <Ionicons name="person-add" size={16} color="#FFFFFF" />
                  <Text style={styles.inviteButtonText}>Invite</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.memberChartContainer}>
                <Text style={styles.chartTitle}>Member Weekly Tonnage</Text>
                <BarChart
                  data={prepareMemberChartData()}
                  width={screenWidth - 40}
                  height={200}
                  chartConfig={{
                    backgroundColor: '#1F2937',
                    backgroundGradientFrom: '#1F2937',
                    backgroundGradientTo: '#1F2937',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: { borderRadius: 16 }
                  }}
                  style={styles.chart}
                />
              </View>
              
              {mockMembers.map((member) => (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitial}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={styles.memberDetails}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberLevel}>Level {member.level}</Text>
                      <Text style={styles.memberStatus}>
                        {member.isOnline ? 'Online' : `Last active ${member.lastActive}`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.memberStats}>
                    <Text style={styles.memberTonnage}>
                      {formatNumber(member.weeklyTonnage)} lbs
                    </Text>
                    <Text style={styles.memberLabel}>This week</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Recent Activity */}
            <View style={styles.activityContainer}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {mockActivities.map((activity) => (
                <View key={activity.id} style={styles.activityCard}>
                  <View style={styles.activityIcon}>
                    <Ionicons 
                      name={
                        activity.type === 'workout' ? 'fitness' :
                        activity.type === 'achievement' ? 'trophy' :
                        activity.type === 'challenge' ? 'medal' : 'person'
                      } 
                      size={20} 
                      color="#10B981" 
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityUser}>{activity.user}</Text>
                    <Text style={styles.activityMessage}>{activity.message}</Text>
                    <Text style={styles.activityTime}>{activity.timestamp}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Join Team Modal */}
      <Modal visible={showJoinTeam} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join Team</Text>
              <TouchableOpacity onPress={() => setShowJoinTeam(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.joinCodeInput}
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="Enter team join code"
              placeholderTextColor="#6B7280"
            />
            
            <TouchableOpacity style={styles.joinButton} onPress={handleJoinTeam}>
              <Text style={styles.joinButtonText}>Join Team</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Team Modal */}
      <Modal visible={showCreateTeam} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Team</Text>
              <TouchableOpacity onPress={() => setShowCreateTeam(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Create your own fitness team and start competing with friends!
            </Text>
            
            <TouchableOpacity style={styles.createButton} onPress={() => {
              setShowCreateTeam(false);
              Alert.alert('Success', 'Team creation feature coming soon!');
            }}>
              <Text style={styles.createButtonText}>Create Team</Text>
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
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  teamSelector: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  teamCard: {
    width: 150,
    height: 100,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedTeamCard: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  teamGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  teamLevel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  teamMembers: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  addTeamCard: {
    width: 150,
    height: 100,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
  },
  addTeamText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chartContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  challengesContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  challengeCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  challengeReward: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  participantsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeLeftText: {
    fontSize: 12,
    color: '#6B7280',
  },
  membersContainer: {
    marginBottom: 20,
  },
  inviteButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  memberChartContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  memberCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberLevel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  memberStatus: {
    fontSize: 10,
    color: '#6B7280',
  },
  memberStats: {
    alignItems: 'flex-end',
  },
  memberTonnage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  memberLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  activityContainer: {
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activityMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    marginVertical: 4,
  },
  activityTime: {
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
  modalDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
    lineHeight: 20,
  },
  joinCodeInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  joinButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});









