"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Sparkles, 
  Target, 
  Calendar,
  Zap,
  Brain,
  ArrowRight,
  Check,
  Star,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface AIPlan {
  id: number;
  user_id: string;
  plan_type: 'workout' | 'nutrition' | 'comprehensive';
  goals: string[];
  preferences: any;
  generated_at: string;
  status: 'active' | 'completed' | 'paused';
  recommendations: any[];
}

function AIContent() {
  const { user, profile } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<AIPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<'workout' | 'nutrition' | 'comprehensive'>('comprehensive');

  const fitnessGoals = [
    'Lose Weight',
    'Build Muscle',
    'Get Stronger',
    'Improve Endurance',
    'General Fitness',
    'Athletic Performance',
    'Rehabilitation',
    'Flexibility'
  ];

  useEffect(() => {
    fetchCurrentPlan();
  }, [user]);

  const fetchCurrentPlan = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentPlan(data);
    } catch (error) {
      console.error('Error fetching AI plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    if (!user || selectedGoals.length === 0) return;

    setGenerating(true);

    try {
      // Simulate AI plan generation
      const planData = {
        user_id: user.id,
        plan_type: selectedPlanType,
        goals: selectedGoals,
        preferences: {
          experience_level: profile?.activity_level || 'moderate',
          time_commitment: '30-45 minutes',
          equipment_available: ['bodyweight', 'dumbbells'],
          dietary_restrictions: [],
          workout_frequency: 4
        },
        status: 'active',
        recommendations: generateRecommendations(selectedPlanType, selectedGoals)
      };

      const { data, error } = await supabase
        .from('ai_plans')
        .insert(planData)
        .select()
        .single();

      if (error) throw error;

      setCurrentPlan(data);
    } catch (error) {
      console.error('Error generating AI plan:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateRecommendations = (planType: string, goals: string[]) => {
    const recommendations = [];

    if (planType === 'workout' || planType === 'comprehensive') {
      recommendations.push({
        type: 'workout',
        title: 'Weekly Workout Schedule',
        description: 'Optimized workout plan based on your goals',
        details: {
          monday: 'Upper Body Strength',
          tuesday: 'Cardio & Core',
          wednesday: 'Lower Body Strength',
          thursday: 'Active Recovery',
          friday: 'Full Body HIIT',
          saturday: 'Flexibility & Mobility',
          sunday: 'Rest Day'
        }
      });
    }

    if (planType === 'nutrition' || planType === 'comprehensive') {
      recommendations.push({
        type: 'nutrition',
        title: 'Daily Nutrition Plan',
        description: 'Personalized meal plan for your goals',
        details: {
          calories: 2200,
          protein: 165,
          carbs: 275,
          fat: 73,
          meals: [
            'High-protein breakfast with oats',
            'Lean protein with vegetables for lunch',
            'Balanced dinner with complex carbs',
            'Healthy snacks between meals'
          ]
        }
      });
    }

    if (planType === 'comprehensive') {
      recommendations.push({
        type: 'lifestyle',
        title: 'Lifestyle Recommendations',
        description: 'Daily habits to support your fitness goals',
        details: {
          sleep: '7-9 hours per night',
          hydration: '3-4 liters of water daily',
          stress_management: '10 minutes meditation daily',
          recovery: 'Active recovery on rest days'
        }
      });
    }

    return recommendations;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar activePage="ai-plans" />
        <div className="main-content flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activePage="ai-plans" />
      
      <div className="main-content">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Coach</h1>
            <p className="text-gray-400">Get personalized fitness and nutrition plans powered by AI</p>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-green-400" />
            <span className="text-green-400 font-medium">AI Powered</span>
              </div>
            </div>

        {currentPlan ? (
          <div className="space-y-8">
            {/* Current Plan Header */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                  <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Your AI Plan</h2>
                  <p className="text-gray-400">
                    Generated on {new Date(currentPlan.generated_at).toLocaleDateString()}
                  </p>
                  </div>
                  <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 font-medium">Active</span>
                  </div>
                </div>

              <div className="flex flex-wrap gap-2">
                {currentPlan.goals.map((goal, index) => (
                  <span key={index} className="px-3 py-1 bg-green-400/20 text-green-400 text-sm rounded-full">
                    {goal}
                  </span>
                ))}
                    </div>
                  </div>

            {/* Recommendations */}
            <div className="space-y-6">
              {currentPlan.recommendations.map((rec, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                      {rec.type === 'workout' && <Target className="w-6 h-6 text-white" />}
                      {rec.type === 'nutrition' && <Sparkles className="w-6 h-6 text-white" />}
                      {rec.type === 'lifestyle' && <Brain className="w-6 h-6 text-white" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{rec.title}</h3>
                      <p className="text-gray-400 mb-4">{rec.description}</p>
                </div>
              </div>

                  <div className="space-y-4">
                    {rec.type === 'workout' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(rec.details).map(([day, workout]) => (
                          <div key={day} className="bg-gray-700 rounded-lg p-4">
                            <div className="font-medium text-white capitalize mb-1">{day}</div>
                            <div className="text-gray-400 text-sm">{String(workout)}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {rec.type === 'nutrition' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{rec.details.calories}</div>
                          <div className="text-sm text-gray-400">Calories</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{rec.details.protein}g</div>
                          <div className="text-sm text-gray-400">Protein</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{rec.details.carbs}g</div>
                          <div className="text-sm text-gray-400">Carbs</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{rec.details.fat}g</div>
                          <div className="text-sm text-gray-400">Fat</div>
                        </div>
                </div>
                    )}

                    {rec.type === 'lifestyle' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(rec.details).map(([key, value]) => (
                          <div key={key} className="bg-gray-700 rounded-lg p-4">
                            <div className="font-medium text-white capitalize mb-1">
                              {key.replace('_', ' ')}
                            </div>
                            <div className="text-gray-400 text-sm">{String(value)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                        </div>
                      </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button className="btn flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Add to Calendar
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Track Progress
                        </button>
                        <button
                onClick={() => setCurrentPlan(null)}
                className="btn-outline flex items-center gap-2"
              >
                Generate New Plan
                        </button>
                      </div>
                    </div>
        ) : (
          <div className="space-y-8">
            {/* Plan Type Selection */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Choose Your Plan Type</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setSelectedPlanType('workout')}
                  className={`p-6 rounded-lg cursor-pointer transition ${
                    selectedPlanType === 'workout'
                      ? 'bg-green-400 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <Target className="w-8 h-8 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Workout Plan</h3>
                  <p className="text-sm opacity-75">
                    Personalized workout routines and exercise recommendations
                  </p>
                </div>

                <div
                  onClick={() => setSelectedPlanType('nutrition')}
                  className={`p-6 rounded-lg cursor-pointer transition ${
                    selectedPlanType === 'nutrition'
                      ? 'bg-green-400 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <Sparkles className="w-8 h-8 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nutrition Plan</h3>
                  <p className="text-sm opacity-75">
                    Custom meal plans and nutrition guidance
                  </p>
                </div>

                <div
                  onClick={() => setSelectedPlanType('comprehensive')}
                  className={`p-6 rounded-lg cursor-pointer transition ${
                    selectedPlanType === 'comprehensive'
                      ? 'bg-green-400 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <Brain className="w-8 h-8 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Complete Plan</h3>
                  <p className="text-sm opacity-75">
                    Full workout and nutrition plan with lifestyle recommendations
                  </p>
                </div>
                </div>
              </div>

            {/* Goals Selection */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">What are your fitness goals?</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {fitnessGoals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => {
                      setSelectedGoals(prev => 
                        prev.includes(goal) 
                          ? prev.filter(g => g !== goal)
                          : [...prev, goal]
                      );
                    }}
                    className={`p-4 rounded-lg text-left transition ${
                      selectedGoals.includes(goal)
                        ? 'bg-green-400 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedGoals.includes(goal) && <Check className="w-4 h-4" />}
                      <span className="font-medium">{goal}</span>
                    </div>
                  </button>
                ))}
              </div>
                </div>

            {/* Generate Button */}
            <div className="text-center">
              <button
                onClick={generatePlan}
                disabled={selectedGoals.length === 0 || generating}
                className="btn text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Your Plan...
                      </div>
                ) : (
                      <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generate My AI Plan
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
                        </button>
              
              {selectedGoals.length === 0 && (
                <p className="text-gray-400 mt-4">Please select at least one goal to continue</p>
              )}
                      </div>
                    </div>
        )}
                </div>
              </div>
  );
}

export default function AI() {
  return (
    <AuthGuard>
      <AIContent />
    </AuthGuard>
  );
}