"use client";

import React from 'react';
import { Target, TrendingUp, Award, Zap, Droplets, Apple } from 'lucide-react';
import { DailyNutrition, NutritionGoals } from '@/types/nutrition';

interface DailySummaryProps {
  nutrition: DailyNutrition;
  onEditGoals: () => void;
}

const DailySummary: React.FC<DailySummaryProps> = ({ nutrition, onEditGoals }) => {
  const { total, goals, progress } = nutrition;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-400';
    if (percentage >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMacroBalance = () => {
    const totalMacros = total.protein * 4 + total.carbs * 4 + total.fat * 9;
    const proteinPercent = (total.protein * 4 / totalMacros) * 100;
    const carbsPercent = (total.carbs * 4 / totalMacros) * 100;
    const fatPercent = (total.fat * 9 / totalMacros) * 100;

    return { proteinPercent, carbsPercent, fatPercent };
  };

  const macroBalance = getMacroBalance();

  const getNutritionScore = () => {
    let score = 0;
    
    // Calorie goal (30 points)
    if (progress.calories >= 90 && progress.calories <= 110) score += 30;
    else if (progress.calories >= 80 && progress.calories <= 120) score += 20;
    else if (progress.calories >= 70 && progress.calories <= 130) score += 10;

    // Protein goal (25 points)
    if (progress.protein >= 90 && progress.protein <= 110) score += 25;
    else if (progress.protein >= 80 && progress.protein <= 120) score += 15;
    else if (progress.protein >= 70 && progress.protein <= 130) score += 5;

    // Macro balance (25 points)
    if (macroBalance.proteinPercent >= 20 && macroBalance.proteinPercent <= 35) score += 12;
    if (macroBalance.carbsPercent >= 45 && macroBalance.carbsPercent <= 65) score += 8;
    if (macroBalance.fatPercent >= 20 && macroBalance.fatPercent <= 35) score += 5;

    // Fiber goal (10 points)
    if (progress.fiber >= 80) score += 10;
    else if (progress.fiber >= 60) score += 5;

    // Sodium goal (10 points)
    if (progress.sodium <= 100) score += 10;
    else if (progress.sodium <= 120) score += 5;

    return Math.min(score, 100);
  };

  const nutritionScore = getNutritionScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Excellent nutrition day!';
    if (score >= 80) return 'Great job on your nutrition!';
    if (score >= 60) return 'Good progress, keep it up!';
    if (score >= 40) return 'Room for improvement';
    return 'Let\'s focus on better nutrition choices';
  };

  return (
    <div className="space-y-6">
      {/* Nutrition Score */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Nutrition Score</h3>
            <p className="text-gray-400">{getScoreMessage(nutritionScore)}</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(nutritionScore)}`}>
              {nutritionScore}
            </div>
            <div className="text-sm text-gray-400">/ 100</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              nutritionScore >= 80 ? 'bg-green-500' : 
              nutritionScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${nutritionScore}%` }}
          />
        </div>
      </div>

      {/* Macro Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Calories */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Target className="w-6 h-6 text-orange-400" />
            </div>
            <button
              onClick={onEditGoals}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {Math.round(total.calories)}
          </div>
          <div className="text-sm text-gray-400 mb-3">
            / {goals.daily_calories} goal
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(progress.calories)}`}
              style={{ width: `${Math.min(progress.calories, 100)}%` }}
            />
          </div>
          <div className={`text-xs mt-2 ${getProgressColor(progress.calories)}`}>
            {progress.calories.toFixed(0)}% of goal
          </div>
        </div>

        {/* Protein */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-500/20 rounded-xl">
              <Droplets className="w-6 h-6 text-teal-400" />
            </div>
            <span className="text-xs text-gray-400">{macroBalance.proteinPercent.toFixed(0)}%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {Math.round(total.protein)}g
          </div>
          <div className="text-sm text-gray-400 mb-3">
            / {goals.daily_protein}g goal
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(progress.protein)}`}
              style={{ width: `${Math.min(progress.protein, 100)}%` }}
            />
          </div>
          <div className={`text-xs mt-2 ${getProgressColor(progress.protein)}`}>
            {progress.protein.toFixed(0)}% of goal
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Apple className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs text-gray-400">{macroBalance.carbsPercent.toFixed(0)}%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {Math.round(total.carbs)}g
          </div>
          <div className="text-sm text-gray-400 mb-3">
            / {goals.daily_carbs}g goal
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(progress.carbs)}`}
              style={{ width: `${Math.min(progress.carbs, 100)}%` }}
            />
          </div>
          <div className={`text-xs mt-2 ${getProgressColor(progress.carbs)}`}>
            {progress.carbs.toFixed(0)}% of goal
          </div>
        </div>

        {/* Fat */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-xs text-gray-400">{macroBalance.fatPercent.toFixed(0)}%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {Math.round(total.fat)}g
          </div>
          <div className="text-sm text-gray-400 mb-3">
            / {goals.daily_fat}g goal
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(progress.fat)}`}
              style={{ width: `${Math.min(progress.fat, 100)}%` }}
            />
          </div>
          <div className={`text-xs mt-2 ${getProgressColor(progress.fat)}`}>
            {progress.fat.toFixed(0)}% of goal
          </div>
        </div>
      </div>

      {/* Micronutrients */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Micronutrients</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{Math.round(total.fiber)}g</div>
            <div className="text-sm text-gray-400">Fiber</div>
            <div className="text-xs text-gray-500">Goal: {goals.daily_fiber}g</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{Math.round(total.sodium)}mg</div>
            <div className="text-sm text-gray-400">Sodium</div>
            <div className="text-xs text-gray-500">Goal: {goals.daily_sodium}mg</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{Math.round(total.potassium)}mg</div>
            <div className="text-sm text-gray-400">Potassium</div>
            <div className="text-xs text-gray-500">Recommended: 3500mg</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{Math.round(total.calcium)}mg</div>
            <div className="text-sm text-gray-400">Calcium</div>
            <div className="text-xs text-gray-500">Recommended: 1000mg</div>
          </div>
        </div>
      </div>

      {/* Macro Balance Chart */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Macro Balance</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-teal-400">Protein</span>
              <span className="text-white">{macroBalance.proteinPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div 
                className="bg-teal-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${macroBalance.proteinPercent}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-blue-400">Carbs</span>
              <span className="text-white">{macroBalance.carbsPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${macroBalance.carbsPercent}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-yellow-400">Fat</span>
              <span className="text-white">{macroBalance.fatPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div 
                className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${macroBalance.fatPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;


















