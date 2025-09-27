import { supabase } from '../lib/supabase';
import { User } from '../lib/supabase';

// Team interfaces
export interface Team {
  id: string;
  name: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  privacy: 'Public' | 'Private';
  max_members: number;
  admin_id: string; // Changed from created_by to admin_id
  created_at: string;
  team_image?: string;
  color_theme: string[];
  badges: string[];
  rules: string[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'Admin' | 'Moderator' | 'Member';
  joined_at: string;
  permissions: string[];
  is_active: boolean;
  user?: User;
}

export interface TeamStats {
  team_id: string;
  total_members: number;
  total_workouts: number;
  avg_workouts_per_week: number;
  team_streak: number;
  total_calories_burned: number;
  last_updated: string;
}

export interface TeamActivity {
  id: string;
  team_id: string;
  user_id: string;
  activity_type: 'workout' | 'achievement' | 'challenge' | 'post';
  description: string;
  created_at: string;
  user?: User;
}

export interface TeamChallenge {
  id: string;
  team_id: string;
  title: string;
  description: string;
  challenge_type: 'workout' | 'nutrition' | 'streak' | 'custom';
  duration_days: number;
  reward: string;
  created_by: string;
  created_at: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  participants: number;
  progress: number;
}

export interface JoinRequest {
  id: string;
  team_id: string;
  user_id: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user?: User;
}

// New interfaces for advanced features
export interface FriendCompetition {
  id: string;
  team_id: string;
  user1_id: string;
  user2_id: string;
  competition_type: 'weekly_workouts' | 'monthly_tonnage' | 'streak' | 'calories_burned';
  start_date: string;
  end_date: string;
  user1_score: number;
  user2_score: number;
  is_active: boolean;
  winner_id?: string;
  created_at: string;
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  team_id: string;
  exercise_name: string;
  record_type: 'max_weight' | 'max_reps' | 'max_volume' | 'best_time';
  previous_value: number;
  new_value: number;
  achieved_at: string;
  workout_id?: string;
  is_verified: boolean;
}

export interface TeamNotification {
  id: string;
  team_id: string;
  user_id: string;
  type: 'pr_achieved' | 'friend_activity' | 'challenge_update' | 'competition_result' | 'team_announcement';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  from_user_id?: string;
}

export interface WeeklyChallenge {
  id: string;
  team_id: string;
  title: string;
  description: string;
  challenge_type: 'workout_count' | 'calories_burned' | 'weight_lifted' | 'streak' | 'distance' | 'time';
  target_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  participants: WeeklyChallengeParticipant[];
  rewards: string[];
  created_by: string;
}

export interface WeeklyChallengeParticipant {
  user_id: string;
  current_progress: number;
  last_updated: string;
  rank: number;
}

export interface FriendActivity {
  id: string;
  user_id: string;
  team_id: string;
  activity_type: 'workout_completed' | 'pr_achieved' | 'challenge_progress' | 'streak_milestone';
  description: string;
  data: any;
  created_at: string;
  user?: User;
}

export class TeamService {
  // Get all teams
  static async getTeams(limit: number = 20, offset: number = 0): Promise<Team[]> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.log('Teams table not available, returning mock data');
        // Return mock teams if table doesn't exist
        return [
          {
            id: '1',
            name: 'Fitness Warriors',
            description: 'A team for fitness enthusiasts',
            category: 'Fitness',
            level: 'All Levels',
            privacy: 'Public',
            max_members: 10,
            created_by: 'user1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            team_image: null,
            color_theme: ['#10B981', '#059669'],
            badges: ['first_team'],
            rules: ['Be respectful', 'Stay active'],
            is_active: true,
          },
          {
            id: '2',
            name: 'Gym Legends',
            description: 'Elite fitness team',
            category: 'Strength',
            level: 'Advanced',
            privacy: 'Public',
            max_members: 8,
            created_by: 'user2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            team_image: null,
            color_theme: ['#3B82F6', '#1D4ED8'],
            badges: ['elite_team'],
            rules: ['Minimum 5 workouts per week'],
            is_active: true,
          }
        ];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  }

