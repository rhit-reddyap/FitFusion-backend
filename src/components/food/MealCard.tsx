"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Clock, Star } from 'lucide-react';
import { FoodLog, Food, NutritionData } from '@/types/nutrition';
import { nutritionAPI } from '@/lib/nutritionApi';

interface MealCardProps {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logs: FoodLog[];
  onAddFood: (mealType: string) => void;
  onRemoveLog: (logId: string) => void;
  onEditLog: (log: FoodLog) => void;
}

const MealCard: React.FC<MealCardProps> = ({
  mealType,
  logs,
  onAddFood,
  onRemoveLog,
  onEditLog
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const calculateMealTotals = (): NutritionData => {
    return logs.reduce((totals, log) => {
      if (!log.food) return totals;
      
      const nutrition = nutritionAPI.calculateNutrition(
        log.food,
        log.amount,
        log.unit
      );

      return {
        calories: totals.calories + nutrition.calories,
        protein: totals.protein + nutrition.protein,
        carbs: totals.carbs + nutrition.carbs,
        fat: totals.fat + nutrition.fat,
        fiber: totals.fiber + nutrition.fiber,
        sugar: totals.sugar + nutrition.sugar,
        sodium: totals.sodium + nutrition.sodium,
        cholesterol: totals.cholesterol + nutrition.cholesterol,
        saturated_fat: totals.saturated_fat + nutrition.saturated_fat,
        trans_fat: totals.trans_fat + nutrition.trans_fat,
        potassium: totals.potassium + nutrition.potassium,
        vitamin_a: totals.vitamin_a + nutrition.vitamin_a,
        vitamin_c: totals.vitamin_c + nutrition.vitamin_c,
        calcium: totals.calcium + nutrition.calcium,
        iron: totals.iron + nutrition.iron
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      cholesterol: 0,
      saturated_fat: 0,
      trans_fat: 0,
      potassium: 0,
      vitamin_a: 0,
      vitamin_c: 0,
      calcium: 0,
      iron: 0
    });
  };

  const totals = calculateMealTotals();
  const mealDisplayName = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getMealIcon(mealType)}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{mealDisplayName}</h3>
              <p className="text-sm text-gray-400">
                {logs.length} item{logs.length !== 1 ? 's' : ''} • 
                {Math.round(totals.calories)} calories
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddFood(mealType);
              }}
              className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
            <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-white">{Math.round(totals.calories)}</div>
            <div className="text-xs text-gray-400">Calories</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-teal-400">{Math.round(totals.protein)}g</div>
            <div className="text-xs text-gray-400">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-400">{Math.round(totals.carbs)}g</div>
            <div className="text-xs text-gray-400">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-yellow-400">{Math.round(totals.fat)}g</div>
            <div className="text-xs text-gray-400">Fat</div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-800">
          {logs.length > 0 ? (
            <div className="p-6 space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{log.food?.name}</h4>
                      {log.food?.brand && (
                        <p className="text-sm text-gray-400">{log.food.brand}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditLog(log)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveLog(log.id)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Amount: </span>
                      <span className="text-white">{log.amount} {log.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Time: </span>
                      <span className="text-white">{formatTime(log.created_at)}</span>
                    </div>
                  </div>

                  {log.food && (
                    <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-white font-medium">{Math.round(nutritionAPI.calculateNutrition(log.food, log.amount, log.unit).calories)}</div>
                        <div className="text-gray-400 text-xs">cal</div>
                      </div>
                      <div>
                        <div className="text-teal-400 font-medium">{Math.round(nutritionAPI.calculateNutrition(log.food, log.amount, log.unit).protein)}g</div>
                        <div className="text-gray-400 text-xs">protein</div>
                      </div>
                      <div>
                        <div className="text-blue-400 font-medium">{Math.round(nutritionAPI.calculateNutrition(log.food, log.amount, log.unit).carbs)}g</div>
                        <div className="text-gray-400 text-xs">carbs</div>
                      </div>
                      <div>
                        <div className="text-yellow-400 font-medium">{Math.round(nutritionAPI.calculateNutrition(log.food, log.amount, log.unit).fat)}g</div>
                        <div className="text-gray-400 text-xs">fat</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Detailed Nutrition Breakdown */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h4 className="font-semibold text-white mb-3">Nutrition Breakdown</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fiber:</span>
                      <span className="text-white">{Math.round(totals.fiber)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sugar:</span>
                      <span className="text-white">{Math.round(totals.sugar)}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sodium:</span>
                      <span className="text-white">{Math.round(totals.sodium)}mg</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Potassium:</span>
                      <span className="text-white">{Math.round(totals.potassium)}mg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Calcium:</span>
                      <span className="text-white">{Math.round(totals.calcium)}mg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Iron:</span>
                      <span className="text-white">{Math.round(totals.iron)}mg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-6xl mb-4">{getMealIcon(mealType)}</div>
              <h4 className="text-lg font-semibold text-white mb-2">No {mealDisplayName} logged yet</h4>
              <p className="text-gray-400 mb-4">
                Start tracking your {mealDisplayName.toLowerCase()} to see your nutrition progress
              </p>
              <button
                onClick={() => onAddFood(mealType)}
                className="bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
              >
                Add {mealDisplayName}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MealCard;










