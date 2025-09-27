import React, { useState, useEffect, useCallback } from 'react';
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
  FlatList,
  Image,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AdvancedTeamDashboard from './AdvancedTeamDashboard';
import AdvancedTeamChallenges from './AdvancedTeamChallenges';
import AdvancedTeamChat from './AdvancedTeamChat';
import TeamLiveStream from './TeamLiveStream';
import TeamSocialFeed from './TeamSocialFeed';
import TeamEvents from './TeamEvents';
import TeamMarketplace from './TeamMarketplace';
import TeamCoaching from './TeamCoaching';
import { TeamService, Team, TeamMember, TeamStats, TeamActivity, TeamChallenge, JoinRequest } from '../services/teamService';
import { useAuth } from './AuthProvider';
import TeamProfileEditorSimple from './TeamProfileEditorSimple';

const { width, height } = Dimensions.get('window');

interface AdvancedTeamCommunitiesRevampedProps {
  onBack: () => void;
}

export default function AdvancedTeamCommunitiesRevamped({ onBack }: AdvancedTeamCommunitiesRevampedProps) {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'challenges' | 'chat' | 'leaderboard' | 'discovery' | 'live' | 'social' | 'events' | 'marketplace' | 'coaching'>('dashboard');
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const [showTeamSettings, setShowTeamSettings] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [animatedValue] = useState(new Animated.Value(0));
  const [pulseValue] = useState(new Animated.Value(1));
  
  // Real data state
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [teamActivities, setTeamActivities] = useState<TeamActivity[]>([]);
  const [teamChallenges, setTeamChallenges] = useState<TeamChallenge[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: 'grid', color: '#10B981' },
    { id: 'challenges', name: 'Challenges', icon: 'trophy', color: '#F59E0B' },
    { id: 'chat', name: 'Chat', icon: 'chatbubbles', color: '#8B5CF6' },
    { id: 'leaderboard', name: 'Leaderboard', icon: 'podium', color: '#EF4444' },
    { id: 'discover', name: 'Discover', icon: 'compass', color: '#06B6D4' },
    { id: 'live', name: 'Live', icon: 'videocam', color: '#F59E0B' },
    { id: 'social', name: 'Social', icon: 'people', color: '#8B5CF6' },
    { id: 'events', name: 'Events', icon: 'calendar', color: '#10B981' },
    { id: 'marketplace', name: 'Market', icon: 'storefront', color: '#3B82F6' },
    { id: 'coaching', name: 'Coaching', icon: 'school', color: '#EF4444' }
  ];

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
    },
    {
      id: '3',
      name: 'Flexibility Masters',
      description: 'Yoga and mobility enthusiasts',
      memberCount: 6,
      maxMembers: 12,
      totalTonnage: 15000,
      weeklyTonnage: 1200,
      level: 5,
      xp: 3200,
      badges: ['Flexibility', 'Mindfulness'],
      isPrivate: false,
      adminId: 'admin3',
      createdAt: '2024-02-15',
      color: '#9F7AEA'
    }
  ];

  const mockLeaderboard = [
    { rank: 1, team: 'Iron Titans', tonnage: 8500, members: 12, level: 15 },
    { rank: 2, team: 'Cardio Kings', tonnage: 3200, members: 8, level: 8 },
    { rank: 3, team: 'Flexibility Masters', tonnage: 1200, members: 6, level: 5 },
    { rank: 4, team: 'Strength Squad', tonnage: 9800, members: 15, level: 12 },
    { rank: 5, team: 'Endurance Elite', tonnage: 2800, members: 10, level: 9 }
  ];

  useEffect(() => {
    loadAllData();
    startAnimations();
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTeams(mockTeams);
      setMyTeams(mockTeams.slice(0, 2)); // User is in first 2 teams
      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleSaveTeam = async (teamData: any) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a team.');
      return;
    }
    
    try {
      // Map the teamData fields to match the database schema
      const mappedTeamData = {
        name: teamData.name,
        description: teamData.description,
        category: teamData.category,
        level: 'All Levels' as 'All Levels', // Default level
        privacy: (teamData.privacy || 'Public') as 'Public',
        max_members: teamData.maxMembers || 30, // Map maxMembers to max_members
        team_image: undefined,
        color_theme: teamData.color || ['#10B981', '#059669'],
        badges: [],
        rules: teamData.rules || []
      };

      console.log('Creating team with data:', mappedTeamData);
      const newTeam = await TeamService.createTeam(mappedTeamData, user.id);
      
      if (newTeam) {
        Alert.alert('Success', 'Team created successfully!');
        // Refresh both team lists
        await loadAllData();
        setShowCreateTeam(false);
      } else {
        Alert.alert('Error', 'Failed to create team. Please try again.');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create team. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const startAnimations = () => {
    // Pulse animation for premium features
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
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

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'dashboard':
        return <AdvancedTeamDashboard onBack={onBack} />;
      case 'challenges':
        return <AdvancedTeamChallenges onBack={onBack} />;
      case 'chat':
        return <AdvancedTeamChat onBack={onBack} teamId="1" teamName="Iron Titans" />;
      case 'leaderboard':
        return renderLeaderboard();
      case 'discover':
        return renderDiscover();
      case 'live':
        return <TeamLiveStream visible={true} onClose={() => setSelectedTab('dashboard')} teamId="1" teamName="Iron Titans" />;
      case 'social':
        return <TeamSocialFeed visible={true} onClose={() => setSelectedTab('dashboard')} teamId="1" teamName="Iron Titans" />;
      case 'events':
        return <TeamEvents visible={true} onClose={() => setSelectedTab('dashboard')} teamId="1" teamName="Iron Titans" />;
      case 'marketplace':
        return <TeamMarketplace visible={true} onClose={() => setSelectedTab('dashboard')} teamId="1" teamName="Iron Titans" />;
      case 'coaching':
        return <TeamCoaching visible={true} onClose={() => setSelectedTab('dashboard')} teamId="1" teamName="Iron Titans" />;
      default:
        return <AdvancedTeamDashboard onBack={onBack} />;
    }
  };

  const renderLeaderboard = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.leaderboardContainer}>
        <Text style={styles.sectionTitle}>Global Team Leaderboard</Text>
        <Text style={styles.sectionSubtitle}>Top performing teams this week</Text>
        
        {mockLeaderboard.map((team, index) => (
          <Animated.View
            key={team.rank}
            style={[
              styles.leaderboardCard,
              { transform: [{ scale: pulseValue }] }
            ]}
          >
            <View style={styles.rankContainer}>
              <Text style={[
                styles.rankNumber,
                { color: index < 3 ? '#F59E0B' : '#9CA3AF' }
              ]}>
                #{team.rank}
              </Text>
              {index < 3 && (
                <Ionicons 
                  name="trophy" 
                  size={20} 
                  color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'} 
                />
              )}
            </View>
            
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{team.team}</Text>
              <Text style={styles.teamStats}>
                {formatNumber(team.tonnage)} lbs • {team.members} members • Level {team.level}
              </Text>
            </View>
            
            <View style={styles.teamBadge}>
              <Text style={styles.badgeText}>ELITE</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );

  const renderDiscover = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.discoverContainer}>
        <Text style={styles.sectionTitle}>Discover Teams</Text>
        <Text style={styles.sectionSubtitle}>Find your perfect fitness community</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search teams..."
            placeholderTextColor="#6B7280"
          />
        </View>

        <View style={styles.categoriesContainer}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['All', 'Powerlifting', 'Cardio', 'Yoga', 'CrossFit', 'Bodybuilding'].map((category) => (
              <TouchableOpacity key={category} style={styles.categoryButton}>
                <Text style={styles.categoryButtonText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.teamsGrid}>
          {mockTeams.map((team) => (
            <TouchableOpacity key={team.id} style={styles.discoverTeamCard}>
              <LinearGradient
                colors={[team.color + '20', team.color + '05']}
                style={styles.teamGradient}
              >
                <View style={styles.teamHeader}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <View style={styles.teamLevel}>
                    <Text style={styles.levelText}>L{team.level}</Text>
                  </View>
                </View>
                
                <Text style={styles.teamDescription}>{team.description}</Text>
                
                <View style={styles.teamStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="people" size={16} color="#9CA3AF" />
                    <Text style={styles.statText}>{team.memberCount}/{team.maxMembers}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="fitness" size={16} color="#9CA3AF" />
                    <Text style={styles.statText}>{formatNumber(team.weeklyTonnage)} lbs</Text>
                  </View>
                </View>
                
                <View style={styles.badgesContainer}>
                  {team.badges.map((badge, index) => (
                    <View key={index} style={styles.badge}>
                      <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                  ))}
                </View>
                
                <TouchableOpacity style={styles.joinTeamButton}>
                  <Text style={styles.joinTeamButtonText}>Join Team</Text>
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <Animated.View style={[styles.container, { opacity: animatedValue }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Team Communities</Text>
          <Text style={styles.subtitle}>Connect, compete, and achieve together</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => setShowTeamSettings(true)}>
          <Ionicons name="settings" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                selectedTab === tab.id && styles.tabButtonActive
              ]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={selectedTab === tab.id ? '#FFFFFF' : '#9CA3AF'} 
              />
              <Text style={[
                styles.tabButtonText,
                selectedTab === tab.id && styles.tabButtonTextActive
              ]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.fab}
          onPress={handleCreateTeam}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.fab, styles.fabSecondary]}
          onPress={() => setShowJoinTeam(true)}
        >
          <Ionicons name="people" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

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

      {/* Team Profile Editor Modal */}
      <TeamProfileEditorSimple
        visible={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        onSave={handleSaveTeam}
      />
    </Animated.View>
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
    backgroundColor: '#111111',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
  },
  tabContainer: {
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    paddingBottom: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: '#10B981',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  leaderboardContainer: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 8,
  },
  rankNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  teamStats: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  teamBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  discoverContainer: {
    paddingVertical: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1F2937',
    borderRadius: 20,
    marginRight: 12,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  teamsGrid: {
    gap: 16,
  },
  discoverTeamCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  teamGradient: {
    padding: 20,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamLevel: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  teamDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 16,
    lineHeight: 20,
  },
  teamStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
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
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  joinTeamButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinTeamButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabSecondary: {
    backgroundColor: '#8B5CF6',
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

