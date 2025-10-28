"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  Dumbbell,
  Apple,
  Scale,
  Award,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  workouts: any[];
  foodLogs: any[];
  bodyComposition: any[];
  personalRecords: any[];
  weeklyVolume: any[];
  muscleGroupVolume: any[];
  nutritionTrends: any[];
  streaks: {
    workout_streak: number;
    food_log_streak: number;
  };
  badges: any[];
  xpProgress: {
    current: number;
    next_level: number;
    level: number;
  };
}

function AnalyticsContent() {
  const { user, profile } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, timeRange]);

  const fetchAnalyticsData = async () => {
    if (!user) return;

    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch workouts with analytics
      const { data: workouts } = await supabase
        .from('workout_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date');

      // Fetch food logs
      const { data: foodLogs } = await supabase
        .from('food_logs')
        .select(`
          *,
          food:foods(*)
        `)
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date');

      // Fetch body composition
      const { data: bodyComposition } = await supabase
        .from('body_composition')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date');

      // Fetch personal records
      const { data: personalRecords } = await supabase
        .from('personal_records')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('user_id', user.id)
        .order('date_achieved', { ascending: false });

      // Fetch user badges
      const { data: badges } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      // Process data for charts
      const weeklyVolume = processWeeklyVolume(workouts || []);
      const muscleGroupVolume = processMuscleGroupVolume(workouts || []);
      const nutritionTrends = processNutritionTrends(foodLogs || []);

      setData({
        workouts: workouts || [],
        foodLogs: foodLogs || [],
        bodyComposition: bodyComposition || [],
        personalRecords: personalRecords || [],
        weeklyVolume,
        muscleGroupVolume,
        nutritionTrends,
        streaks: {
          workout_streak: profile?.streak_days || 0,
          food_log_streak: 0 // Calculate from food logs
        },
        badges: badges || [],
        xpProgress: {
          current: profile?.xp_points || 0,
          next_level: ((profile?.level || 1) * 1000),
          level: profile?.level || 1
        }
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processWeeklyVolume = (workouts: any[]) => {
    return workouts.map(workout => ({
      date: workout.date,
      volume: workout.total_volume_kg,
      sets: workout.total_sets,
      reps: workout.total_reps
    }));
  };

  const processMuscleGroupVolume = (workouts: any[]) => {
    const muscleGroups: { [key: string]: number } = {};
    
    workouts.forEach(workout => {
      if (workout.muscle_groups_worked) {
        workout.muscle_groups_worked.forEach((group: string) => {
          muscleGroups[group] = (muscleGroups[group] || 0) + (workout.total_volume_kg || 0);
        });
      }
    });

    return Object.entries(muscleGroups).map(([name, value]) => ({
      name: name.replace('_', ' ').toUpperCase(),
      value
    }));
  };

  const processNutritionTrends = (foodLogs: any[]) => {
    const dailyTotals: { [key: string]: any } = {};

    foodLogs.forEach(log => {
      if (!log.food) return;
      
      const date = log.date;
      if (!dailyTotals[date]) {
        dailyTotals[date] = { date, calories: 0, protein: 0, carbs: 0, fat: 0 };
      }

      const multiplier = log.amount_g / 100;
      dailyTotals[date].calories += log.food.calories_per_100g * multiplier;
      dailyTotals[date].protein += log.food.protein_per_100g * multiplier;
      dailyTotals[date].carbs += log.food.carbs_per_100g * multiplier;
      dailyTotals[date].fat += log.food.fat_per_100g * multiplier;
    });

    return Object.values(dailyTotals).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const COLORS = ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534'];

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar activePage="analytics" />
        <div className="main-content flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activePage="analytics" />
      
      <div className="main-content">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-gray-400">Track your progress and performance</p>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Total Workouts</h3>
              <Dumbbell className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {data?.workouts.length || 0}
            </div>
            <div className="text-sm text-gray-400">
              {data?.streaks.workout_streak || 0} day streak
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Total Volume</h3>
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {Math.round(data?.workouts.reduce((sum, w) => sum + (w.total_volume_kg || 0), 0) || 0)}kg
            </div>
            <div className="text-sm text-gray-400">
              Lifted this period
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Personal Records</h3>
              <Award className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {data?.personalRecords.length || 0}
            </div>
            <div className="text-sm text-gray-400">
              New PRs achieved
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-400">Level Progress</h3>
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              Level {data?.xpProgress.level || 1}
            </div>
            <div className="text-sm text-gray-400">
              {data?.xpProgress.current || 0} / {data?.xpProgress.next_level || 1000} XP
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-green-400 h-2 rounded-full"
                style={{ 
                  width: `${((data?.xpProgress.current || 0) / (data?.xpProgress.next_level || 1000)) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Volume Trend */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Volume Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={data?.weeklyVolume || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#4ade80" 
                    strokeWidth={2}
                    dot={{ fill: '#4ade80' }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Muscle Group Volume */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Muscle Group Volume</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={data?.muscleGroupVolume || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      const percentValue = typeof percent === 'number' ? percent : 0;
                      return `${name} ${(percentValue * 100).toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(data?.muscleGroupVolume || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Nutrition Trends */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Nutrition Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={data?.nutritionTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <Line type="monotone" dataKey="calories" stroke="#4ade80" strokeWidth={2} />
                  <Line type="monotone" dataKey="protein" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="carbs" stroke="#16a34a" strokeWidth={2} />
                  <Line type="monotone" dataKey="fat" stroke="#15803d" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent PRs */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Personal Records</h3>
            <div className="space-y-3">
              {data?.personalRecords.slice(0, 5).map((pr, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">
                        {pr.exercise?.name}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {pr.weight_kg}kg × {pr.reps} reps
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-semibold">
                        {pr.pr_type?.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(pr.date_achieved).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!data?.personalRecords || data.personalRecords.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No personal records yet</p>
                  <p className="text-sm">Start logging workouts to track PRs!</p>
                </div>
              )}
            </div>
          </div>
          </div>

        {/* Badges */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data?.badges.map((userBadge, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-white text-sm mb-1">
                  {userBadge.badge?.name}
                </h4>
                <p className="text-xs text-gray-400">
                  {new Date(userBadge.earned_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {(!data?.badges || data.badges.length === 0) && (
              <div className="col-span-full text-center py-8 text-gray-400">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No badges earned yet</p>
                <p className="text-sm">Keep working out to earn achievements!</p>
              </div>
            )}
          </div>
        </div>
      </div>
          </div>
  );
}

export default function Analytics() {
  return (
    <AuthGuard>
      <AnalyticsContent />
    </AuthGuard>
  );
}