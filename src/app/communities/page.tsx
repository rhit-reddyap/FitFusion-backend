"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Users,
  Trophy,
  Flame,
  Target,
  Calendar,
  Bell,
  Plus,
  Search,
  Filter,
  Crown,
  Medal,
  Star,
  TrendingUp,
  Zap,
  Award,
  ChevronRight,
  MessageCircle,
  Heart,
  Share2
} from 'lucide-react';

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
  category: 'fitness' | 'powerlifting' | 'bodybuilding' | 'crossfit' | 'running';
  image: string;
  recentActivity: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  change: number;
  metric: string;
}

interface PRNotification {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  exercise: string;
  weight: number;
  reps: number;
  previousPR: number;
  communityId: string;
  timestamp: string;
  isNew: boolean;
}

function CommunitiesContent() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboards' | 'discover'>('feed');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data
  const communities: Community[] = [
    {
      id: '1',
      name: 'Powerlifting Elite',
      description: 'Serious powerlifters pushing for new PRs',
      memberCount: 1250,
      isJoined: true,
      category: 'powerlifting',
      image: '/api/placeholder/100/100',
      recentActivity: '2 hours ago'
    },
    {
      id: '2',
      name: 'Bodybuilding Bros',
      description: 'Muscle building and aesthetics focus',
      memberCount: 2100,
      isJoined: true,
      category: 'bodybuilding',
      image: '/api/placeholder/100/100',
      recentActivity: '1 hour ago'
    },
    {
      id: '3',
      name: 'CrossFit Warriors',
      description: 'High-intensity functional fitness',
      memberCount: 890,
      isJoined: false,
      category: 'crossfit',
      image: '/api/placeholder/100/100',
      recentActivity: '30 minutes ago'
    },
    {
      id: '4',
      name: 'Running Club',
      description: 'Marathon and endurance training',
      memberCount: 1500,
      isJoined: false,
      category: 'running',
      image: '/api/placeholder/100/100',
      recentActivity: '45 minutes ago'
    }
  ];

  const leaderboards = {
    weekly: [
      { id: '1', name: 'Alex Johnson', avatar: '/api/placeholder/40/40', score: 12500, rank: 1, change: 2, metric: 'Tonnage (lbs)' },
      { id: '2', name: 'Sarah Chen', avatar: '/api/placeholder/40/40', score: 11800, rank: 2, change: -1, metric: 'Tonnage (lbs)' },
      { id: '3', name: 'Mike Rodriguez', avatar: '/api/placeholder/40/40', score: 11200, rank: 3, change: 0, metric: 'Tonnage (lbs)' },
      { id: '4', name: 'Emma Wilson', avatar: '/api/placeholder/40/40', score: 10800, rank: 4, change: 3, metric: 'Tonnage (lbs)' },
      { id: '5', name: 'David Kim', avatar: '/api/placeholder/40/40', score: 10500, rank: 5, change: -2, metric: 'Tonnage (lbs)' }
    ],
    workouts: [
      { id: '1', name: 'Alex Johnson', avatar: '/api/placeholder/40/40', score: 6, rank: 1, change: 1, metric: 'Workouts' },
      { id: '2', name: 'Sarah Chen', avatar: '/api/placeholder/40/40', score: 5, rank: 2, change: 0, metric: 'Workouts' },
      { id: '3', name: 'Mike Rodriguez', avatar: '/api/placeholder/40/40', score: 5, rank: 3, change: -1, metric: 'Workouts' },
      { id: '4', name: 'Emma Wilson', avatar: '/api/placeholder/40/40', score: 4, rank: 4, change: 2, metric: 'Workouts' },
      { id: '5', name: 'David Kim', avatar: '/api/placeholder/40/40', score: 4, rank: 5, change: 0, metric: 'Workouts' }
    ],
    prs: [
      { id: '1', name: 'Alex Johnson', avatar: '/api/placeholder/40/40', score: 3, rank: 1, change: 1, metric: 'PRs' },
      { id: '2', name: 'Sarah Chen', avatar: '/api/placeholder/40/40', score: 2, rank: 2, change: 0, metric: 'PRs' },
      { id: '3', name: 'Mike Rodriguez', avatar: '/api/placeholder/40/40', score: 2, rank: 3, change: -1, metric: 'PRs' },
      { id: '4', name: 'Emma Wilson', avatar: '/api/placeholder/40/40', score: 1, rank: 4, change: 1, metric: 'PRs' },
      { id: '5', name: 'David Kim', avatar: '/api/placeholder/40/40', score: 1, rank: 5, change: 0, metric: 'PRs' }
    ]
  };

  const prNotifications: PRNotification[] = [
    {
      id: '1',
      userId: '1',
      userName: 'Alex Johnson',
      userAvatar: '/api/placeholder/40/40',
      exercise: 'Bench Press',
      weight: 315,
      reps: 1,
      previousPR: 305,
      communityId: '1',
      timestamp: '2 hours ago',
      isNew: true
    },
    {
      id: '2',
      userId: '2',
      userName: 'Sarah Chen',
      userAvatar: '/api/placeholder/40/40',
      exercise: 'Deadlift',
      weight: 405,
      reps: 1,
      previousPR: 395,
      communityId: '1',
      timestamp: '4 hours ago',
      isNew: true
    },
    {
      id: '3',
      userId: '3',
      userName: 'Mike Rodriguez',
      userAvatar: '/api/placeholder/40/40',
      exercise: 'Squat',
      weight: 365,
      reps: 1,
      previousPR: 355,
      communityId: '1',
      timestamp: '6 hours ago',
      isNew: false
    }
  ];

  const categories = ['all', 'fitness', 'powerlifting', 'bodybuilding', 'crossfit', 'running'];
  const leaderboardTypes = ['weekly', 'workouts', 'prs'];

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        <Sidebar activePage="communities" />

        <div className="flex-1">
          <div className="main-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Communities</h1>
            <p className="text-gray-400 text-lg">Connect, compete, and celebrate together</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
              <Plus className="w-5 h-5" />
              Create Community
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'feed', label: 'Activity Feed', icon: Bell },
            { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
            { id: 'discover', label: 'Discover', icon: Search }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Activity Feed */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
              <div className="flex gap-2">
                <button className="bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PR Notifications */}
            <div className="space-y-4">
              {prNotifications.map(notification => (
                <div key={notification.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-teal-500/30 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img 
                        src={notification.userAvatar} 
                        alt={notification.userName}
                        className="w-12 h-12 rounded-full"
                      />
                      {notification.isNew && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white">{notification.userName}</span>
                        <span className="text-gray-400">hit a new PR in</span>
                        <span className="font-semibold text-teal-400">{notification.exercise}</span>
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full font-bold">
                          {notification.weight} lbs × {notification.reps}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Previous: {notification.previousPR} lbs
                        </div>
                        <div className="text-green-400 text-sm font-semibold">
                          +{notification.weight - notification.previousPR} lbs
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{notification.timestamp}</span>
                        <button className="flex items-center gap-1 hover:text-white transition-colors">
                          <Heart className="w-4 h-4" />
                          <span>12</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-white transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>3</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-white transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboards */}
        {activeTab === 'leaderboards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Leaderboards</h2>
              <div className="flex gap-2">
                {leaderboardTypes.map(type => (
                  <button
                    key={type}
                    className="px-4 py-2 bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-700 hover:text-white transition-colors capitalize"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Tonnage Leaderboard */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">Weekly Tonnage</h3>
                <span className="text-gray-400">(Total weight lifted this week)</span>
              </div>
              
              <div className="space-y-3">
                {leaderboards.weekly.map(entry => (
                  <div key={entry.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank)}
                      <img 
                        src={entry.avatar} 
                        alt={entry.name}
                        className="w-10 h-10 rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{entry.name}</div>
                      <div className="text-sm text-gray-400">{entry.score.toLocaleString()} lbs</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${getChangeColor(entry.change)}`}>
                        {entry.change > 0 ? '+' : ''}{entry.change}
                      </div>
                      <div className="text-xs text-gray-400">vs last week</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workouts Leaderboard */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Most Workouts</h3>
                <span className="text-gray-400">(This week)</span>
              </div>
              
              <div className="space-y-3">
                {leaderboards.workouts.map(entry => (
                  <div key={entry.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank)}
                      <img 
                        src={entry.avatar} 
                        alt={entry.name}
                        className="w-10 h-10 rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{entry.name}</div>
                      <div className="text-sm text-gray-400">{entry.score} workouts</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${getChangeColor(entry.change)}`}>
                        {entry.change > 0 ? '+' : ''}{entry.change}
                      </div>
                      <div className="text-xs text-gray-400">vs last week</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PRs Leaderboard */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Most PRs</h3>
                <span className="text-gray-400">(This week)</span>
              </div>
              
              <div className="space-y-3">
                {leaderboards.prs.map(entry => (
                  <div key={entry.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank)}
                      <img 
                        src={entry.avatar} 
                        alt={entry.name}
                        className="w-10 h-10 rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{entry.name}</div>
                      <div className="text-sm text-gray-400">{entry.score} PRs</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${getChangeColor(entry.change)}`}>
                        {entry.change > 0 ? '+' : ''}{entry.change}
                      </div>
                      <div className="text-xs text-gray-400">vs last week</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Discover Communities */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Discover Communities</h2>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="capitalize">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map(community => (
                <div key={community.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-teal-500/30 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={community.image} 
                        alt={community.name}
                        className="w-12 h-12 rounded-xl"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-white">{community.name}</h3>
                        <p className="text-gray-400 text-sm">{community.memberCount.toLocaleString()} members</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      community.category === 'powerlifting' ? 'bg-red-500/20 text-red-400' :
                      community.category === 'bodybuilding' ? 'bg-blue-500/20 text-blue-400' :
                      community.category === 'crossfit' ? 'bg-green-500/20 text-green-400' :
                      community.category === 'running' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {community.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4">{community.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Active {community.recentActivity}
                    </div>
                    <button className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                      community.isJoined
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:from-teal-700 hover:to-blue-700'
                    }`}>
                      {community.isJoined ? 'Joined' : 'Join'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Communities() {
  return (
    <AuthGuard>
      <CommunitiesContent />
    </AuthGuard>
  );
}