"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import AICoach from '@/components/AICoach';
import { notificationService } from '@/lib/realtimeNotifications';
import { wearableService } from '@/lib/wearableIntegration';
import { 
  Flame, 
  Droplets, 
  Activity, 
  Star,
  ArrowRight,
  HelpCircle,
  Dumbbell,
  Apple,
  ChefHat,
  BarChart3,
  Play,
  Plus,
  TrendingUp,
  Target,
  Clock,
  Zap,
  Bell,
  Heart,
  Trophy,
  Award,
  Users,
  Brain,
  Smartphone,
  Watch
} from 'lucide-react';

function DashboardContent() {
  const { profile } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(0);
  const [wearableData, setWearableData] = useState({
    heartRate: 72,
    calories: 420,
    steps: 8500,
    sleep: 7.5,
    strain: 8.2,
    recovery: 85
  });
  const [showMobileView, setShowMobileView] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data - replace with real data from your state management
  const todayCalories = 1847;
  const todayProtein = 142.5;
  const workoutsThisWeek = 3;
  const sevenDayCalories = 12847;
  const currentStreak = 7;
  const weeklyGoal = 5;
  const caloriesBurned = 420;
  const caloriesGoal = 2000;
  const proteinGoal = 150;

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

  useEffect(() => {
    // Initialize real-time notifications
    notificationService.initialize(profile?.id || 'user');
    
    // Subscribe to notifications
    const notificationListener = notificationService.subscribeToNotifications(
      profile?.id || 'user',
      (notification) => {
        setNotifications(prev => prev + 1);
        console.log('New notification:', notification);
      }
    );

    // Initialize wearable data sync
    wearableService.initializeDevices(profile?.id || 'user');
    wearableService.syncAllDevices(profile?.id || 'user').then(data => {
      if (data.length > 0) {
        const latest = data[0];
        setWearableData({
          heartRate: latest.heartRate,
          calories: latest.calories,
          steps: latest.steps,
          sleep: latest.sleep.hours,
          strain: latest.strain,
          recovery: latest.recovery
        });
      }
    });

    // Check if mobile view should be shown
    const checkMobileView = () => {
      setShowMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => {
      notificationService.unsubscribe(notificationListener);
      window.removeEventListener('resize', checkMobileView);
    };
  }, [profile?.id]);

  const handleQuickAction = (action: string) => {
    switch(action) {
      case 'workout':
        router.push('/workouts');
        break;
      case 'food':
        router.push('/food');
        break;
      case 'ai':
        router.push('/ai');
        break;
      case 'analytics':
        router.push('/analytics');
        break;
      default:
        break;
    }
  };

  // Mobile view
  if (showMobileView) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Mobile Header */}
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
            <button
              onClick={() => router.push('/workouts')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl text-left"
            >
              <div className="flex items-center gap-3">
                <Play className="w-6 h-6 text-white" />
                <div>
                  <div className="text-white font-semibold">Start Workout</div>
                  <div className="text-white/80 text-sm">Tap to start</div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/60 ml-auto" />
              </div>
            </button>
            <button
              onClick={() => router.push('/food')}
              className="bg-gradient-to-r from-green-600 to-teal-600 p-4 rounded-2xl text-left"
            >
              <div className="flex items-center gap-3">
                <Apple className="w-6 h-6 text-white" />
                <div>
                  <div className="text-white font-semibold">Log Food</div>
                  <div className="text-white/80 text-sm">Track nutrition</div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/60 ml-auto" />
              </div>
            </button>
            <button
              onClick={() => router.push('/analytics')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-2xl text-left"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-white" />
                <div>
                  <div className="text-white font-semibold">View Progress</div>
                  <div className="text-white/80 text-sm">Analytics</div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/60 ml-auto" />
              </div>
            </button>
            <button
              onClick={() => router.push('/ai')}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4 rounded-2xl text-left"
            >
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-white" />
                <div>
                  <div className="text-white font-semibold">AI Coach</div>
                  <div className="text-white/80 text-sm">Get insights</div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/60 ml-auto" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="px-4 py-6">
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
              <button 
                onClick={() => router.push('/ai')}
                className="text-purple-400 text-sm font-medium"
              >
                View Full Analysis →
              </button>
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
            {[
              { id: 'home', label: 'Home', icon: Dumbbell, active: true },
              { id: 'workouts', label: 'Workouts', icon: Target, active: false },
              { id: 'nutrition', label: 'Nutrition', icon: Apple, active: false },
              { id: 'communities', label: 'Communities', icon: Users, active: false },
              { id: 'analytics', label: 'Analytics', icon: BarChart3, active: false }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => router.push(`/${tab.id === 'home' ? 'dashboard' : tab.id}`)}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors ${
                  tab.active
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Header */}
      <Header 
        onToggleSidebar={toggleSidebar}
        notifications={notifications}
        user={profile ? {
          display_name: profile.display_name,
          avatar_url: profile.avatar_url
        } : undefined}
      />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          activePage="dashboard" 
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />

        {/* Main Content */}
        <div className="flex-1 md:ml-0">
          <div className="main-content">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {profile?.display_name || 'User'}! 👋
            </h1>
            <p className="text-gray-400 text-lg">Ready to crush your fitness goals today?</p>
          </div>
          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl p-4 text-white min-w-[120px]">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Streak</span>
              </div>
              <div className="text-2xl font-bold">{currentStreak}</div>
              <div className="text-xs opacity-80">days</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white min-w-[120px]">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">This Week</span>
              </div>
              <div className="text-2xl font-bold">{workoutsThisWeek}/{weeklyGoal}</div>
              <div className="text-xs opacity-80">workouts</div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Calories */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-teal-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <span className="text-xs text-gray-400 font-medium">TODAY</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{todayCalories}</div>
            <div className="text-sm text-gray-400 mb-3">calories consumed</div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(todayCalories / caloriesGoal) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-2">{caloriesGoal - todayCalories} remaining</div>
          </div>

          {/* Protein */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Droplets className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs text-gray-400 font-medium">TODAY</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{todayProtein}g</div>
            <div className="text-sm text-gray-400 mb-3">protein consumed</div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(todayProtein / proteinGoal) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-2">{proteinGoal - todayProtein}g remaining</div>
          </div>

          {/* Workouts */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Dumbbell className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-xs text-gray-400 font-medium">THIS WEEK</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{workoutsThisWeek}</div>
            <div className="text-sm text-gray-400 mb-3">workouts completed</div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(workoutsThisWeek / weeklyGoal) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-2">{weeklyGoal - workoutsThisWeek} more to go</div>
          </div>

          {/* Calories Burned */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-green-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-xs text-gray-400 font-medium">TODAY</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{caloriesBurned}</div>
            <div className="text-sm text-gray-400 mb-3">calories burned</div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(caloriesBurned / 500) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-2">Goal: 500 cal</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => handleQuickAction('workout')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl p-6 text-white transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <Dumbbell className="w-6 h-6" />
                <span className="font-semibold">Start Workout</span>
              </div>
              <p className="text-sm opacity-80 mb-4">Log your training session</p>
              <div className="flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
                Begin <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </button>

            <button 
              onClick={() => handleQuickAction('food')}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-2xl p-6 text-white transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <Apple className="w-6 h-6" />
                <span className="font-semibold">Log Food</span>
              </div>
              <p className="text-sm opacity-80 mb-4">Track your nutrition</p>
              <div className="flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
                Add Meal <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </button>

            <button 
              onClick={() => handleQuickAction('ai')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-2xl p-6 text-white transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-6 h-6" />
                <span className="font-semibold">AI Coach</span>
              </div>
              <p className="text-sm opacity-80 mb-4">Get personalized advice</p>
              <div className="flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
                Ask AI <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </button>

            <button 
              onClick={() => handleQuickAction('analytics')}
              className="bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 rounded-2xl p-6 text-white transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-6 h-6" />
                <span className="font-semibold">Analytics</span>
              </div>
              <p className="text-sm opacity-80 mb-4">View your progress</p>
              <div className="flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
                See Stats <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Workouts */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Workouts</h3>
              <button 
                onClick={() => handleQuickAction('workout')}
                className="text-teal-400 hover:text-teal-300 text-sm font-medium flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Dumbbell className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">Upper Body Strength</div>
                  <div className="text-sm text-gray-400">Yesterday • 45 min</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">8 exercises</div>
                  <div className="text-xs text-gray-400">1,200 cal</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">Cardio Blast</div>
                  <div className="text-sm text-gray-400">2 days ago • 30 min</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">HIIT</div>
                  <div className="text-xs text-gray-400">850 cal</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">AI Recommendations</h3>
              <button 
                onClick={() => handleQuickAction('ai')}
                className="text-teal-400 hover:text-teal-300 text-sm font-medium flex items-center gap-1"
              >
                Get More <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">Increase Protein Intake</div>
                    <div className="text-sm text-gray-300 mb-2">You're 7.5g below your daily protein goal. Try adding Greek yogurt or a protein shake.</div>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">Learn More</button>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">Great Progress!</div>
                    <div className="text-sm text-gray-300 mb-2">Your 7-day streak is impressive. Keep up the consistency for optimal results.</div>
                    <button className="text-green-400 hover:text-green-300 text-sm font-medium">View Progress</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Coach Integration */}
        <div className="mt-8">
          <AICoach userData={userData} />
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}