  // Get user's teams
  static async getUserTeams(userId: string): Promise<Team[]> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          team:teams(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.log('Team members table not available, returning empty array');
        return [];
      }
      return data?.map(item => item.team).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching user teams:', error);
      return [];
    }
  }

  // Get team details
  static async getTeamDetails(teamId: string): Promise<Team | null> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching team details:', error);
      return null;
    }
  }

  // Get team members
  static async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  // Get team stats
  static async getTeamStats(teamId: string): Promise<TeamStats | null> {
    try {
      const { data, error } = await supabase
        .from('team_stats')
        .select('*')
        .eq('team_id', teamId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching team stats:', error);
      return null;
    }
  }

  // Get team activity
  static async getTeamActivity(teamId: string, limit: number = 20): Promise<TeamActivity[]> {
    try {
      const { data, error } = await supabase
        .from('team_activities')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching team activity:', error);
      return [];
    }
  }

  // Get team challenges
  static async getTeamChallenges(teamId: string): Promise<TeamChallenge[]> {
    try {
      const { data, error } = await supabase
        .from('team_challenges')
        .select('*')
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching team challenges:', error);
      return [];
    }
  }

  // Create team
  static async createTeam(teamData: Partial<Team>, userId: string): Promise<Team | null> {
    try {
      // Validate required fields
      if (!teamData.name || !teamData.description || !teamData.category) {
        throw new Error('Missing required team data: name, description, or category');
      }

      // Map the teamData to match the existing database schema
      const newTeam = {
        name: teamData.name,
        description: teamData.description,
        category: teamData.category,
        level: teamData.level || 'All Levels',
        privacy: teamData.privacy || 'Public',
        max_members: teamData.max_members || 10,
        admin_id: userId,
        team_image: teamData.team_image,
        color_theme: teamData.color_theme || ['#10B981', '#059669'],
        rules: teamData.rules || [],
        badges: teamData.badges || []
      };

      console.log('Attempting to create team with data:', newTeam);

      const { data, error } = await supabase
        .from('teams')
        .insert(newTeam)
        .select()
        .single();

      if (error) {
        console.error('Database error creating team:', error);
        
        // Check if it's a table doesn't exist error
        if (error.message.includes('relation "teams" does not exist')) {
          console.log('Teams table does not exist. Please run the database setup script.');
          throw new Error('Database not set up. Please run the teams setup script in Supabase.');
        }
        
        // For other database errors, return a mock team for development
        const mockTeam: Team = {
          id: Date.now().toString(),
          name: teamData.name || 'New Team',
          description: teamData.description || 'A new fitness team',
          category: teamData.category || 'General',
          level: teamData.level || 'All Levels',
          privacy: teamData.privacy || 'Public',
          max_members: teamData.max_members || 10,
          admin_id: userId,
          created_at: new Date().toISOString(),
          team_image: teamData.team_image,
          color_theme: teamData.color_theme || ['#10B981', '#059669'],
          badges: teamData.badges || [],
          rules: teamData.rules || [],
        };
        console.log('Returning mock team due to database error');
        return mockTeam;
      }

      console.log('Team created successfully:', data);

      // Add creator as admin member
      try {
        await this.addTeamMember(data.id, userId, 'Admin', ['manage_team', 'manage_members', 'create_challenges']);
        console.log('Team creator added as admin member');
      } catch (memberError) {
        console.log('Could not add team member, but team created successfully:', memberError);
      }

      return data;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error; // Re-throw to let the UI handle it
    }
  }

  // Add team member
  static async addTeamMember(teamId: string, userId: string, role: string, permissions: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role,
          permissions,
          joined_at: new Date().toISOString(),
          is_active: true,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding team member:', error);
      return false;
    }
  }

  // Join team
  static async joinTeam(teamId: string, userId: string): Promise<boolean> {
    try {
      // Check if team is public
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('privacy, max_members')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;

      if (team.privacy === 'Private') {
        // Create join request
        await this.createJoinRequest(teamId, userId);
        return true;
      }

      // Check current member count
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact' })
        .eq('team_id', teamId)
        .eq('is_active', true);

      if (count && count >= team.max_members) {
        throw new Error('Team is full');
      }

      // Add member directly
      return await this.addTeamMember(teamId, userId, 'Member', ['view_content', 'participate_challenges']);
    } catch (error) {
      console.error('Error joining team:', error);
      return false;
    }
  }

  // Create join request
  static async createJoinRequest(teamId: string, userId: string, message?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('join_requests')
        .insert({
          team_id: teamId,
          user_id: userId,
          message,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating join request:', error);
      return false;
    }
  }

  // Get join requests for team
  static async getJoinRequests(teamId: string): Promise<JoinRequest[]> {
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('team_id', teamId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching join requests:', error);
      return [];
    }
  }

  // Approve join request
  static async approveJoinRequest(requestId: string): Promise<boolean> {
    try {
      // Get request details
      const { data: request, error: requestError } = await supabase
        .from('join_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Add user to team
      const success = await this.addTeamMember(request.team_id, request.user_id, 'Member', ['view_content', 'participate_challenges']);
      
      if (success) {
        // Update request status
        const { error: updateError } = await supabase
          .from('join_requests')
          .update({ status: 'approved' })
          .eq('id', requestId);

        if (updateError) throw updateError;
      }

      return success;
    } catch (error) {
      console.error('Error approving join request:', error);
      return false;
    }
  }

  // Reject join request
  static async rejectJoinRequest(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error rejecting join request:', error);
      return false;
    }
  }

  // Leave team
  static async leaveTeam(teamId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: false })
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error leaving team:', error);
      return false;
    }
  }

  // Update team
  static async updateTeam(teamId: string, updates: Partial<Team>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', teamId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating team:', error);
      return false;
    }
  }

  // Delete team
  static async deleteTeam(teamId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('teams')
        .update({ is_active: false })
        .eq('id', teamId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting team:', error);
      return false;
    }
  }

  // Add team activity
  static async addTeamActivity(teamId: string, userId: string, activityType: string, description: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_activities')
        .insert({
          team_id: teamId,
          user_id: userId,
          activity_type: activityType,
          description,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding team activity:', error);
      return false;
    }
  }

  // Get user's teams
  static async getMyTeams(userId: string): Promise<Team[]> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams (
            id,
            name,
            description,
            category,
            level,
            privacy,
            max_members,
            admin_id,
            created_at,
            updated_at,
            color_theme,
            badges,
            rules
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting user teams:', error);
        return [];
      }

      return data?.map((item: any) => item.teams).filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting user teams:', error);
      return [];
    }
  }

  // Add team activity with data (for PR notifications)
  static async addTeamActivityWithData(activity: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_activities')
        .insert({
          team_id: activity.team_id,
          user_id: activity.user_id,
          activity_type: activity.activity_type,
          activity_data: activity.activity_data,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding team activity with data:', error);
      return false;
    }
  }

  // Get global leaderboard
  static async getGlobalLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      // First try to get from team_stats table
      const { data, error } = await supabase
        .from('team_stats')
        .select(`
          *,
          team:teams(*)
        `)
        .order('total_calories_burned', { ascending: false })
        .limit(limit);

      if (error) {
        // If team_stats doesn't exist, try to get from teams table
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .eq('is_active', true)
          .limit(limit);

        if (teamsError) {
          console.log('Teams table not available, returning mock data');
          // Return mock data if tables don't exist
          return [
            {
              id: '1',
              team: { name: 'Fitness Warriors', team_image: null },
              total_calories_burned: 15000,
              total_members: 8,
              team_streak: 12
            },
            {
              id: '2', 
              team: { name: 'Gym Legends', team_image: null },
              total_calories_burned: 12000,
              total_members: 6,
              team_streak: 8
            },
            {
              id: '3',
              team: { name: 'Cardio Kings', team_image: null },
              total_calories_burned: 10000,
              total_members: 5,
              team_streak: 6
            }
          ];
        }

        // Transform teams data to leaderboard format
        return teamsData.map((team, index) => ({
          id: team.id,
          team: team,
          total_calories_burned: Math.floor(Math.random() * 20000) + 5000,
          total_members: Math.floor(Math.random() * 10) + 3,
          team_streak: Math.floor(Math.random() * 20) + 1
        }));
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Return mock data as fallback
      return [
        {
          id: '1',
          team: { name: 'Fitness Warriors', team_image: null },
          total_calories_burned: 15000,
          total_members: 8,
          team_streak: 12
        },
        {
          id: '2', 
          team: { name: 'Gym Legends', team_image: null },
          total_calories_burned: 12000,
          total_members: 6,
          team_streak: 8
        },
        {
          id: '3',
          team: { name: 'Cardio Kings', team_image: null },
          total_calories_burned: 10000,
          total_members: 5,
          team_streak: 6
        }
      ];
    }
  }

  // Search teams
  static async searchTeams(query: string, category?: string): Promise<Team[]> {
    try {
      let queryBuilder = supabase
        .from('teams')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

      if (category) {
        queryBuilder = queryBuilder.eq('category', category);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching teams:', error);
      return [];
    }
  }

  // Friend Competition Methods
  static async createFriendCompetition(
    teamId: string, 
    user1Id: string, 
    user2Id: string, 
    competitionType: FriendCompetition['competition_type'],
    durationDays: number = 7
  ): Promise<FriendCompetition | null> {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);

      const competitionData = {
        team_id: teamId,
        user1_id: user1Id,
        user2_id: user2Id,
        competition_type: competitionType,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        user1_score: 0,
        user2_score: 0,
        is_active: true
      };

      const { data, error } = await supabase
        .from('friend_competitions')
        .insert(competitionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating friend competition:', error);
      return null;
    }
  }

  static async getFriendCompetitions(teamId: string, userId: string): Promise<FriendCompetition[]> {
    try {
      const { data, error } = await supabase
        .from('friend_competitions')
        .select('*')
        .eq('team_id', teamId)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching friend competitions:', error);
      return [];
    }
  }

  static async updateCompetitionScore(
    competitionId: string, 
    userId: string, 
    newScore: number
  ): Promise<boolean> {
    try {
      const { data: competition } = await supabase
        .from('friend_competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (!competition) return false;

      const updateData = competition.user1_id === userId 
        ? { user1_score: newScore }
        : { user2_score: newScore };

      const { error } = await supabase
        .from('friend_competitions')
        .update(updateData)
        .eq('id', competitionId);

      if (error) throw error;

      // Check if competition should end
      const now = new Date();
      const endDate = new Date(competition.end_date);
      if (now >= endDate) {
        const winnerId = competition.user1_score > competition.user2_score 
          ? competition.user1_id 
          : competition.user2_score > competition.user1_score 
            ? competition.user2_id 
            : null;

        await supabase
          .from('friend_competitions')
          .update({ is_active: false, winner_id: winnerId })
          .eq('id', competitionId);
      }

      return true;
    } catch (error) {
      console.error('Error updating competition score:', error);
      return false;
    }
  }

  // Personal Record Methods
  static async recordPersonalRecord(
    userId: string,
    teamId: string,
    exerciseName: string,
    recordType: PersonalRecord['record_type'],
    newValue: number,
    previousValue: number,
    workoutId?: string
  ): Promise<PersonalRecord | null> {
    try {
      const prData = {
        user_id: userId,
        team_id: teamId,
        exercise_name: exerciseName,
        record_type: recordType,
        previous_value: previousValue,
        new_value: newValue,
        achieved_at: new Date().toISOString(),
        workout_id: workoutId,
        is_verified: false
      };

      const { data, error } = await supabase
        .from('personal_records')
        .insert(prData)
        .select()
        .single();

      if (error) throw error;

      // Create notification for team members
      await this.createNotification(
        teamId,
        userId,
        'pr_achieved',
        'New Personal Record!',
        `${exerciseName}: ${newValue} ${recordType === 'max_weight' ? 'lbs' : recordType === 'max_reps' ? 'reps' : recordType === 'max_volume' ? 'lbs' : 'seconds'}`,
        { exerciseName, recordType, newValue, previousValue }
      );

      return data;
    } catch (error) {
      console.error('Error recording personal record:', error);
      return null;
    }
  }

  static async getPersonalRecords(teamId: string, userId?: string): Promise<PersonalRecord[]> {
    try {
      let query = supabase
        .from('personal_records')
        .select('*')
        .eq('team_id', teamId)
        .order('achieved_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching personal records:', error);
      return [];
    }
  }

  // Notification Methods
  static async createNotification(
    teamId: string,
    userId: string,
    type: TeamNotification['type'],
    title: string,
    message: string,
    data?: any,
    fromUserId?: string
  ): Promise<TeamNotification | null> {
    try {
      const notificationData = {
        team_id: teamId,
        user_id: userId,
        type,
        title,
        message,
        data,
        is_read: false,
        from_user_id: fromUserId
      };

      const { data: notification, error } = await supabase
        .from('team_notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) throw error;
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  static async getNotifications(teamId: string, userId: string): Promise<TeamNotification[]> {
    try {
      const { data, error } = await supabase
        .from('team_notifications')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Weekly Challenge Methods
  static async createWeeklyChallenge(
    teamId: string,
    createdBy: string,
    title: string,
    description: string,
    challengeType: WeeklyChallenge['challenge_type'],
    targetValue: number,
    rewards: string[] = []
  ): Promise<WeeklyChallenge | null> {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const challengeData = {
        team_id: teamId,
        title,
        description,
        challenge_type: challengeType,
        target_value: targetValue,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        is_active: true,
        rewards,
        created_by: createdBy,
        participants: []
      };

      const { data, error } = await supabase
        .from('weekly_challenges')
        .insert(challengeData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating weekly challenge:', error);
      return null;
    }
  }

  static async getWeeklyChallenges(teamId: string): Promise<WeeklyChallenge[]> {
    try {
      const { data, error } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching weekly challenges:', error);
      return [];
    }
  }

  static async joinWeeklyChallenge(
    challengeId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const { data: challenge } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (!challenge) return false;

      const participants = challenge.participants || [];
      if (!participants.find((p: any) => p.user_id === userId)) {
        participants.push({
          user_id: userId,
          current_progress: 0,
          last_updated: new Date().toISOString(),
          rank: participants.length + 1
        });

        const { error } = await supabase
          .from('weekly_challenges')
          .update({ participants })
          .eq('id', challengeId);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error joining weekly challenge:', error);
      return false;
    }
  }

  static async updateChallengeProgress(
    challengeId: string,
    userId: string,
    progress: number
  ): Promise<boolean> {
    try {
      const { data: challenge } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (!challenge) return false;

      const participants = challenge.participants || [];
      const participantIndex = participants.findIndex((p: any) => p.user_id === userId);
      
      if (participantIndex !== -1) {
        participants[participantIndex].current_progress = progress;
        participants[participantIndex].last_updated = new Date().toISOString();
        
        // Sort by progress and update ranks
        participants.sort((a: any, b: any) => b.current_progress - a.current_progress);
        participants.forEach((p: any, index: number) => {
          p.rank = index + 1;
        });

        const { error } = await supabase
          .from('weekly_challenges')
          .update({ participants })
          .eq('id', challengeId);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      return false;
    }
  }

  // Friend Activity Methods
  static async recordFriendActivity(
    userId: string,
    teamId: string,
    activityType: FriendActivity['activity_type'],
    description: string,
    data: any
  ): Promise<FriendActivity | null> {
    try {
      const activityData = {
        user_id: userId,
        team_id: teamId,
        activity_type: activityType,
        description,
        data,
        created_at: new Date().toISOString()
      };

      const { data: activity, error } = await supabase
        .from('friend_activities')
        .insert(activityData)
        .select()
        .single();

      if (error) throw error;

      // Create notifications for team members
      const teamMembers = await this.getTeamMembers(teamId);
      for (const member of teamMembers) {
        if (member.user_id !== userId) {
          await this.createNotification(
            teamId,
            member.user_id,
            'friend_activity',
            'Friend Activity',
            description,
            data,
            userId
          );
        }
      }

      return activity;
    } catch (error) {
      console.error('Error recording friend activity:', error);
      return null;
    }
  }

  static async getFriendActivities(teamId: string, limit: number = 20): Promise<FriendActivity[]> {
    try {
      const { data, error } = await supabase
        .from('friend_activities')
        .select(`
          *,
          user:user_id (
            id,
            email,
            user_metadata
          )
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching friend activities:', error);
      return [];
    }
  }
}
