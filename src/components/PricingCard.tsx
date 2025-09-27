"use client";

import React, { useState } from 'react';
import { Check, Star, ArrowRight } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/stripe';

interface PricingCardProps {
  plan: keyof typeof PRICING_PLANS;
  isPopular?: boolean;
  onSelect: (plan: keyof typeof PRICING_PLANS) => void;
  loading?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, isPopular = false, onSelect, loading = false }) => {
  const planData = PRICING_PLANS[plan];
  const [promoCode, setPromoCode] = useState('');

  const handleSelect = () => {
    onSelect(plan);
  };

  return (
    <div className={`relative bg-gray-800 rounded-2xl p-8 border-2 transition-all duration-200 ${
      isPopular 
        ? 'border-green-400 shadow-lg shadow-green-400/20' 
        : 'border-gray-600 hover:border-gray-500'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-400 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Star className="w-4 h-4" />
            Most Popular
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">{planData.name}</h3>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-bold text-white">{planData.price}</span>
          <span className="text-gray-400">/{planData.period}</span>
        </div>
        {'originalPrice' in planData && planData.originalPrice && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-gray-400 line-through">{planData.originalPrice}</span>
            <span className="bg-green-400 text-white px-2 py-1 rounded text-sm font-medium">
              Save {planData.savings}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-8">
        {planData.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="text-gray-300">{feature}</span>
          </div>
        ))}
      </div>

      {plan === 'cookbook' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Promo Code (Optional)
          </label>
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter promo code"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      )}

      <button
        onClick={handleSelect}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
          isPopular
            ? 'bg-green-400 text-white hover:bg-green-500'
            : 'bg-gray-700 text-white hover:bg-gray-600'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {plan === 'cookbook' ? 'Buy Now' : 'Start Free Trial'}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {plan !== 'cookbook' && (
        <p className="text-center text-sm text-gray-400 mt-4">
          Cancel anytime. No commitment.
        </p>
      )}
    </div>
  );
};

export default PricingCard;

