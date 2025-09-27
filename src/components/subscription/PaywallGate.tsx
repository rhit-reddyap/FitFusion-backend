"use client";

import React from 'react';
import { 
  Crown, 
  Lock, 
  Star, 
  ArrowRight, 
  Sparkles,
  Zap,
  Brain,
  BarChart3,
  Users,
  ChefHat,
  Target
} from 'lucide-react';

interface PaywallGateProps {
  feature: string;
  description: string;
  onUpgrade: () => void;
  children?: React.ReactNode;
  showPreview?: boolean;
}

const PaywallGate: React.FC<PaywallGateProps> = ({ 
  feature, 
  description, 
  onUpgrade, 
  children,
  showPreview = true 
}) => {
  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'ai meal planner':
        return Brain;
      case 'analytics':
        return BarChart3;
      case 'community':
        return Users;
      case 'recipes':
        return ChefHat;
      case 'goals':
        return Target;
      default:
        return Zap;
    }
  };

  const getFeatureColor = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'ai meal planner':
        return 'from-purple-500 to-pink-500';
      case 'analytics':
        return 'from-blue-500 to-cyan-500';
      case 'community':
        return 'from-orange-500 to-red-500';
      case 'recipes':
        return 'from-yellow-500 to-orange-500';
      case 'goals':
        return 'from-green-500 to-teal-500';
      default:
        return 'from-indigo-500 to-purple-500';
    }
  };

  const FeatureIcon = getFeatureIcon(feature);
  const gradientClass = getFeatureColor(feature);

  return (
    <div className="relative">
      {/* Blurred Content */}
      {showPreview && children && (
        <div className="paywall-blur">
          {children}
        </div>
      )}

      {/* Paywall Overlay */}
      <div className="paywall-overlay">
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-gray-700">
          <div className="text-center">
            {/* Icon */}
            <div className={`w-16 h-16 bg-gradient-to-r ${gradientClass} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <FeatureIcon className="w-8 h-8 text-white" />
            </div>

            {/* Crown Icon */}
            <div className="flex items-center justify-center mb-4">
              <Crown className="w-6 h-6 text-yellow-400 mr-2" />
              <span className="text-yellow-400 font-semibold">Premium Feature</span>
            </div>

            {/* Feature Name */}
            <h3 className="text-2xl font-bold text-white mb-2">{feature}</h3>
            <p className="text-gray-400 mb-6">{description}</p>

            {/* Benefits */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-left">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-300">Unlock advanced AI features</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-300">Get personalized recommendations</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-300">Access premium content</span>
              </div>
            </div>

            {/* Upgrade Button */}
            <button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Premium
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Free Trial Info */}
            <p className="text-gray-400 text-sm mt-4">
              7-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallGate;









