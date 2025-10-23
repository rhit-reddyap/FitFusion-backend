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
import TeamProfileEditorSimple from './TeamProfileEditorSimple';
import TeamManagement from './TeamManagement';
import TeamInvitation from './TeamInvitation';
import TeamChallengeCreator from './TeamChallengeCreator';
import { TeamService, Team, TeamMember, TeamStats, TeamActivity, TeamChallenge, JoinRequest } from '../services/teamService';
import { useAuth } from './AuthProvider';
import OfflineManager from '../utils/offlineManager';

const { width, height } = Dimensions.get('window');

interface AdvancedTeamCommunitiesProps {
  onBack: () => void;
}

export default function AdvancedTeamCommunities({ onBack }: AdvancedTeamCommunitiesProps) {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('teams');
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showJoinRequest, setShowJoinRequest] = useState(false);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [showTeamInvitation, setShowTeamInvitation] = useState(false);
  const [showChallengeCreator, setShowChallengeCreator] = useState(false);
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
  const [isOffline, setIsOffline] = useState(false);

  // Advanced features state
  const [friendCompetitions, setFriendCompetitions] = useState<any[]>([]);
  const [personalRecords, setPersonalRecords] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<any[]>([]);
  const [friendActivities, setFriendActivities] = useState<any[]>([]);
  const [showCompetitionModal, setShowCompetitionModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

  const tabs = [
    { id: 'teams', name: 'Teams', icon: 'people' },
    { id: 'challenges', name: 'Challenges', icon: 'trophy' },
    { id: 'competitions', name: 'Competitions', icon: 'medal' },
    { id: 'notifications', name: 'Notifications', icon: 'notifications' },
    { id: 'leaderboard', name: 'Leaderboard', icon: 'podium' },
    { id: 'discover', name: 'Discover', icon: 'compass' }
  ];

  // Load data functions
  const loadTeams = async () => {
    try {
      console.log('Loading teams...');
      const teamsData = await TeamService.getTeams(50, 0);
      console.log('Loaded teams:', teamsData);
      setTeams(teamsData);
      
      // Generate state teams if no teams exist
      if (teamsData.length === 0) {
        console.log('No teams found, generating state teams...');
        const success = await TeamService.generateStateTeams();
        if (success) {
          console.log('State teams generated, reloading...');
          const updatedTeams = await TeamService.getTeams(50, 0);
          setTeams(updatedTeams);
        }
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      setTeams([]);
    }
  };

  const createStateTeams = async () => {
    const states = [
      { name: 'California Fitness', state: 'CA', description: 'Join California\'s premier fitness community!', category: 'General' },
      { name: 'Texas Strength', state: 'TX', description: 'Everything\'s bigger in Texas, including our gains!', category: 'Strength' },
      { name: 'Florida Beach Body', state: 'FL', description: 'Stay beach-ready year-round with Florida fitness!', category: 'Cardio' },
      { name: 'New York Hustle', state: 'NY', description: 'Fast-paced workouts for the city that never sleeps!', category: 'HIIT' },
      { name: 'Illinois Power', state: 'IL', description: 'Building strength in the Windy City!', category: 'Powerlifting' },
      { name: 'Pennsylvania Pride', state: 'PA', description: 'Proud to be fit in the Keystone State!', category: 'General' },
      { name: 'Ohio Athletics', state: 'OH', description: 'Buckeye state athletes unite!', category: 'Sports' },
      { name: 'Georgia Gains', state: 'GA', description: 'Peach state fitness at its finest!', category: 'General' },
      { name: 'North Carolina Champions', state: 'NC', description: 'First in fitness, first in health!', category: 'CrossFit' },
      { name: 'Michigan Muscle', state: 'MI', description: 'Great Lakes, great gains!', category: 'Bodybuilding' },
      { name: 'Arizona Desert Fitness', state: 'AZ', description: 'Thriving in the desert heat!', category: 'Outdoor' },
      { name: 'Washington Warriors', state: 'WA', description: 'Evergreen state, ever-growing strength!', category: 'General' },
      { name: 'Massachusetts Masters', state: 'MA', description: 'Revolutionary fitness in the Bay State!', category: 'General' },
      { name: 'Tennessee Titans', state: 'TN', description: 'Music City muscle and motivation!', category: 'General' },
      { name: 'Indiana Iron', state: 'IN', description: 'Hoosier state strength and determination!', category: 'Strength' },
      { name: 'Missouri Movement', state: 'MO', description: 'Show me state fitness excellence!', category: 'General' },
      { name: 'Maryland Momentum', state: 'MD', description: 'Crab state cardio and strength!', category: 'General' },
      { name: 'Wisconsin Winners', state: 'WI', description: 'Cheese state champions of fitness!', category: 'General' },
      { name: 'Colorado Climbers', state: 'CO', description: 'Mile high fitness adventures!', category: 'Outdoor' },
      { name: 'Minnesota Muscle', state: 'MN', description: 'Land of 10,000 lakes, unlimited gains!', category: 'General' }
    ];

    try {
      for (const stateTeam of states) {
        const teamData = {
          name: stateTeam.name,
          description: stateTeam.description,
          category: stateTeam.category,
          level: 'All Levels' as const,
          privacy: 'Public' as const,
          max_members: 100,
          color_theme: ['#10B981', '#059669'],
          badges: [`${stateTeam.state} State Team`],
      rules: [
            'Be respectful to all team members',
            'Encourage and support each other',
            'Share your fitness journey',
            'Stay active and engaged'
          ]
        };

        // Create team with a system admin user ID (we'll use a placeholder)
        const systemAdminId = '00000000-0000-0000-0000-000000000000';
        await TeamService.createTeam(teamData, systemAdminId);
      }
      console.log('State teams created successfully');
    } catch (error) {
      console.error('Error creating state teams:', error);
    }
  };

  const loadMyTeams = async () => {
    if (!user) {
      console.log('loadMyTeams: No user found');
      return;
    }
    try {
      console.log('loadMyTeams: Loading teams for user:', user.id);
      const myTeamsData = await TeamService.getUserTeams(user.id);
      console.log('loadMyTeams: Received teams data:', myTeamsData);
      console.log('loadMyTeams: Number of teams:', myTeamsData?.length || 0);
      console.log('loadMyTeams: Setting myTeams state with:', myTeamsData);
      setMyTeams(myTeamsData);
      console.log('loadMyTeams: State set, myTeams should now be:', myTeamsData?.length || 0);
    } catch (error) {
      console.error('Error loading my teams:', error);
      setMyTeams([]);
    }
  };

  const loadTeamDetails = async (teamId: string) => {
    try {
      const [members, stats, activities, challenges] = await Promise.all([
        TeamService.getTeamMembers(teamId),
        TeamService.getTeamStats(teamId),
        TeamService.getTeamActivity(teamId, 10),
        TeamService.getTeamChallenges(teamId)
      ]);
      
      setTeamMembers(members);
      setTeamStats(stats);
      setTeamActivities(activities);
      setTeamChallenges(challenges);
    } catch (error) {
      console.error('Error loading team details:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const leaderboardData = await TeamService.getGlobalLeaderboard(10);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  // Advanced features data loading
  const loadFriendCompetitions = async () => {
    if (!user || !selectedTeam) return;
    try {
      const competitions = await TeamService.getFriendCompetitions(selectedTeam.id, user.id);
      setFriendCompetitions(competitions);
    } catch (error) {
      console.error('Error loading friend competitions:', error);
      setFriendCompetitions([]);
    }
  };

  const loadPersonalRecords = async () => {
    if (!selectedTeam) return;
    try {
      const records = await TeamService.getPersonalRecords(selectedTeam.id, user?.id);
      setPersonalRecords(records);
    } catch (error) {
      console.error('Error loading personal records:', error);
      setPersonalRecords([]);
    }
  };

  const loadNotifications = async () => {
    if (!user || !selectedTeam) return;
    try {
      const notifs = await TeamService.getNotifications(selectedTeam.id, user.id);
      setNotifications(notifs);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  const loadWeeklyChallenges = async () => {
    if (!selectedTeam) return;
    try {
      const challenges = await TeamService.getWeeklyChallenges(selectedTeam.id);
      setWeeklyChallenges(challenges);
    } catch (error) {
      console.error('Error loading weekly challenges:', error);
      setWeeklyChallenges([]);
    }
  };

  const loadFriendActivities = async () => {
    if (!selectedTeam) return;
    try {
      const activities = await TeamService.getFriendActivities(selectedTeam.id);
      setFriendActivities(activities);
    } catch (error) {
      console.error('Error loading friend activities:', error);
      setFriendActivities([]);
    }
  };

  const loadJoinRequests = async (teamId: string) => {
    try {
      const requests = await TeamService.getJoinRequests(teamId);
      setJoinRequests(requests);
    } catch (error) {
      console.error('Error loading join requests:', error);
    }
  };

  const loadAllData = useCallback(async () => {
    console.log('loadAllData: Starting to load all data...');
    setLoading(true);
    try {
      console.log('loadAllData: Calling loadTeams, loadMyTeams, loadLeaderboard...');
      await Promise.all([
        loadTeams(),
        loadMyTeams(),
        loadLeaderboard()
      ]);
      console.log('loadAllData: All data loaded successfully');
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

  // Team action handlers
  const handleJoinTeam = async (teamId: string) => {
    if (!user) return;
    
    try {
      const success = await TeamService.joinTeam(teamId, user.id);
      if (success) {
        Alert.alert('Success', 'You have joined the team!');
        loadMyTeams();
        loadTeams();
      } else {
        Alert.alert('Error', 'Failed to join team. Please try again.');
      }
    } catch (error) {
      console.error('Error joining team:', error);
      Alert.alert('Error', 'Failed to join team. Please try again.');
    }
  };

  const handleJoinRequest = async (teamId: string) => {
    if (!user) return;
    
    try {
      const success = await TeamService.createJoinRequest(teamId, user.id);
      if (success) {
        Alert.alert('Request Sent', 'Your join request has been sent to the team admins.');
      } else {
        Alert.alert('Error', 'Failed to send join request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending join request:', error);
      Alert.alert('Error', 'Failed to send join request. Please try again.');
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!user) return;
    
    Alert.alert(
      'Leave Team',
      'Are you sure you want to leave this team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await TeamService.leaveTeam(teamId, user.id);
              if (success) {
                Alert.alert('Success', 'You have left the team.');
                loadMyTeams();
                loadTeams();
              } else {
                Alert.alert('Error', 'Failed to leave team. Please try again.');
              }
            } catch (error) {
              console.error('Error leaving team:', error);
              Alert.alert('Error', 'Failed to leave team. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleCreateTeam = async (teamData: any) => {
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
        await Promise.all([
          loadMyTeams(),
          loadTeams()
        ]);
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

  const handleApproveRequest = async (requestId: string) => {
    try {
      const success = await TeamService.approveJoinRequest(requestId);
      if (success) {
        Alert.alert('Success', 'Join request approved!');
        loadJoinRequests(selectedTeam?.id || '');
        loadTeamDetails(selectedTeam?.id || '');
      } else {
        Alert.alert('Error', 'Failed to approve request. Please try again.');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      Alert.alert('Error', 'Failed to approve request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const success = await TeamService.rejectJoinRequest(requestId);
      if (success) {
        Alert.alert('Request Rejected', 'Join request has been rejected.');
        loadJoinRequests(selectedTeam?.id || '');
      } else {
        Alert.alert('Error', 'Failed to reject request. Please try again.');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', 'Failed to reject request. Please try again.');
    }
  };

  useEffect(() => {
    console.log('useEffect: Component mounted, calling loadAllData...');
    // Load initial data
    loadAllData();
    
    // Monitor offline status
    const offlineManager = OfflineManager.getInstance();
    const unsubscribe = offlineManager.addListener ? offlineManager.addListener((isOnline) => {
      setIsOffline(!isOnline);
    }) : () => {};

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

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [loadAllData]);

  const renderTeamCard = (team: Team) => {
    const isMyTeam = myTeams.some(t => t.id === team.id);
    const userRole = teamMembers.find(m => m.team_id === team.id && m.user_id === user?.id)?.role;
    
    return (
    <Animated.View
      key={team.id}
      style={[
        styles.teamCard,
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
        <LinearGradient colors={team.color_theme as [string, string] || ['#10B981', '#059669']} style={styles.teamGradient}>
        <View style={styles.teamHeader}>
          <View style={styles.teamImageContainer}>
              {team.team_image ? (
                <Image source={{ uri: team.team_image }} style={styles.teamImage} />
            ) : (
              <View style={styles.teamImagePlaceholder}>
                <Text style={styles.teamImageText}>{team.name.charAt(0)}</Text>
              </View>
            )}
          </View>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamDescription}>{team.description}</Text>
            <View style={styles.teamMeta}>
              <View style={styles.teamBadge}>
                <Text style={styles.teamBadgeText}>{team.category}</Text>
              </View>
              <View style={styles.teamBadge}>
                <Text style={styles.teamBadgeText}>{team.level}</Text>
              </View>
              <View style={styles.teamBadge}>
                <Text style={styles.teamBadgeText}>{team.privacy}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.teamActionButton}
            onPress={() => {
              setSelectedTeam(team);
                loadTeamDetails(team.id);
              setShowTeamDetails(true);
            }}
          >
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.teamStats}>
          <View style={styles.teamStat}>
            <Ionicons name="people" size={16} color="white" />
              <Text style={styles.teamStatText}>
                {teamStats?.total_members || 0}/{team.max_members}
              </Text>
          </View>
          <View style={styles.teamStat}>
            <Ionicons name="trophy" size={16} color="white" />
              <Text style={styles.teamStatText}>
                {teamStats?.team_streak || 0} day streak
              </Text>
          </View>
          <View style={styles.teamStat}>
            <Ionicons name="flame" size={16} color="white" />
              <Text style={styles.teamStatText}>
                {teamStats?.total_calories_burned?.toLocaleString() || 0} cal
              </Text>
          </View>
        </View>

        <View style={styles.teamActions}>
            {isMyTeam ? (
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={() => handleLeaveTeam(team.id)}
              >
                <Text style={styles.leaveButtonText}>Leave Team</Text>
              </TouchableOpacity>
            ) : team.privacy === 'Private' ? (
            <TouchableOpacity
              style={styles.requestButton}
                onPress={() => handleJoinRequest(team.id)}
            >
              <Text style={styles.requestButtonText}>Request to Join</Text>
            </TouchableOpacity>
          ) : (
              <TouchableOpacity 
                style={styles.joinButton}
                onPress={() => handleJoinTeam(team.id)}
              >
              <Text style={styles.joinButtonText}>Join Team</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
  };

  const renderTeamDetails = () => {
    if (!selectedTeam) return null;

    return (
      <Modal
        visible={showTeamDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTeamDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTeam.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowTeamDetails(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Team Info */}
              <View style={styles.teamDetailsSection}>
                <Text style={styles.sectionTitle}>Team Information</Text>
                <Text style={styles.teamDescription}>{selectedTeam.description}</Text>
                <View style={styles.teamDetailsMeta}>
                  <View style={styles.detailItem}>
                    <Ionicons name="people" size={16} color="#10B981" />
                    <Text style={styles.detailText}>{teamMembers.length} members</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="shield" size={16} color="#10B981" />
                    <Text style={styles.detailText}>{selectedTeam.privacy}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="star" size={16} color="#10B981" />
                    <Text style={styles.detailText}>{selectedTeam.level}</Text>
                  </View>
                </View>
              </View>

              {/* Team Rules */}
              <View style={styles.teamDetailsSection}>
                <Text style={styles.sectionTitle}>Team Rules</Text>
                {selectedTeam.rules.map((rule, index) => (
                  <View key={index} style={styles.ruleItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.ruleText}>{rule}</Text>
                  </View>
                ))}
              </View>

              {/* Recent Activity */}
              <View style={styles.teamDetailsSection}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {teamActivities.map((activity, index) => (
                  <View key={index} style={styles.activityItem}>
                    <View style={styles.activityAvatar}>
                      <Text style={styles.activityAvatarText}>
                        {activity.user?.email?.split('@')[0]?.split('.').map((n: string) => n[0]).join('') || 'U'}
                      </Text>
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityText}>
                        <Text style={styles.activityUser}>{activity.user?.email?.split('@')[0] || 'User'}</Text> {activity.description}
                      </Text>
                      <Text style={styles.activityTime}>{new Date(activity.created_at).toLocaleTimeString()}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Team Stats */}
              <View style={styles.teamDetailsSection}>
                <Text style={styles.sectionTitle}>Team Statistics</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{teamStats?.total_workouts || 0}</Text>
                    <Text style={styles.statLabel}>Total Workouts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{teamStats?.avg_workouts_per_week || 0}</Text>
                    <Text style={styles.statLabel}>Avg/Week</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{teamStats?.team_streak || 0}</Text>
                    <Text style={styles.statLabel}>Day Streak</Text>
                  </View>
                </View>
              </View>

              {/* Admin Controls */}
              {teamMembers.find(m => m.team_id === selectedTeam.id && m.user_id === user?.id)?.role === 'Admin' && (
                <View style={styles.teamDetailsSection}>
                  <Text style={styles.sectionTitle}>Admin Controls</Text>
                  <TouchableOpacity 
                    style={styles.adminButton}
                    onPress={() => {
                      setShowTeamDetails(false);
                      setShowTeamManagement(true);
                    }}
                  >
                    <Ionicons name="people" size={20} color="#10B981" />
                    <Text style={styles.adminButtonText}>Manage Members</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.adminButton}
                    onPress={() => {
                      setShowTeamDetails(false);
                      setShowChallengeCreator(true);
                    }}
                  >
                    <Ionicons name="trophy" size={20} color="#10B981" />
                    <Text style={styles.adminButtonText}>Create Challenge</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.adminButton}
                    onPress={() => {
                      setShowTeamDetails(false);
                      setShowTeamInvitation(true);
                    }}
                  >
                    <Ionicons name="person-add" size={20} color="#10B981" />
                    <Text style={styles.adminButtonText}>Invite Members</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderChallenge = (challenge: any) => (
    <Animated.View
      key={challenge.id}
      style={[
        styles.challengeCard,
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
      <LinearGradient colors={challenge.color} style={styles.challengeGradient}>
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeTeam}>{challenge.team}</Text>
        </View>
        <Text style={styles.challengeDescription}>{challenge.description}</Text>
        <View style={styles.challengeStats}>
          <View style={styles.challengeStat}>
            <Ionicons name="people" size={16} color="white" />
            <Text style={styles.challengeStatText}>{challenge.participants} participants</Text>
          </View>
          <View style={styles.challengeStat}>
            <Ionicons name="time" size={16} color="white" />
            <Text style={styles.challengeStatText}>{challenge.duration}</Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${challenge.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{challenge.progress}% Complete</Text>
        </View>
        <TouchableOpacity style={styles.joinChallengeButton}>
          <Text style={styles.joinChallengeButtonText}>Join Challenge</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );

  const renderLeaderboardItem = (item: any) => (
    <Animated.View
      key={item.rank}
      style={[
        styles.leaderboardItem,
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
      <View style={styles.rankContainer}>
        <Text style={[styles.rank, item.rank <= 3 && styles.topRank]}>{item.rank}</Text>
      </View>
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.team}</Text>
        <Text style={styles.teamCategory}>{item.category} • {item.members} members</Text>
      </View>
      <Text style={styles.teamPoints}>{item.points.toLocaleString()}</Text>
    </Animated.View>
  );

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading teams...</Text>
        </View>
      );
    }

    // Render functions for advanced features
    const renderCompetitionCard = (competition: any) => (
      <View key={competition.id} style={styles.competitionCard}>
        <LinearGradient colors={['#10B981', '#059669']} style={styles.competitionGradient}>
          <View style={styles.competitionHeader}>
            <Ionicons name="medal" size={24} color="#FFFFFF" />
            <Text style={styles.competitionTitle}>
              {competition.competition_type.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View style={styles.competitionScores}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>You</Text>
              <Text style={styles.scoreValue}>{competition.user1_score}</Text>
            </View>
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Friend</Text>
              <Text style={styles.scoreValue}>{competition.user2_score}</Text>
            </View>
          </View>
          <View style={styles.competitionFooter}>
            <Text style={styles.competitionTime}>
              {new Date(competition.end_date).toLocaleDateString()}
            </Text>
            <TouchableOpacity style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );

    const renderNotificationCard = (notification: any) => (
      <TouchableOpacity 
        key={notification.id} 
        style={[
          styles.notificationCard,
          !notification.is_read && styles.unreadNotification
        ]}
        onPress={() => markNotificationAsRead(notification.id)}
      >
        <View style={styles.notificationIcon}>
          <Ionicons 
            name={
              notification.type === 'pr_achieved' ? 'trophy' :
              notification.type === 'friend_activity' ? 'person' :
              notification.type === 'challenge_update' ? 'trophy' :
              'notifications'
            } 
            size={20} 
            color="#10B981" 
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationTime}>
            {new Date(notification.created_at).toLocaleTimeString()}
          </Text>
        </View>
        {!notification.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );

    const markNotificationAsRead = async (notificationId: string) => {
      await TeamService.markNotificationAsRead(notificationId);
      loadNotifications();
    };

    const markAllNotificationsAsRead = async () => {
      for (const notification of notifications) {
        if (!notification.is_read) {
          await TeamService.markNotificationAsRead(notification.id);
        }
      }
      loadNotifications();
    };

    switch (selectedTab) {
      case 'teams':
        return (
          <View style={styles.tabContent}>
            <View style={styles.teamsHeader}>
              <Text style={styles.sectionTitle}>My Teams</Text>
              <TouchableOpacity
                style={styles.createTeamButton}
                onPress={() => setShowCreateTeam(true)}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.createTeamButtonText}>Create Team</Text>
              </TouchableOpacity>
            </View>
            {(() => {
              console.log('Rendering My Teams section:');
              console.log('myTeams.length:', myTeams.length);
              console.log('myTeams data:', myTeams);
              return myTeams.length > 0 ? (
                myTeams.map(renderTeamCard)
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="people" size={48} color="#6B7280" />
                  <Text style={styles.emptyStateText}>No teams yet</Text>
                  <Text style={styles.emptyStateSubtext}>Create or join a team to get started</Text>
                </View>
              );
            })()}
          </View>
        );
      case 'challenges':
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.challengesContainer}>
              {teamChallenges.length > 0 ? (
                teamChallenges.map(renderChallenge)
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="trophy" size={48} color="#6B7280" />
                  <Text style={styles.emptyStateText}>No challenges yet</Text>
                  <Text style={styles.emptyStateSubtext}>Join a team to see challenges</Text>
                </View>
              )}
            </View>
          </ScrollView>
        );
      case 'leaderboard':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Global Leaderboard</Text>
            {leaderboard.length > 0 ? (
              leaderboard.map((item, index) => renderLeaderboardItem({ ...item, rank: index + 1 }))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="podium" size={48} color="#6B7280" />
                <Text style={styles.emptyStateText}>No leaderboard data</Text>
                <Text style={styles.emptyStateSubtext}>Teams will appear here as they compete</Text>
              </View>
            )}
          </View>
        );
      case 'discover':
        return (
          <View style={styles.tabContent}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search teams..."
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.searchButton}>
                <Ionicons name="search" size={20} color="#10B981" />
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionTitle}>Discover Teams</Text>
            {teams.length > 0 ? (
              teams.map(renderTeamCard)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="compass" size={48} color="#6B7280" />
                <Text style={styles.emptyStateText}>No teams found</Text>
                <Text style={styles.emptyStateSubtext}>Try adjusting your search</Text>
              </View>
            )}
          </View>
        );
      case 'competitions':
        return (
          <View style={styles.tabContent}>
            <View style={styles.competitionsHeader}>
              <Text style={styles.sectionTitle}>Friend Competitions</Text>
              <TouchableOpacity
                style={styles.createCompetitionButton}
                onPress={() => setShowCompetitionModal(true)}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.createCompetitionButtonText}>Challenge Friend</Text>
              </TouchableOpacity>
            </View>
            {friendCompetitions.length > 0 ? (
              friendCompetitions.map(renderCompetitionCard)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="medal" size={48} color="#6B7280" />
                <Text style={styles.emptyStateText}>No competitions yet</Text>
                <Text style={styles.emptyStateSubtext}>Challenge a friend to get started</Text>
              </View>
            )}
          </View>
        );
      case 'notifications':
        return (
          <View style={styles.tabContent}>
            <View style={styles.notificationsHeader}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <TouchableOpacity
                style={styles.markAllReadButton}
                onPress={() => markAllNotificationsAsRead()}
              >
                <Text style={styles.markAllReadText}>Mark All Read</Text>
              </TouchableOpacity>
            </View>
            {notifications.length > 0 ? (
              notifications.map(renderNotificationCard)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="notifications" size={48} color="#6B7280" />
                <Text style={styles.emptyStateText}>No notifications</Text>
                <Text style={styles.emptyStateSubtext}>You'll get notified when friends are active</Text>
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  console.log('AdvancedTeamCommunities: Component rendering...');
  console.log('AdvancedTeamCommunities: myTeams state:', myTeams);
  console.log('AdvancedTeamCommunities: myTeams.length:', myTeams.length);
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.pageTitle}>Team Communities</Text>
          <Text style={styles.pageSubtitle}>Connect, compete, and grow together</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={20} color="white" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>3</Text>
          </View>
        </TouchableOpacity>
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

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="wifi" size={16} color="#F59E0B" />
            <Text style={styles.offlineText}>Offline Mode - Some features may be limited</Text>
          </View>
        )}
        {renderTabContent()}
      </ScrollView>

      {/* Team Details Modal */}
      {renderTeamDetails()}

      {/* Team Profile Editor Modal */}
      <TeamProfileEditorSimple
        visible={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        onSave={handleCreateTeam}
      />

      {/* Team Management Modal */}
      {selectedTeam && (
        <TeamManagement
          team={selectedTeam}
          onClose={() => {
            setShowTeamManagement(false);
            setSelectedTeam(null);
          }}
          onUpdateTeam={(updatedTeam) => {
            setSelectedTeam(updatedTeam);
          }}
        />
      )}

      {/* Team Invitation Modal */}
      <TeamInvitation
        visible={showTeamInvitation}
        onClose={() => setShowTeamInvitation(false)}
        onSendInvites={(invites) => {
          console.log('Sending invites to:', invites);
          setShowTeamInvitation(false);
        }}
      />

      {/* Challenge Creator Modal */}
      <TeamChallengeCreator
        visible={showChallengeCreator}
        onClose={() => setShowChallengeCreator(false)}
        onCreateChallenge={(challenge) => {
          console.log('Challenge created:', challenge);
          setShowChallengeCreator(false);
        }}
      />
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
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
  teamsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  createTeamButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  teamCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  teamGradient: {
    padding: 20,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  teamImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    overflow: 'hidden',
  },
  teamImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  teamImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamImageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  teamMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  teamBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teamBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  teamActionButton: {
    padding: 8,
  },
  teamStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  teamStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamStatText: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  teamActions: {
    flexDirection: 'row',
    gap: 12,
  },
  joinButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  requestButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  challengesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  challengeCard: {
    width: width * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: 20,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  challengeTeam: {
    fontSize: 12,
    color: '#E5E7EB',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 16,
  },
  challengeStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeStatText: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#E5E7EB',
  },
  joinChallengeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'center',
  },
  joinChallengeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  topRank: {
    color: '#F59E0B',
  },
  teamCategory: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  teamPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
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
    padding: 20,
  },
  teamDetailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  teamDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
    marginBottom: 16,
  },
  teamDetailsMeta: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  ruleText: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  activityAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  activityUser: {
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  adminButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  privacySection: {
    marginBottom: 24,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  privacyText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  searchButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  offlineText: {
    color: '#F59E0B',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  leaveButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  // Advanced features styles
  competitionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createCompetitionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  createCompetitionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  competitionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  competitionGradient: {
    padding: 20,
  },
  competitionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  competitionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  competitionScores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    flex: 1,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginHorizontal: 16,
  },
  competitionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  competitionTime: {
    fontSize: 12,
    color: '#E5E7EB',
  },
  viewDetailsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  markAllReadButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  markAllReadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  unreadNotification: {
    backgroundColor: '#1F2937',
    borderLeftColor: '#F59E0B',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginLeft: 8,
  },
});
