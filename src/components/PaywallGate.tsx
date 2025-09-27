"use client";

import React, { useState } from 'react';
import { Crown, Star, Zap, ArrowRight, X } from 'lucide-react';
import PricingCard from './PricingCard';

interface PaywallGateProps {
  children: React.ReactNode;
  feature: string;
  requiredTier?: 'pro' | 'premium';
  onUpgrade?: () => void;
}

const PaywallGate: React.FC<PaywallGateProps> = ({ 
  children, 
  feature, 
  requiredTier = 'pro',
  onUpgrade 
}) => {
  const [showPricing, setShowPricing] = useState(false);

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      setShowPricing(true);
    }
  };

  return (
    <>
      <div className="relative">
        <div className="paywall-blur">
          {children}
        </div>
        
        <div className="paywall-overlay">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 text-center">
            <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">
              Unlock {feature}
            </h3>
            
            <p className="text-gray-400 mb-6">
              This feature is available with FitnessPro {requiredTier === 'premium' ? 'Premium' : 'Pro'}. 
              Upgrade now to access advanced analytics, AI recommendations, and more!
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-left">
                <Star className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Advanced Analytics</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <Zap className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">AI-Powered Recommendations</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <Crown className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Priority Support</span>
              </div>
            </div>

            <button
              onClick={handleUpgrade}
              className="w-full bg-green-400 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-500 transition flex items-center justify-center gap-2"
            >
              Upgrade to Pro
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      {showPricing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
              <button
                onClick={() => setShowPricing(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PricingCard
                plan="monthly"
                isPopular={false}
                onSelect={() => {
                  // Handle monthly subscription
                  setShowPricing(false);
                }}
              />
              <PricingCard
                plan="annual"
                isPopular={true}
                onSelect={() => {
                  // Handle annual subscription
                  setShowPricing(false);
                }}
              />
              <PricingCard
                plan="cookbook"
                isPopular={false}
                onSelect={() => {
                  // Handle cookbook purchase
                  setShowPricing(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaywallGate;











