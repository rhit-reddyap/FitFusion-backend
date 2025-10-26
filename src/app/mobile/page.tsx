"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Apple, 
  Users, 
  BarChart3, 
  User, 
  Bell,
  Heart,
  Zap,
  Trophy,
  Target,
  Clock,
  Flame,
  TrendingUp,
  Star,
  ChevronRight,
  Plus,
  Play,
  Calendar,
  Award
} from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import AICoach from '@/components/AICoach';

function MobileDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [notifications, setNotifications] = useState(3);
  const [wearableData, setWearableData] = useState({
    heartRate: 72,
    calories: 420,
    steps: 8500,
    sleep: 7.5,
    strain: 8.2,
    recovery: 85
  });

  // Mock user data for AI analysis
  const userData = {
    profile: {
      fitness_goals: ['muscle_gain', 'strength'],
      activity_level: 'active',
      height_cm: 180,
      weight_kg: 75,
      age: 28
    },
    workouts: [
      {
        date: '2024-01-15',
        duration: 75,
        exercises: [{ name: 'Bench Press', sets: [{ weight: 225, reps: 5, rpe: 8 }] }],
        total_volume: 12500,
        rpe_avg: 8.2,
        calories_burned: 420
      }
    ],
    nutrition: [
      {
        date: '2024-01-15',
        calories: 2500,
        protein: 180,
        carbs: 250,
        fat: 80,
        water: 3.5
      }
    ],
    sleep: [
      {
        date: '2024-01-15',
        hours: 7.5,
        quality: 4
      }
    ],
    body_measurements: [
      {
        date: '2024-01-15',
        weight: 75,
        body_fat: 12,
        muscle_mass: 65
      }
    ]
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Dumbbell },
    { id: 'workouts', label: 'Workouts', icon: Target },
    { id: 'nutrition', label: 'Nutrition', icon: Apple },
    { id: 'communities', label: 'Communities', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const quickActions = [
    { title: 'Start Workout', icon: Play, color: 'from-purple-600 to-pink-600', href: '/workouts' },
    { title: 'Log Food', icon: Apple, color: 'from-green-600 to-teal-600', href: '/food' },
    { title: 'View Progress', icon: TrendingUp, color: 'from-blue-600 to-cyan-600', href: '/analytics' },
    { title: 'AI Coach', icon: Star, color: 'from-yellow-600 to-orange-600', href: '/ai' }
  ];

  const recentActivity = [
    { type: 'workout', title: 'Push Day Complete', time: '2 hours ago', icon: Dumbbell, color: 'text-purple-400' },
    { type: 'pr', title: 'New Bench Press PR!', time: '2 hours ago', icon: Trophy, color: 'text-yellow-400' },
    { type: 'nutrition', title: 'Meal logged', time: '4 hours ago', icon: Apple, color: 'text-green-400' }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-6 pt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back,</h1>
            <p className="text-gray-400">{profile?.display_name || 'User'}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-400" />
              {notifications > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">{notifications}</span>
                </div>
              )}
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
          </div>
        </div>

        {/* Wearable Data Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Heart Rate</span>
            </div>
            <div className="text-2xl font-bold text-white">{wearableData.heartRate}</div>
            <div className="text-xs text-gray-500">bpm</div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-400">Calories</span>
            </div>
            <div className="text-2xl font-bold text-white">{wearableData.calories}</div>
            <div className="text-xs text-gray-500">burned</div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Strain</span>
            </div>
            <div className="text-2xl font-bold text-white">{wearableData.strain}</div>
            <div className="text-xs text-gray-500">/10</div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Recovery</span>
            </div>
            <div className="text-2xl font-bold text-white">{wearableData.recovery}%</div>
            <div className="text-xs text-gray-500">today</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`bg-gradient-to-r ${action.color} p-4 rounded-2xl text-left`}
            >
              <div className="flex items-center gap-3">
                <action.icon className="w-6 h-6 text-white" />
                <div>
                  <div className="text-white font-semibold">{action.title}</div>
                  <div className="text-white/80 text-sm">Tap to start</div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/60 ml-auto" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Recent Activity */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="bg-gray-900 rounded-xl p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gray-800`}>
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{activity.title}</div>
                  <div className="text-gray-400 text-sm">{activity.time}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Preview */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4">AI Insights</h2>
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-4 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">Smart Recommendation</span>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              Your training volume has increased 15% this week. Consider a deload week to optimize recovery.
            </p>
            <button className="text-purple-400 text-sm font-medium">View Full Analysis →</button>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4">This Week</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">4</div>
              <div className="text-gray-400 text-sm">Workouts</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">2</div>
              <div className="text-gray-400 text-sm">PRs</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">85%</div>
              <div className="text-gray-400 text-sm">Recovery</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-400'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MobilePage() {
  return (
    <AuthGuard>
      <MobileDashboard />
    </AuthGuard>
  );
}


















