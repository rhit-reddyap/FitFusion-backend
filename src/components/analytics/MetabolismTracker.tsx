"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Flame,
  BarChart3,
  Calendar,
  Scale,
  Heart,
  Brain,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface MetabolismData {
  currentBMR: number;
  previousBMR: number;
  trend: number; // percentage change
  confidence: number; // 0-100
  lastUpdated: string;
  weeklyData: {
    date: string;
    caloriesConsumed: number;
    caloriesBurned: number;
    weight: number;
    bmr: number;
  }[];
  recommendations: {
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info' | 'error';
    actionable: boolean;
  }[];
}

interface MetabolismTrackerProps {
  userId: string;
  onRecommendationAction: (recommendation: any) => void;
}

const MetabolismTracker: React.FC<MetabolismTrackerProps> = ({ 
  userId, 
  onRecommendationAction 
}) => {
  const [metabolismData, setMetabolismData] = useState<MetabolismData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadMetabolismData();
  }, [userId, selectedPeriod]);

  const loadMetabolismData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data - in real app, this would calculate from actual user data
    const mockData: MetabolismData = {
      currentBMR: 1850,
      previousBMR: 1820,
      trend: 1.6,
      confidence: 87,
      lastUpdated: new Date().toISOString(),
      weeklyData: generateWeeklyData(),
      recommendations: [
        {
          title: "Metabolism Optimization",
          message: "Your BMR has increased 1.6% this week. Consider increasing protein intake to support muscle mass.",
          type: "success",
          actionable: true
        },
        {
          title: "Weight Stability",
          message: "Your weight has been stable for 2 weeks. This suggests your current calorie intake matches your metabolism.",
          type: "info",
          actionable: false
        },
        {
          title: "Activity Level Impact",
          message: "Your increased activity has boosted your metabolism. Keep up the consistent exercise routine!",
          type: "success",
          actionable: false
        }
      ]
    };
    
    setMetabolismData(mockData);
    setIsLoading(false);
  };

  const generateWeeklyData = () => {
    const data = [];
    const baseBMR = 1800;
    const baseWeight = 75;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate realistic daily variations
      const weightVariation = (Math.random() - 0.5) * 0.5; // ±0.25kg
      const calorieVariation = (Math.random() - 0.5) * 200; // ±100 calories
      const activityVariation = Math.random() * 300; // 0-300 calories
      
      data.push({
        date: date.toISOString().split('T')[0],
        caloriesConsumed: Math.round(1850 + calorieVariation),
        caloriesBurned: Math.round(400 + activityVariation),
        weight: Math.round((baseWeight + weightVariation) * 10) / 10,
        bmr: Math.round(baseBMR + (weightVariation * 20) + (Math.random() - 0.5) * 50)
      });
    }
    
    return data;
  };

  const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
    // Mifflin-St Jeor Equation
    if (gender === 'male') {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRecommendationColor = (type: string) => {
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

  if (!metabolismData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Metabolism Tracker</h2>
              <p className="text-gray-400">AI-powered BMR estimation and optimization</p>
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
            { id: '90d', label: '90 Days' }
          ].map(period => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id as any)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedPeriod === period.id
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current BMR */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(metabolismData.trend)}
              <span className={`text-sm font-medium ${getTrendColor(metabolismData.trend)}`}>
                {Math.abs(metabolismData.trend)}%
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {metabolismData.currentBMR}
          </div>
          <div className="text-sm text-gray-400 mb-2">Current BMR (cal/day)</div>
          <div className="text-xs text-gray-500">
            vs {metabolismData.previousBMR} last week
          </div>
        </div>

        {/* Confidence Score */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div className={`text-sm font-medium ${getConfidenceColor(metabolismData.confidence)}`}>
              {metabolismData.confidence}%
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {metabolismData.confidence}
          </div>
          <div className="text-sm text-gray-400 mb-2">Confidence Score</div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metabolismData.confidence}%` }}
            />
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-sm text-gray-400">
              {selectedPeriod} trend
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {metabolismData.trend > 0 ? '+' : ''}{metabolismData.trend}%
          </div>
          <div className="text-sm text-gray-400 mb-2">BMR Change</div>
          <div className="text-xs text-gray-500">
            {metabolismData.trend > 0 ? 'Metabolism increasing' : 
             metabolismData.trend < 0 ? 'Metabolism decreasing' : 'Stable metabolism'}
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-6">Weekly Metabolism Data</h3>
        <div className="space-y-4">
          {metabolismData.weeklyData.map((day, index) => (
            <div key={day.date} className="flex items-center gap-4">
              <div className="w-16 text-sm font-medium text-gray-400">
                {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-4 gap-4 mb-2">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Consumed</div>
                    <div className="text-lg font-semibold text-white">{day.caloriesConsumed}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Burned</div>
                    <div className="text-lg font-semibold text-orange-400">{day.caloriesBurned}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Weight</div>
                    <div className="text-lg font-semibold text-blue-400">{day.weight}kg</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">BMR</div>
                    <div className="text-lg font-semibold text-green-400">{day.bmr}</div>
                  </div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${(day.bmr / 2500) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Recommendations</h3>
            <p className="text-gray-400">Personalized suggestions to optimize your metabolism</p>
          </div>
        </div>

        <div className="space-y-4">
          {metabolismData.recommendations.map((recommendation, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border ${getRecommendationColor(recommendation.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{recommendation.title}</h4>
                  <p className="text-gray-300 text-sm">{recommendation.message}</p>
                </div>
                {recommendation.actionable && (
                  <button
                    onClick={() => onRecommendationAction(recommendation)}
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

      {/* Metabolism Calculator */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-6">BMR Calculator</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Manual Calculation</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="75"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
                <input
                  type="number"
                  placeholder="175"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                <input
                  type="number"
                  placeholder="30"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-300">
                Calculate BMR
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">AI Estimation</h4>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-6 h-6 text-purple-400" />
                <span className="text-white font-semibold">AI-Powered BMR</span>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Our AI analyzes your calorie intake, weight changes, and activity levels to provide a more accurate BMR estimate than traditional formulas.
              </p>
              <div className="text-2xl font-bold text-white mb-2">
                {metabolismData.currentBMR} cal/day
              </div>
              <div className="text-sm text-gray-400">
                Confidence: {metabolismData.confidence}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetabolismTracker;


















