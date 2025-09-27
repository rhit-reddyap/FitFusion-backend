"use client";

import React, { useState, useEffect } from 'react';
import { X, Calculator, Scale, Clock } from 'lucide-react';
import { Food, FoodLog, NutritionData } from '@/types/nutrition';
import { nutritionAPI } from '@/lib/nutritionApi';

interface FoodLogFormProps {
  food: Food;
  mealType: string;
  onSave: (log: Omit<FoodLog, 'id' | 'created_at' | 'user_id'>) => void;
  onCancel: () => void;
  editLog?: FoodLog;
}

const FoodLogForm: React.FC<FoodLogFormProps> = ({
  food,
  mealType,
  onSave,
  onCancel,
  editLog
}) => {
  const [amount, setAmount] = useState(editLog?.amount || food.serving_size);
  const [unit, setUnit] = useState<Food['serving_unit']>(editLog?.unit || food.serving_unit);
  const [calculatedNutrition, setCalculatedNutrition] = useState<NutritionData | null>(null);

  const units = [
    { value: 'g', label: 'Grams (g)', multiplier: 1 },
    { value: 'ml', label: 'Milliliters (ml)', multiplier: 1 },
    { value: 'cup', label: 'Cups', multiplier: 240 },
    { value: 'tbsp', label: 'Tablespoons', multiplier: 15 },
    { value: 'tsp', label: 'Teaspoons', multiplier: 5 },
    { value: 'piece', label: 'Pieces', multiplier: 1 },
    { value: 'slice', label: 'Slices', multiplier: 1 }
  ];

  useEffect(() => {
    calculateNutrition();
  }, [amount, unit]);

  const calculateNutrition = () => {
    const nutrition = nutritionAPI.calculateNutrition(food, amount, unit);
    setCalculatedNutrition(nutrition);
  };

  const handleSave = () => {
    const log: Omit<FoodLog, 'id' | 'created_at' | 'user_id'> = {
      food_id: food.id,
      food,
      amount,
      unit,
      date: new Date().toISOString().split('T')[0],
      meal_type: mealType as any
    };

    onSave(log);
  };

  const getQuickAmounts = () => {
    const baseAmount = food.serving_size;
    return [
      { label: '0.5x', amount: baseAmount * 0.5 },
      { label: '1x', amount: baseAmount },
      { label: '1.5x', amount: baseAmount * 1.5 },
      { label: '2x', amount: baseAmount * 2 }
    ];
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Add to {mealType}</h2>
            <p className="text-gray-400">{food.name}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Food Info */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">{food.name}</h3>
                {food.brand && (
                  <p className="text-sm text-gray-400">{food.brand}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Per 100g</div>
                <div className="text-lg font-semibold text-white">
                  {food.nutrition_per_100g.calories} cal
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-teal-400 font-medium">{food.nutrition_per_100g.protein}g</div>
                <div className="text-gray-400">Protein</div>
              </div>
              <div>
                <div className="text-blue-400 font-medium">{food.nutrition_per_100g.carbs}g</div>
                <div className="text-gray-400">Carbs</div>
              </div>
              <div>
                <div className="text-yellow-400 font-medium">{food.nutrition_per_100g.fat}g</div>
                <div className="text-gray-400">Fat</div>
              </div>
              <div>
                <div className="text-gray-400 font-medium">{food.nutrition_per_100g.fiber}g</div>
                <div className="text-gray-400">Fiber</div>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="w-32">
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  >
                    {units.map(unitOption => (
                      <option key={unitOption.value} value={unitOption.value}>
                        {unitOption.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quick Amounts
              </label>
              <div className="flex gap-2">
                {getQuickAmounts().map((quick) => (
                  <button
                    key={quick.label}
                    onClick={() => setAmount(quick.amount)}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {quick.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculated Nutrition */}
          {calculatedNutrition && (
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-teal-400" />
                <h3 className="font-semibold text-white">Calculated Nutrition</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{calculatedNutrition.calories}</div>
                  <div className="text-sm text-gray-400">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-400">{calculatedNutrition.protein}g</div>
                  <div className="text-sm text-gray-400">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{calculatedNutrition.carbs}g</div>
                  <div className="text-sm text-gray-400">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{calculatedNutrition.fat}g</div>
                  <div className="text-sm text-gray-400">Fat</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Fiber:</span>
                  <span className="text-white">{calculatedNutrition.fiber}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sugar:</span>
                  <span className="text-white">{calculatedNutrition.sugar}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sodium:</span>
                  <span className="text-white">{calculatedNutrition.sodium}mg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Potassium:</span>
                  <span className="text-white">{calculatedNutrition.potassium}mg</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
            >
              {editLog ? 'Update' : 'Add to Log'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodLogForm;










