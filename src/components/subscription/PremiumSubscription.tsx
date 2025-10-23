"use client";

import React, { useState } from 'react';
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Brain, 
  BarChart3, 
  Users, 
  Shield,
  ArrowRight,
  Sparkles,
  Award,
  Target,
  Calendar,
  ChefHat,
  TrendingUp
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  description: string;
  features: string[];
  popular?: boolean;
  savings?: number;
}

interface PremiumSubscriptionProps {
  onSubscribe: (planId: string) => void;
  onClose: () => void;
  currentPlan?: string;
}

const PremiumSubscription: React.FC<PremiumSubscriptionProps> = ({ 
  onSubscribe, 
  onClose, 
  currentPlan 
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const plans: SubscriptionPlan[] = [
    {
      id: 'monthly',
      name: 'Fit Fusion Pro',
      price: 5,
      period: 'monthly',
      description: 'Unlock the full potential of your fitness journey',
      features: [
        'AI-powered meal planning',
        'Advanced nutrition analytics',
        'Barcode scanning',
        'Unlimited food database',
        'Custom meal plans',
        'Progress tracking',
        'Export data',
        'Priority support'
      ]
    },
    {
      id: 'yearly',
      name: 'Fit Fusion Pro',
      price: 50,
      period: 'yearly',
      description: 'Best value - Save 17% with annual billing',
      features: [
        'Everything in Monthly',
        'Exclusive yearly features',
        'Advanced AI insights',
        'Community challenges',
        'Recipe database access',
        'Nutritionist consultations',
        'Custom goal tracking',
        'Data backup & sync'
      ],
      popular: true,
      savings: 17
    }
  ];

  const premiumFeatures = [
    {
      icon: Brain,
      title: 'AI Meal Planner',
      description: 'Get personalized meal plans based on your goals, preferences, and dietary restrictions',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Deep insights into your nutrition patterns with AI-powered recommendations',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      title: 'Smart Goal Tracking',
      description: 'Intelligent goal setting and tracking with adaptive recommendations',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Users,
      title: 'Community Features',
      description: 'Join challenges, share achievements, and connect with like-minded people',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: ChefHat,
      title: 'Recipe Database',
      description: 'Access thousands of premium recipes with detailed nutrition information',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: TrendingUp,
      title: 'Progress Insights',
      description: 'AI-powered analysis of your progress with actionable recommendations',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call Stripe API
      await new Promise(resolve => setTimeout(resolve, 2000));
      onSubscribe(planId);
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlanData = plans.find(plan => plan.period === selectedPlan);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Upgrade to Premium</h2>
                <p className="text-gray-400">Unlock the full potential of Fit Fusion AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Premium Features Grid */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Why Upgrade to Premium?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h3>
              <p className="text-gray-400">Cancel anytime, no questions asked</p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gray-800 rounded-xl p-1 flex">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedPlan === 'monthly'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedPlan === 'yearly'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Yearly
                  <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-gray-800 rounded-2xl p-8 border-2 transition-all duration-300 ${
                    plan.popular
                      ? 'border-purple-500 scale-105'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                        <Star className="w-4 h-4 fill-current" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h4 className="text-2xl font-bold text-white mb-2">{plan.name}</h4>
                    <p className="text-gray-400 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-gray-400">/{plan.period === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    {plan.savings && (
                      <div className="text-green-400 text-sm font-medium mt-2">
                        Save ${(plan.price * 12) - 50} per year
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Start Free Trial
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Free Trial Info */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h4 className="text-lg font-semibold text-white">7-Day Free Trial</h4>
            </div>
            <p className="text-gray-300 mb-4">
              Try all premium features for 7 days completely free. Cancel anytime during your trial 
              and you won't be charged. No commitment, no risk.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Full access</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Instant activation</span>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm mb-4">
              Trusted by 50,000+ fitness enthusiasts worldwide
            </p>
            <div className="flex items-center justify-center gap-6 text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Secure payment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">GDPR compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumSubscription;


















