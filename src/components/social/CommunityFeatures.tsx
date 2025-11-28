"use client";

import React, { useState } from 'react';
import { 
  Users, 
  Trophy, 
  Target, 
  Flame, 
  Award, 
  Calendar,
  Clock,
  Star,
  MessageCircle,
  Heart,
  Share2,
  Plus,
  Crown,
  Zap,
  TrendingUp,
  BarChart3,
  Minus
} from 'lucide-react';

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'streak' | 'calories' | 'protein' | 'workout';
  duration: number; // days
  participants: number;
  prize: string;
  isActive: boolean;
  progress?: number;
  isJoined?: boolean;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  change: number;
  badge?: string;
}

interface CommunityFeaturesProps {
  onJoinChallenge: (challengeId: string) => void;
  onViewProfile: (userId: string) => void;
}

const CommunityFeatures: React.FC<CommunityFeaturesProps> = ({ 
  onJoinChallenge, 
  onViewProfile 
}) => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard' | 'feed' | 'achievements'>('challenges');

  // Mock data
  const challenges: Challenge[] = [
    {
      id: '1',
      name: '30-Day Nutrition Streak',
      description: 'Log your meals every day for 30 days and earn exclusive rewards',
      type: 'streak',
      duration: 30,
      participants: 1247,
      prize: 'Premium Badge + $50 Gift Card',
      isActive: true,
      progress: 12,
      isJoined: true
    },
    {
      id: '2',
      name: 'Protein Power Challenge',
      description: 'Hit your protein goal for 7 consecutive days',
      type: 'protein',
      duration: 7,
      participants: 892,
      prize: 'Exclusive Recipe Pack',
      isActive: true,
      progress: 5,
      isJoined: true
    },
    {
      id: '3',
      name: 'Calorie Master',
      description: 'Stay within 100 calories of your goal for 14 days',
      type: 'calories',
      duration: 14,
      participants: 634,
      prize: 'Custom Meal Plan',
      isActive: true,
      progress: 0,
      isJoined: false
    },
    {
      id: '4',
      name: 'Workout Warrior',
      description: 'Complete 5 workouts this week',
      type: 'workout',
      duration: 7,
      participants: 2156,
      prize: 'Fitness Gear Bundle',
      isActive: true,
      progress: 0,
      isJoined: false
    }
  ];

  const leaderboard: LeaderboardEntry[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: '👩‍💼',
      score: 2847,
      rank: 1,
      change: 2,
      badge: 'Champion'
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: '👨‍💻',
      score: 2756,
      rank: 2,
      change: -1,
      badge: 'Elite'
    },
    {
      id: '3',
      name: 'Emma Wilson',
      avatar: '👩‍🎨',
      score: 2634,
      rank: 3,
      change: 5,
      badge: 'Rising Star'
    },
    {
      id: '4',
      name: 'Alex Rodriguez',
      avatar: '👨‍🏫',
      score: 2589,
      rank: 4,
      change: 0,
      badge: 'Consistent'
    },
    {
      id: '5',
      name: 'Lisa Park',
      avatar: '👩‍⚕️',
      score: 2456,
      rank: 5,
      change: 3,
      badge: 'Motivated'
    }
  ];

  const achievements = [
    {
      id: '1',
      name: 'First Week Complete',
      description: 'Logged meals for 7 consecutive days',
      icon: '🎯',
      earned: true,
      earnedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Protein Pro',
      description: 'Hit protein goal for 30 days',
      icon: '💪',
      earned: true,
      earnedAt: '2024-01-20'
    },
    {
      id: '3',
      name: 'Streak Master',
      description: '50-day logging streak',
      icon: '🔥',
      earned: false,
      progress: 75
    },
    {
      id: '4',
      name: 'Community Helper',
      description: 'Help 10 other users',
      icon: '🤝',
      earned: false,
      progress: 40
    }
  ];

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'streak': return Flame;
      case 'calories': return Target;
      case 'protein': return Zap;
      case 'workout': return Trophy;
      default: return Award;
    }
  };

  const getChallengeColor = (type: string) => {
    switch (type) {
      case 'streak': return 'from-orange-500 to-red-500';
      case 'calories': return 'from-blue-500 to-cyan-500';
      case 'protein': return 'from-purple-500 to-pink-500';
      case 'workout': return 'from-green-500 to-teal-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Community</h2>
              <p className="text-gray-400">Connect, compete, and celebrate together</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Premium</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'challenges', label: 'Challenges', icon: Trophy },
            { id: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
            { id: 'feed', label: 'Feed', icon: MessageCircle },
            { id: 'achievements', label: 'Achievements', icon: Award }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Active Challenges</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors">
                <Plus className="w-4 h-4" />
                Create Challenge
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map(challenge => {
                const ChallengeIcon = getChallengeIcon(challenge.type);
                const gradientClass = getChallengeColor(challenge.type);
                
                return (
                  <div key={challenge.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-orange-500/50 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${gradientClass} rounded-xl flex items-center justify-center`}>
                          <ChallengeIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{challenge.name}</h4>
                          <p className="text-sm text-gray-400">{challenge.description}</p>
                        </div>
                      </div>
                      {challenge.isJoined && (
                        <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Joined
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Duration</span>
                        <span className="text-white">{challenge.duration} days</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Participants</span>
                        <span className="text-white">{challenge.participants.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Prize</span>
                        <span className="text-yellow-400 font-medium">{challenge.prize}</span>
                      </div>
                    </div>

                    {challenge.isJoined && challenge.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">{challenge.progress}/{challenge.duration} days</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(challenge.progress / challenge.duration) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => onJoinChallenge(challenge.id)}
                      className={`w-full py-3 rounded-xl font-medium transition-all ${
                        challenge.isJoined
                          ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700'
                      }`}
                      disabled={challenge.isJoined}
                    >
                      {challenge.isJoined ? 'Joined' : 'Join Challenge'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Weekly Leaderboard</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Resets in 3 days</span>
              </div>
            </div>

            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                  <div className={`text-2xl font-bold ${getRankColor(entry.rank)}`}>
                    #{entry.rank}
                  </div>
                  <div className="text-3xl">{entry.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{entry.name}</h4>
                      {entry.badge && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                          {entry.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{entry.score.toLocaleString()} points</span>
                      <div className="flex items-center gap-1">
                        {entry.change > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : entry.change < 0 ? (
                          <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                        ) : (
                          <Minus className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={entry.change > 0 ? 'text-green-400' : entry.change < 0 ? 'text-red-400' : 'text-gray-400'}>
                          {Math.abs(entry.change)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onViewProfile(entry.id)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Community Feed</h3>
            <p className="text-gray-400 mb-6">See what your community is up to</p>
            <button className="bg-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-700 transition-colors">
              View Feed
            </button>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Your Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border ${
                    achievement.earned 
                      ? 'border-yellow-500/30 bg-yellow-500/10' 
                      : 'border-gray-700 bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{achievement.name}</h4>
                      <p className="text-sm text-gray-400">{achievement.description}</p>
                      {achievement.earned ? (
                        <p className="text-xs text-yellow-400 mt-1">
                          Earned on {new Date(achievement.earnedAt!).toLocaleDateString()}
                        </p>
                      ) : (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1">
                            <div 
                              className="bg-yellow-500 h-1 rounded-full transition-all duration-500"
                              style={{ width: `${achievement.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    {achievement.earned && (
                      <Award className="w-6 h-6 text-yellow-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityFeatures;
