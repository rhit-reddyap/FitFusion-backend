"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award, 
  Zap, 
  Brain,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Flame,
  Droplets,
  Apple,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface AnalyticsData {
  period: '7d' | '30d' | '90d' | '1y';
  calories: {
    average: number;
    trend: number;
    goal: number;
    consistency: number;
  };
  macros: {
    protein: { average: number; trend: number; goal: number };
    carbs: { average: number; trend: number; goal: number };
    fat: { average: number; trend: number; goal: number };
  };
  insights: {
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info' | 'error';
    actionable: boolean;
  }[];
  streaks: {
    current: number;
    longest: number;
    type: 'logging' | 'goals' | 'macro_balance';
  };
  achievements: {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    progress: number;
  }[];
  weeklyPattern: {
    day: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

interface NutritionAnalyticsProps {
  userGoals: any;
  onInsightAction: (insight: any) => void;
}

const NutritionAnalytics: React.FC<NutritionAnalyticsProps> = ({ userGoals, onInsightAction }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data based on selected period
    const mockData: AnalyticsData = {
      period: selectedPeriod,
      calories: {
        average: selectedPeriod === '7d' ? 1847 : selectedPeriod === '30d' ? 1923 : 1895,
        trend: selectedPeriod === '7d' ? 5.2 : selectedPeriod === '30d' ? 3.1 : 1.8,
        goal: userGoals.daily_calories,
        consistency: selectedPeriod === '7d' ? 85 : selectedPeriod === '30d' ? 78 : 72
      },
      macros: {
        protein: { 
          average: selectedPeriod === '7d' ? 142 : selectedPeriod === '30d' ? 138 : 135,
          trend: selectedPeriod === '7d' ? 8.5 : selectedPeriod === '30d' ? 4.2 : 2.1,
          goal: userGoals.daily_protein
        },
        carbs: { 
          average: selectedPeriod === '7d' ? 198 : selectedPeriod === '30d' ? 203 : 207,
          trend: selectedPeriod === '7d' ? -2.1 : selectedPeriod === '30d' ? 1.3 : 0.8,
          goal: userGoals.daily_carbs
        },
        fat: { 
          average: selectedPeriod === '7d' ? 78 : selectedPeriod === '30d' ? 82 : 85,
          trend: selectedPeriod === '7d' ? 3.2 : selectedPeriod === '30d' ? 2.1 : 1.5,
          goal: userGoals.daily_fat
        }
      },
      insights: [
        {
          title: "Protein Intake Optimization",
          message: "Your protein intake is 8% below your goal. Consider adding Greek yogurt or lean meats to your snacks.",
          type: "warning",
          actionable: true
        },
        {
          title: "Consistent Calorie Tracking",
          message: "Great job! You've logged meals 85% of the time this week. Keep up the consistency!",
          type: "success",
          actionable: false
        },
        {
          title: "Carb Timing Insight",
          message: "Your carb intake peaks at dinner. Consider redistributing carbs to pre-workout meals for better performance.",
          type: "info",
          actionable: true
        }
      ],
      streaks: {
        current: 12,
        longest: 28,
        type: 'logging'
      },
      achievements: [
        {
          id: '1',
          name: 'Consistent Logger',
          description: 'Log meals for 7 days straight',
          icon: '📊',
          earned: true,
          progress: 100
        },
        {
          id: '2',
          name: 'Protein Power',
          description: 'Meet protein goal for 5 days',
          icon: '💪',
          earned: true,
          progress: 100
        },
        {
          id: '3',
          name: 'Macro Master',
          description: 'Perfect macro balance for 3 days',
          icon: '🎯',
          earned: false,
          progress: 67
        },
        {
          id: '4',
          name: 'Streak Champion',
          description: '30-day logging streak',
          icon: '🔥',
          earned: false,
          progress: 43
        }
      ],
      weeklyPattern: [
        { day: 'Mon', calories: 1850, protein: 140, carbs: 200, fat: 75 },
        { day: 'Tue', calories: 1920, protein: 145, carbs: 210, fat: 80 },
        { day: 'Wed', calories: 1780, protein: 135, carbs: 190, fat: 70 },
        { day: 'Thu', calories: 2050, protein: 155, carbs: 220, fat: 85 },
        { day: 'Fri', calories: 1980, protein: 150, carbs: 215, fat: 82 },
        { day: 'Sat', calories: 2200, protein: 160, carbs: 240, fat: 90 },
        { day: 'Sun', calories: 1900, protein: 145, carbs: 205, fat: 78 }
      ]
    };
    
    setAnalyticsData(mockData);
    setIsLoading(false);
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-400" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-400';
    if (trend < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500/30 bg-green-500/10';
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'error': return 'border-red-500/30 bg-red-500/10';
      default: return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Nutrition Analytics</h2>
              <p className="text-gray-400">AI-powered insights and trends</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-400">Premium Feature</span>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' },
            { id: '1y', label: '1 Year' }
          ].map(period => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id as any)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedPeriod === period.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(analyticsData.calories.trend)}
              <span className={`text-sm font-medium ${getTrendColor(analyticsData.calories.trend)}`}>
                {Math.abs(analyticsData.calories.trend)}%
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {analyticsData.calories.average}
          </div>
          <div className="text-sm text-gray-400 mb-2">Avg Calories</div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(analyticsData.calories.average / analyticsData.calories.goal) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Goal: {analyticsData.calories.goal} cal
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-500/20 rounded-xl">
              <Droplets className="w-6 h-6 text-teal-400" />
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(analyticsData.macros.protein.trend)}
              <span className={`text-sm font-medium ${getTrendColor(analyticsData.macros.protein.trend)}`}>
                {Math.abs(analyticsData.macros.protein.trend)}%
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {analyticsData.macros.protein.average}g
          </div>
          <div className="text-sm text-gray-400 mb-2">Avg Protein</div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-teal-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(analyticsData.macros.protein.average / analyticsData.macros.protein.goal) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Goal: {analyticsData.macros.protein.goal}g
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-sm text-gray-400">
              {analyticsData.calories.consistency}%
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {analyticsData.streaks.current}
          </div>
          <div className="text-sm text-gray-400 mb-2">Day Streak</div>
          <div className="text-xs text-gray-500">
            Best: {analyticsData.streaks.longest} days
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-sm text-gray-400">
              {analyticsData.achievements.filter(a => a.earned).length}/{analyticsData.achievements.length}
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {analyticsData.achievements.filter(a => a.earned).length}
          </div>
          <div className="text-sm text-gray-400 mb-2">Achievements</div>
          <div className="text-xs text-gray-500">
            Keep going!
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Insights</h3>
            <p className="text-gray-400">Personalized recommendations based on your data</p>
          </div>
        </div>

        <div className="space-y-4">
          {analyticsData.insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                  <p className="text-gray-300 text-sm">{insight.message}</p>
                </div>
                {insight.actionable && (
                  <button
                    onClick={() => onInsightAction(insight)}
                    className="ml-4 px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Take Action
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Pattern Chart */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-6">Weekly Pattern</h3>
        <div className="space-y-4">
          {analyticsData.weeklyPattern.map((day, index) => (
            <div key={day.day} className="flex items-center gap-4">
              <div className="w-12 text-sm font-medium text-gray-400">{day.day}</div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">Calories</div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(day.calories / 2500) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{day.calories}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">Protein</div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(day.protein / 200) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{day.protein}g</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">Carbs</div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(day.carbs / 300) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{day.carbs}g</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">Fat</div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(day.fat / 100) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{day.fat}g</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-6">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analyticsData.achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border ${
                achievement.earned 
                  ? 'border-yellow-500/30 bg-yellow-500/10' 
                  : 'border-gray-700 bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{achievement.name}</h4>
                  <p className="text-sm text-gray-400">{achievement.description}</p>
                  {!achievement.earned && (
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
    </div>
  );
};

export default NutritionAnalytics;









