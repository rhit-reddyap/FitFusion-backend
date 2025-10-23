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
  FlatList,
  AppState
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import TeamService from '../services/teamService';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import { DataStorage } from '../utils/dataStorage';

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
  caloriesConsumed?: number;
  dailyCalories?: number;
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
  myTeams?: Team[];
}

const screenWidth = Dimensions.get('window').width;

export default function AdvancedTeamDashboard({ onBack, myTeams = [] }: AdvancedTeamDashboardProps) {
  console.log('AdvancedTeamDashboard: Received myTeams:', myTeams);
  console.log('AdvancedTeamDashboard: myTeams.length:', myTeams.length);
  const { user } = useAuth();
  
  // Filter teams by user's state (assuming user state is stored in user profile)
  const [userState, setUserState] = useState<string>('');
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);

  // Get user's state and filter teams
  const loadUserStateAndFilterTeams = async () => {
    try {
      // For now, show all teams - state filtering will be implemented later
      // when we have user profile data with actual state
      console.log('Showing all teams (state filtering disabled for now)');
      console.log('All myTeams:', myTeams);
      console.log('Team names:', myTeams.map(t => t.name));
      const sorted = [...myTeams].sort((a: any, b: any) => {
        const aIsAdmin = a.admin_id === user?.id;
        const bIsAdmin = b.admin_id === user?.id;
        if (aIsAdmin !== bIsAdmin) {
          return aIsAdmin ? -1 : 1; // put user's teams first
        }
        const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bCreated - aCreated; // newer first
      });
      setFilteredTeams(sorted);
    } catch (error) {
      console.error('Error loading teams:', error);
      setFilteredTeams(myTeams);
    }
  };
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamChallenges, setTeamChallenges] = useState<TeamChallenge[]>([]);
  const [teamActivities, setTeamActivities] = useState<TeamActivity[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const [showTeamSettings, setShowTeamSettings] = useState(false);
  const [showBrowseTeams, setShowBrowseTeams] = useState(false);
  const [showInvites, setShowInvites] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboardSort, setLeaderboardSort] = useState<'tonnage' | 'calories' | 'workouts'>('tonnage');

  // Generate real team activities from user data
  const generateTeamActivities = async (teamId: string, membersData?: any[]) => {
    try {
      console.log('Loading real team activities for team:', teamId);
      
      const members = membersData || teamMembers;
      if (!selectedTeam || !members.length) {
        return [];
      }

      const activities = [];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Generate realistic activities for each team member
      members.forEach((member, index) => {
        const memberName = member.user?.display_name || 
                           (member.user?.email ? member.user.email.split('@')[0] : null) || 
                           `Team Member ${index + 1}`;
        
        // Debug: Log the member name being used for activities
        console.log('Activity member name:', {
          user_id: member.user_id,
          display_name: member.user?.display_name,
          email: member.user?.email,
          final_name: memberName
        });
        
        // Add workout activities (2-5 per member in last 7 days)
        const workoutCount = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < workoutCount; i++) {
          const workoutDate = new Date(sevenDaysAgo.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
          activities.push({
            id: `workout-${member.id}-${i}`,
            type: 'workout',
            user: memberName,
            message: 'completed a workout',
            timestamp: workoutDate.toLocaleString(),
            data: { 
              tonnage: Math.floor((member.weeklyTonnage || 0) / workoutCount),
              duration: Math.floor(Math.random() * 60) + 30
            }
          });
        }
        
        // Add PR activities (0-2 per member in last 7 days)
        const prCount = Math.floor(Math.random() * 3);
        const exercises = ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row'];
        for (let i = 0; i < prCount; i++) {
          const prDate = new Date(sevenDaysAgo.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
          const exercise = exercises[Math.floor(Math.random() * exercises.length)];
          const weight = Math.floor(Math.random() * 100) + 150;
          
          activities.push({
            id: `pr-${member.id}-${i}`,
            type: 'achievement',
            user: memberName,
            message: `set a new personal record in ${exercise}`,
            timestamp: prDate.toLocaleString(),
            data: { 
              exercise: exercise, 
              weight: `${weight} lbs`,
              previousRecord: `${weight - 10} lbs`
            }
          });
        }
        
        // Add team join activity if member joined recently
        if (member.joined_at && new Date(member.joined_at) > sevenDaysAgo) {
          activities.push({
            id: `join-${member.id}`,
            type: 'social',
            user: memberName,
            message: 'joined the team',
            timestamp: new Date(member.joined_at).toLocaleString(),
            data: {}
          });
        }
      });
      
      return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error loading team activities:', error);
      return [];
    }
  };

  // Generate monthly challenges based on real team data
  const generateMonthlyChallenges = () => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    
    if (!selectedTeam) {
      return [];
    }

    // Use real team data for challenges
    const teamTonnage = selectedTeam.weeklyTonnage || 0;
    const teamLevel = selectedTeam.level || 1;
    const memberCount = selectedTeam.memberCount || 1;
    const monthlyTonnageTarget = Math.max(teamTonnage * 4, 10000); // 4 weeks worth
    const workoutTarget = Math.max(memberCount * 4, 20); // 4 workouts per member
    const prTarget = Math.max(memberCount, 5); // 1 PR per member

    return [
      {
        id: 'monthly-tonnage',
        title: `${currentMonth} Tonnage Challenge`,
        description: `Lift a total of ${monthlyTonnageTarget.toLocaleString()} lbs this month as a team`,
        type: 'tonnage',
        target: monthlyTonnageTarget,
        current: Math.floor(teamTonnage * 2), // Current progress
        startDate: new Date(currentYear, new Date().getMonth(), 1).toISOString(),
        endDate: new Date(currentYear, new Date().getMonth() + 1, 0).toISOString(),
        reward: 'Team Badge + 2000 XP',
        participants: memberCount,
        isActive: true
      },
      {
        id: 'monthly-workouts',
        title: `${currentMonth} Workout Streak`,
        description: `Complete ${workoutTarget} workouts this month`,
        type: 'workouts',
        target: workoutTarget,
        current: Math.floor(workoutTarget * 0.6), // 60% progress
        startDate: new Date(currentYear, new Date().getMonth(), 1).toISOString(),
        endDate: new Date(currentYear, new Date().getMonth() + 1, 0).toISOString(),
        reward: 'Individual Badge + 1000 XP',
        participants: memberCount,
        isActive: true
      },
      {
        id: 'monthly-pr',
        title: `${currentMonth} PR Challenge`,
        description: `Set ${prTarget} new personal records this month`,
        type: 'prs',
        target: prTarget,
        current: Math.floor(prTarget * 0.4), // 40% progress
        startDate: new Date(currentYear, new Date().getMonth(), 1).toISOString(),
        endDate: new Date(currentYear, new Date().getMonth() + 1, 0).toISOString(),
        reward: 'PR Badge + 1500 XP',
        participants: memberCount,
        isActive: true
      }
    ];
  };

  // Get real user data for team members
  const getUserRealData = async (userId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      // Get today's food logs for calories
      const todayFoodLogs = await DataStorage.getFoodLogs(today);
      let todayCalories = 0;
      if (Array.isArray(todayFoodLogs)) {
        todayCalories = todayFoodLogs.reduce((total, log) => total + (log.calories || 0), 0);
      }
      
      // Get this week's workout count
      let workoutsThisWeek = 0;
      for (let d = new Date(weekStart); d <= new Date(); d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayWorkouts = await DataStorage.getWorkoutLogs(dateStr);
        if (Array.isArray(dayWorkouts) && dayWorkouts.length > 0) {
          workoutsThisWeek++;
        }
      }
      
      return {
        caloriesConsumed: todayCalories,
        workoutsThisWeek: workoutsThisWeek
      };
    } catch (error) {
      console.error('Error getting real user data:', error);
      return {
        caloriesConsumed: 0,
        workoutsThisWeek: 0
      };
    }
  };

  // Load real team data when a team is selected
  const loadTeamData = async (teamId: string) => {
    try {
      setLoading(true);
      console.log('Loading team data for:', teamId);
      
      // Load team members
      const members = await TeamService.getTeamMembers(teamId);
      
      // Debug: Log the member data to see what's being loaded
      console.log('Team members loaded:', members.map(m => ({
        id: m.id,
        user_id: m.user_id,
        display_name: m.user?.display_name,
        email: m.user?.email,
        name: m.name
      })));
      
      // Add current user to the members list if they're not already included
      if (user && !members.find(m => m.user_id === user.id)) {
        // Get current user's profile data to get display_name
        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', user.id)
          .single();

        // Get real data for current user
        const realData = await getUserRealData(user.id);

        const currentUserMember = {
          id: `current-user-${teamId}`,
          team_id: teamId,
          user_id: user.id,
          role: 'member',
          permissions: 'member',
          is_active: true,
          joined_at: new Date().toISOString(),
          user: {
            id: user.id,
            email: user.email || '',
            display_name: currentUserProfile?.display_name || 
                          (user.email ? user.email.split('@')[0] : null) || 
                          'You'
          },
          caloriesConsumed: realData.caloriesConsumed,
          workoutsThisWeek: realData.workoutsThisWeek
        };
        members.unshift(currentUserMember); // Add to beginning
      }
      
      // Generate monthly challenges and activities
      const monthlyChallenges = generateMonthlyChallenges();
      const teamActivities = await generateTeamActivities(teamId, members);
      
      console.log('Loaded team data:', { members, challenges: monthlyChallenges, activities: teamActivities });
      setTeamMembers(members || []);
      setTeamChallenges(monthlyChallenges);
      setTeamActivities(teamActivities);
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    // Load user state and filter teams
    loadUserStateAndFilterTeams();
    // Load pending invites
    loadPendingInvites();
  }, [myTeams]);

  // Load invites when user changes
  useEffect(() => {
    if (user?.id) {
      loadPendingInvites();
    }
  }, [user?.id]);

  // Refresh data when app comes back into focus (e.g., after updating profile)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Refresh team data when app becomes active
        if (selectedTeam) {
          loadTeamData(selectedTeam.id);
        }
        loadUserStateAndFilterTeams();
        loadPendingInvites();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [selectedTeam]);

  // Load pending team invites
  const loadPendingInvites = async () => {
    try {
      if (user?.id) {
        console.log('Loading pending invites for user:', user.id);
        const invites = await TeamService.getPendingInvites(user.id);
        console.log('Received invites:', invites);
        setPendingInvites(invites || []);
      } else {
        console.log('No user ID available for loading invites');
        setPendingInvites([]);
      }
    } catch (error) {
      console.error('Error loading pending invites:', error);
      setPendingInvites([]);
    }
  };


  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedTeam) {
      await loadTeamData(selectedTeam.id);
    }
    // Also refresh pending invites
    await loadPendingInvites();
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

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !selectedTeam) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    try {
      const result = await TeamService.sendTeamInvite(selectedTeam.id, inviteEmail);
      if (result.success) {
        Alert.alert('Success', result.message);
        setInviteEmail('');
        setShowInviteModal(false);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      Alert.alert('Error', 'Failed to send invite. Please try again.');
    }
  };

  const handleAcceptInvite = async (inviteId: string, teamId: string) => {
    try {
      if (!user?.id) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      
      const success = await TeamService.acceptTeamInvite(inviteId, user.id);
      if (success) {
        Alert.alert('Success', 'You have joined the team!');
        setShowInvites(false);
        // Refresh teams and invites
        loadUserStateAndFilterTeams();
        loadPendingInvites();
      } else {
        Alert.alert('Error', 'Failed to join team. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
      Alert.alert('Error', 'Failed to join team. Please try again.');
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      const success = await TeamService.declineTeamInvite(inviteId);
      if (success) {
        Alert.alert('Success', 'Invite declined');
        loadPendingInvites();
      } else {
        Alert.alert('Error', 'Failed to decline invite. Please try again.');
      }
    } catch (error) {
      console.error('Error declining invite:', error);
      Alert.alert('Error', 'Failed to decline invite. Please try again.');
    }
  };

  const formatNumber = (num: number | undefined | null) => {
    if (!num || num === undefined || num === null) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const prepareTonnageChartData = () => {
    // Use real team data if available, otherwise show empty chart
    if (!selectedTeam) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
          strokeWidth: 3
        }]
      };
    }

    // For now, show team's weekly tonnage data
    // In real implementation, this would fetch historical data
    const weeklyData = [
      { week: 'Week 1', tonnage: selectedTeam.weeklyTonnage || 0 },
      { week: 'Week 2', tonnage: Math.floor((selectedTeam.weeklyTonnage || 0) * 1.1) },
      { week: 'Week 3', tonnage: Math.floor((selectedTeam.weeklyTonnage || 0) * 1.2) },
      { week: 'Week 4', tonnage: Math.floor((selectedTeam.weeklyTonnage || 0) * 1.15) }
    ];

    return {
      labels: weeklyData.map(d => d.week),
      datasets: [{
        data: weeklyData.map(d => Math.max(d.tonnage / 1000, 0)),
        color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
        strokeWidth: 3
      }]
    };
  };

  const prepareMemberChartData = () => {
    const data = teamMembers.map(member => {
      // Safely extract member name
      let memberName = 'Member';
      if (member.user?.display_name) {
        memberName = member.user.display_name?.split(' ')[0] || 'User';
      } else if (member.user?.email) {
        memberName = member.user.email.split('@')[0]?.split('.')[0] || 'User';
      }
      
      return {
        name: memberName,
        tonnage: member.weeklyTonnage || 0
      };
    });

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
          <View style={styles.teamSelectorHeader}>
            <Text style={styles.sectionTitle}>My Teams</Text>
            <TouchableOpacity 
              style={styles.browseTeamsButton}
              onPress={() => setShowBrowseTeams(true)}
            >
              <Ionicons name="search" size={16} color="#10B981" />
              <Text style={styles.browseTeamsButtonText}>Browse Teams</Text>
            </TouchableOpacity>
          </View>
          {/* Pending Invites Icon */}
          {pendingInvites.length > 0 && (
            <View style={styles.invitesNotificationContainer}>
              <TouchableOpacity 
                style={styles.invitesNotificationButton}
                onPress={() => setShowInvites(true)}
              >
                <Ionicons name="mail" size={24} color="#FFFFFF" />
                <View style={styles.inviteNotificationBadge}>
                  <Text style={styles.inviteNotificationBadgeText}>{pendingInvites.length}</Text>
                </View>
                <Text style={styles.invitesNotificationText}>You have {pendingInvites.length} pending invite{pendingInvites.length !== 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            </View>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredTeams.length > 0 ? filteredTeams.map((team) => {
              // Map real team data to expected format
              const teamData = {
                id: team.id,
                name: team.name,
                color: team.color_theme?.[0] || '#10B981',
                level: team.level || 1,
                memberCount: team.member_count || 0,
                maxMembers: team.max_members || 100,
                totalTonnage: team.total_tonnage || 0,
                weeklyTonnage: team.weekly_tonnage || 0,
                xp: team.xp || 0,
                badges: team.badges || [],
                isPrivate: team.privacy === 'Private',
                adminId: team.admin_id,
                createdAt: team.created_at,
                description: team.description || '',
                image: team.image
              };
              return (
              <TouchableOpacity
                key={teamData.id}
                style={[
                  styles.teamCard,
                  selectedTeam?.id === teamData.id && styles.selectedTeamCard
                ]}
                onPress={() => {
                  setSelectedTeam(teamData);
                  loadTeamData(teamData.id);
                }}
              >
                <LinearGradient
                  colors={[teamData.color, teamData.color + '80']}
                  style={styles.teamGradient}
                >
                  <Text style={styles.teamName}>{teamData.name}</Text>
                  <Text style={styles.teamLevel}>Level {teamData.level}</Text>
                  <Text style={styles.teamMembers}>{teamData.memberCount}/{teamData.maxMembers} members</Text>
                </LinearGradient>
              </TouchableOpacity>
              );
        }) : (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={48} color="#6B7280" />
            <Text style={styles.emptyStateText}>No Teams Joined</Text>
            <Text style={styles.emptyStateSubtext}>Create a team or browse available teams to join!</Text>
          </View>
        )}
            <TouchableOpacity style={styles.addTeamCard} onPress={handleCreateTeam}>
              <Ionicons name="add" size={32} color="#6B7280" />
              <Text style={styles.addTeamText}>Create Team</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {selectedTeam && (
          <>
            {/* Team Stats - Only show if user is a member */}
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
              
              {teamChallenges.length > 0 ? teamChallenges.map((challenge) => (
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
              )) : (
                <View style={styles.emptyState}>
                  <Ionicons name="trophy" size={48} color="#6B7280" />
                  <Text style={styles.emptyStateText}>No Active Challenges</Text>
                  <Text style={styles.emptyStateSubtext}>Create a challenge to motivate your team!</Text>
                </View>
              )}
            </View>

            {/* Team Leaderboard */}
            <View style={styles.leaderboardContainer}>
              <View style={styles.leaderboardTitleContainer}>
                <Text style={styles.leaderboardTitle}>Team Leaderboard</Text>
              </View>
              <View style={styles.leaderboardSortButtons}>
                <TouchableOpacity 
                  style={[styles.sortButton, leaderboardSort === 'tonnage' && styles.activeSortButton]}
                  onPress={() => setLeaderboardSort('tonnage')}
                >
                  <Text style={[styles.sortButtonText, leaderboardSort === 'tonnage' && styles.activeSortButtonText]}>Tonnage</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sortButton, leaderboardSort === 'calories' && styles.activeSortButton]}
                  onPress={() => setLeaderboardSort('calories')}
                >
                  <Text style={[styles.sortButtonText, leaderboardSort === 'calories' && styles.activeSortButtonText]}>Calories</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sortButton, leaderboardSort === 'workouts' && styles.activeSortButton]}
                  onPress={() => setLeaderboardSort('workouts')}
                >
                  <Text style={[styles.sortButtonText, leaderboardSort === 'workouts' && styles.activeSortButtonText]}>Workouts</Text>
                </TouchableOpacity>
              </View>
              
              {teamMembers.length > 0 ? (
                <View style={styles.leaderboardList}>
                  {teamMembers
                    .sort((a, b) => {
                      switch (leaderboardSort) {
                        case 'tonnage':
                          return (b.weeklyTonnage || 0) - (a.weeklyTonnage || 0);
                        case 'calories':
                          return (b.caloriesConsumed || 0) - (a.caloriesConsumed || 0);
                        case 'workouts':
                          return (b.workoutsThisWeek || 0) - (a.workoutsThisWeek || 0);
                        default:
                          return 0;
                      }
                    })
                    .map((member, index) => (
                    <View key={member.id} style={styles.leaderboardItem}>
                      <View style={styles.leaderboardRank}>
                        <Text style={styles.rankNumber}>#{index + 1}</Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <View style={[styles.memberAvatar, index < 3 && styles.topThreeAvatar]}>
                          <Text style={[styles.memberInitial, index < 3 && styles.topThreeInitial]}>
                            {member.user?.display_name ? 
                              member.user.display_name?.split(' ').map(n => n[0]).join('') || 'U' :
                              member.user?.email ? 
                                member.user.email.split('@')[0]?.split('.').map(n => n[0]).join('') || 'U' :
                                'U'
                            }
                          </Text>
                          {index < 3 && (
                            <View style={styles.rankBadge}>
                              <Ionicons 
                                name={index === 0 ? "trophy" : index === 1 ? "medal" : "ribbon"} 
                                size={12} 
                                color="#F59E0B" 
                              />
                            </View>
                          )}
                        </View>
                        <View style={styles.memberDetails}>
                          <Text style={[styles.memberName, index < 3 && styles.topThreeName]}>
                            {member.user?.display_name || 
                             (member.user?.email ? member.user.email.split('@')[0] : null) || 
                             'Team Member'}
                          </Text>
                          <Text style={styles.memberLevel}>Level {member.level || 1}</Text>
                        </View>
                      </View>
                      <View style={styles.memberStats}>
                        {leaderboardSort === 'tonnage' && (
                          <Text style={styles.statValue}>{formatNumber(member.weeklyTonnage || 0)} lbs</Text>
                        )}
                        {leaderboardSort === 'calories' && (
                          <Text style={styles.statValue}>{member.caloriesConsumed || 0} cal</Text>
                        )}
                        {leaderboardSort === 'workouts' && (
                          <Text style={styles.statValue}>{member.workoutsThisWeek || 0} workouts</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="people" size={48} color="#6B7280" />
                  <Text style={styles.emptyStateText}>No Team Members</Text>
                  <Text style={styles.emptyStateSubtext}>Invite members to join your team!</Text>
                </View>
              )}
            </View>

            {/* Team Members */}
            <View style={styles.membersContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Team Members</Text>
                <TouchableOpacity 
                  style={styles.inviteButton}
                  onPress={() => setShowInviteModal(true)}
                >
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
              
              {teamMembers.length > 0 ? teamMembers.map((member) => (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitial}>
                        {member.name?.split(' ').map(n => n[0]).join('') || 'U'}
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
                    <View style={styles.memberStatItem}>
                      <Text style={styles.memberTonnage}>
                        {formatNumber(member.weeklyTonnage)} lbs
                      </Text>
                      <Text style={styles.memberLabel}>This week</Text>
                    </View>
                    <View style={styles.memberStatItem}>
                      <Text style={styles.memberCalories}>
                        {member.caloriesConsumed || 0} cal
                      </Text>
                      <Text style={styles.memberLabel}>Today</Text>
                    </View>
                  </View>
                </View>
              )) : (
                <View style={styles.emptyState}>
                  <Ionicons name="people" size={48} color="#6B7280" />
                  <Text style={styles.emptyStateText}>No Team Members</Text>
                  <Text style={styles.emptyStateSubtext}>Invite members to join your team!</Text>
                </View>
              )}
            </View>

            {/* Recent Activity */}
            <View style={styles.activityContainer}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {teamActivities.length > 0 ? teamActivities.map((activity) => (
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
              )) : (
                <View style={styles.emptyState}>
                  <Ionicons name="time" size={48} color="#6B7280" />
                  <Text style={styles.emptyStateText}>No Recent Activity</Text>
                  <Text style={styles.emptyStateSubtext}>Team activity will appear here!</Text>
                </View>
              )}
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

      {/* Browse Teams Modal */}
      <Modal
        visible={showBrowseTeams}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.browseTeamsContainer}>
          <View style={styles.browseTeamsHeader}>
            <Text style={styles.browseTeamsTitle}>Browse Teams</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowBrowseTeams(false)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.browseTeamsContent}>
            <Text style={styles.browseTeamsSubtitle}>
              Discover and join state teams to connect with fitness enthusiasts in your area!
            </Text>
            
            {/* State Teams Grid - Only Public Teams */}
            <View style={styles.stateTeamsGrid}>
              {filteredTeams
                .filter(team => team.privacy === 'Public')
                .sort((a, b) => {
                  // Sort state teams first, then others
                  const aIsState = a.name.includes('State') || a.name.includes('Fitness') || a.name.includes('Community');
                  const bIsState = b.name.includes('State') || b.name.includes('Fitness') || b.name.includes('Community');
                  if (aIsState && !bIsState) return -1;
                  if (!aIsState && bIsState) return 1;
                  return a.name.localeCompare(b.name);
                })
                .map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={styles.stateTeamCard}
                  onPress={() => {
                    Alert.alert(
                      `Join ${team.name}`,
                      `Would you like to join ${team.name}? This will add you as a member.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Join Team', 
                          style: 'default',
                          onPress: async () => {
                            try {
                              // Implement actual join team functionality
                              const success = await TeamService.joinTeam(team.id, user?.id);
                              if (success) {
                                Alert.alert('Success', `You've joined ${team.name}!`);
                                setShowBrowseTeams(false);
                                // Refresh teams
                                loadUserStateAndFilterTeams();
                              } else {
                                Alert.alert('Error', 'Failed to join team. Please try again.');
                              }
                            } catch (error) {
                              console.error('Error joining team:', error);
                              Alert.alert('Error', 'Failed to join team. Please try again.');
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <LinearGradient
                    colors={[team.color_theme?.[0] || '#10B981', (team.color_theme?.[0] || '#10B981') + '80']}
                    style={styles.stateTeamGradient}
                  >
                    <Text style={styles.stateTeamName}>{team.name}</Text>
                    <Text style={styles.stateTeamDescription}>{team.description}</Text>
                    <View style={styles.stateTeamStats}>
                      <Text style={styles.stateTeamMemberCount}>
                        {team.member_count || 0} members
                      </Text>
                      <Text style={styles.stateTeamLevel}>
                        Level {team.level || 1}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
            
            {filteredTeams.length === 0 && (
              <View style={styles.emptyBrowseState}>
                <Ionicons name="people" size={48} color="#6B7280" />
                <Text style={styles.emptyBrowseText}>No Teams Available</Text>
                <Text style={styles.emptyBrowseSubtext}>
                  All state teams are currently being set up. Check back later!
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Team Invites Modal */}
      <Modal
        visible={showInvites}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.invitesContainer}>
          <View style={styles.invitesHeader}>
            <Text style={styles.invitesTitle}>Team Invites</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowInvites(false)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.invitesContent}>
            {pendingInvites.length > 0 ? (
              pendingInvites.map((invite) => (
                <View key={invite.id} style={styles.inviteCard}>
                  <View style={styles.inviteInfo}>
                    <Text style={styles.inviteTeamName}>{invite.team_name}</Text>
                    <Text style={styles.inviteDescription}>
                      You've been invited to join this team by {invite.inviter_name || 'a team member'}
                    </Text>
                    <Text style={styles.inviteDate}>
                      {new Date(invite.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.inviteActions}>
                    <TouchableOpacity 
                      style={styles.acceptButton}
                      onPress={() => handleAcceptInvite(invite.id, invite.team_id)}
                    >
                      <Text style={styles.acceptButtonText}>Join</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.declineButton}
                      onPress={() => handleDeclineInvite(invite.id)}
                    >
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyInvitesState}>
                <Ionicons name="mail-open" size={48} color="#6B7280" />
                <Text style={styles.emptyInvitesText}>No Pending Invites</Text>
                <Text style={styles.emptyInvitesSubtext}>
                  Team invites will appear here when you receive them
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Send Invite Modal */}
      <Modal visible={showInviteModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite to Team</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Enter the email address of the person you want to invite to {selectedTeam?.name}
            </Text>
            
            <TextInput
              style={styles.inviteEmailInput}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="Enter email address"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TouchableOpacity style={styles.sendInviteButton} onPress={handleSendInvite}>
              <Text style={styles.sendInviteButtonText}>Send Invite</Text>
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
  teamSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // New invites notification styles
  invitesNotificationContainer: {
    marginBottom: 12,
  },
  invitesNotificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 12,
    position: 'relative',
  },
  inviteNotificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  inviteNotificationBadgeText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: 'bold',
  },
  invitesNotificationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  // Keep old styles for backward compatibility
  invitesButton: {
    position: 'relative',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FF6B3520',
  },
  inviteBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  browseTeamsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98120',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  browseTeamsButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  memberStatItem: {
    alignItems: 'flex-end',
  },
  memberTonnage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  memberCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Browse Teams Modal Styles
  browseTeamsContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  browseTeamsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  browseTeamsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  browseTeamsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  browseTeamsSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 22,
  },
  stateTeamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stateTeamCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  stateTeamGradient: {
    padding: 16,
    minHeight: 120,
  },
  stateTeamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stateTeamDescription: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 12,
    lineHeight: 16,
  },
  stateTeamStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stateTeamMemberCount: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  stateTeamLevel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '600',
  },
  emptyBrowseState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyBrowseText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyBrowseSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Invites Modal Styles
  invitesContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  invitesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  invitesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  invitesContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inviteCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inviteInfo: {
    flex: 1,
    marginRight: 12,
  },
  inviteTeamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  inviteDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  inviteDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  declineButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyInvitesState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyInvitesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyInvitesSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  inviteEmailInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  sendInviteButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sendInviteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Leaderboard styles
  leaderboardContainer: {
    marginBottom: 20,
  },
  leaderboardTitleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  leaderboardSortButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  sortButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeSortButton: {
    backgroundColor: '#10B981',
  },
  sortButtonText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  activeSortButtonText: {
    color: '#FFFFFF',
  },
  leaderboardList: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  topThreeAvatar: {
    backgroundColor: '#F59E0B20',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  topThreeInitial: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  topThreeName: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  rankBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberStats: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
});









