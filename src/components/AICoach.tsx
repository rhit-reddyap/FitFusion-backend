"use client";

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  BarChart3,
  Calendar,
  Utensils,
  Moon,
  Dumbbell,
  Star,
  ArrowRight,
  Clock,
  Zap
} from 'lucide-react';
import { AIAnalyticsEngine, AIInsight, AIRecommendation } from '@/lib/aiAnalytics';

interface AICoachProps {
  userData: any;
}

const AICoach: React.FC<AICoachProps> = ({ userData }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [nutritionPlan, setNutritionPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'recommendations' | 'plans'>('insights');

  useEffect(() => {
    if (userData) {
      analyzeData();
    }
  }, [userData]);

  const analyzeData = () => {
    setLoading(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const aiEngine = new AIAnalyticsEngine(userData);
      
      const newInsights = [
        ...aiEngine.analyzeWorkoutPatterns(),
        ...aiEngine.analyzeNutritionPatterns(),
        ...aiEngine.analyzeRecoveryPatterns()
      ];
      
      const newRecommendations = aiEngine.generateRecommendations();
      const newWorkoutPlan = aiEngine.generateWorkoutPlan();
      const newNutritionPlan = aiEngine.generateNutritionPlan();
      
      setInsights(newInsights);
      setRecommendations(newRecommendations);
      setWorkoutPlan(newWorkoutPlan);
      setNutritionPlan(nutritionPlan);
      setLoading(false);
    }, 2000);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Dumbbell className="w-5 h-5" />;
      case 'volume': return <BarChart3 className="w-5 h-5" />;
      case 'recovery': return <Moon className="w-5 h-5" />;
      case 'nutrition': return <Utensils className="w-5 h-5" />;
      case 'progression': return <TrendingUp className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'achievement': return <CheckCircle className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/30 bg-red-500/10';
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'low': return 'border-green-500/30 bg-green-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-400';
    if (priority >= 6) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
        <p className="text-center text-gray-400 mt-4">AI is analyzing your data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Coach</h2>
            <p className="text-gray-400">Personalized insights and recommendations</p>
          </div>
        </div>
        <button
          onClick={analyzeData}
          className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Refresh Analysis
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'insights', label: 'Insights', icon: Lightbulb },
          { id: 'recommendations', label: 'Recommendations', icon: Target },
          { id: 'plans', label: 'Plans', icon: Calendar }
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

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No insights available</h3>
              <p className="text-gray-500">Complete more workouts and log nutrition to get AI insights</p>
            </div>
          ) : (
            insights.map((insight, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl border ${getInsightColor(insight.priority)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        insight.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-3">{insight.message}</p>
                    {insight.actionable && insight.action && (
                      <div className="flex items-center gap-2 text-sm text-teal-400">
                        <ArrowRight className="w-4 h-4" />
                        <span>{insight.action}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No recommendations yet</h3>
              <p className="text-gray-500">Keep logging data to get personalized recommendations</p>
            </div>
          ) : (
            recommendations.map((rec, index) => (
              <div key={index} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-500/20 rounded-lg">
                      <Target className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{rec.title}</h3>
                      <p className="text-gray-400">{rec.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}/10
                    </div>
                    <div className="text-sm text-gray-400">Priority</div>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{rec.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Estimated Impact</h4>
                    <p className="text-sm text-gray-400">{rec.estimated_impact}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Timeline</h4>
                    <p className="text-sm text-gray-400">{rec.timeline}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Implementation Steps</h4>
                  <ul className="space-y-1">
                    {rec.implementation.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Workout Plan */}
          {workoutPlan && (
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Dumbbell className="w-6 h-6 text-teal-400" />
                <h3 className="text-xl font-semibold text-white">Personalized Workout Plan</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-1">Program</h4>
                  <p className="text-gray-400">{workoutPlan.name}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-1">Duration</h4>
                  <p className="text-gray-400">{workoutPlan.duration} weeks</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-1">Frequency</h4>
                  <p className="text-gray-400">{workoutPlan.frequency} days/week</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-3">Workout Schedule</h4>
                <div className="space-y-2">
                  {workoutPlan.workouts.map((workout: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                      <div>
                        <h5 className="font-medium text-white">{workout.name}</h5>
                        <p className="text-sm text-gray-400">{workout.exercises.length} exercises</p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{workout.duration} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Nutrition Plan */}
          {nutritionPlan && (
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Utensils className="w-6 h-6 text-teal-400" />
                <h3 className="text-xl font-semibold text-white">Personalized Nutrition Plan</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-white mb-3">Daily Targets</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Calories</span>
                      <span className="text-white">{nutritionPlan.daily_targets.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Protein</span>
                      <span className="text-white">{nutritionPlan.daily_targets.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Carbs</span>
                      <span className="text-white">{nutritionPlan.daily_targets.carbs}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fat</span>
                      <span className="text-white">{nutritionPlan.daily_targets.fat}g</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-3">Current Averages</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Calories</span>
                      <span className="text-white">{nutritionPlan.current_averages.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Protein</span>
                      <span className="text-white">{nutritionPlan.current_averages.protein}g</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {nutritionPlan.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <Star className="w-4 h-4 text-teal-400" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AICoach;


















