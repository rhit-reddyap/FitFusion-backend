"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, Star, Plus, X } from 'lucide-react';
import { Food, FoodSearchResult, RecentFood } from '@/types/nutrition';
import { nutritionAPI } from '@/lib/nutritionApi';

interface FoodSearchProps {
  onFoodSelect: (food: Food) => void;
  onClose: () => void;
  placeholder?: string;
}

const FoodSearch: React.FC<FoodSearchProps> = ({ 
  onFoodSelect, 
  onClose, 
  placeholder = "Search for food..." 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Load recent and favorite foods
    loadRecentAndFavorites();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      searchFoods();
    } else {
      setResults([]);
    }
  }, [query]);

  const loadRecentAndFavorites = async () => {
    try {
      const [recent, favorites] = await Promise.all([
        nutritionAPI.getRecentFoods('user'),
        nutritionAPI.getFavoriteFoods('user')
      ]);

      setRecentFoods(recent.map(food => ({
        food,
        last_logged: new Date().toISOString(),
        frequency: Math.floor(Math.random() * 10) + 1,
        is_favorite: false
      })));

      setFavoriteFoods(favorites);
    } catch (error) {
      console.error('Error loading recent and favorite foods:', error);
    }
  };

  const searchFoods = async () => {
    setIsLoading(true);
    try {
      const searchResults = await nutritionAPI.searchFoods(query, 20);
      setResults(searchResults);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error searching foods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleFoodSelect(results[selectedIndex].food);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleFoodSelect = (food: Food) => {
    onFoodSelect(food);
    onClose();
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'exact': return 'text-green-400';
      case 'partial': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'exact': return '✓';
      case 'partial': return '~';
      default: return '?';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Add Food</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 text-lg"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-96">
          {query.trim() ? (
            // Search Results
            <div className="p-6 space-y-2">
              {results.length > 0 ? (
                results.map((result, index) => (
                  <div
                    key={result.food.id}
                    onClick={() => handleFoodSelect(result.food)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      index === selectedIndex
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{result.food.name}</h3>
                          {result.food.brand && (
                            <span className="text-sm opacity-75">{result.food.brand}</span>
                          )}
                          <span className={`text-xs ${getMatchTypeColor(result.match_type)}`}>
                            {getMatchTypeIcon(result.match_type)}
                          </span>
                        </div>
                        <div className="text-sm opacity-75">
                          {result.food.nutrition_per_100g.calories} cal • 
                          {result.food.nutrition_per_100g.protein}g protein • 
                          {result.food.nutrition_per_100g.carbs}g carbs • 
                          {result.food.nutrition_per_100g.fat}g fat
                        </div>
                        {result.food.tags && result.food.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {result.food.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-700 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">
                          {result.score}% match
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : !isLoading ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No foods found for "{query}"</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Try a different search term or add a custom food
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            // Recent and Favorite Foods
            <div className="p-6 space-y-6">
              {/* Recent Foods */}
              {recentFoods.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-white">Recent</h3>
                  </div>
                  <div className="space-y-2">
                    {recentFoods.slice(0, 5).map((recent) => (
                      <div
                        key={recent.food.id}
                        onClick={() => handleFoodSelect(recent.food)}
                        className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">{recent.food.name}</h4>
                            <p className="text-sm text-gray-400">
                              {recent.food.nutrition_per_100g.calories} cal • 
                              {recent.food.nutrition_per_100g.protein}g protein
                            </p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {recent.frequency}x this week
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite Foods */}
              {favoriteFoods.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Favorites</h3>
                  </div>
                  <div className="space-y-2">
                    {favoriteFoods.slice(0, 5).map((food) => (
                      <div
                        key={food.id}
                        onClick={() => handleFoodSelect(food)}
                        className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">{food.name}</h4>
                            <p className="text-sm text-gray-400">
                              {food.nutrition_per_100g.calories} cal • 
                              {food.nutrition_per_100g.protein}g protein
                            </p>
                          </div>
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Add Custom Food */}
              <div className="pt-4 border-t border-gray-800">
                <button
                  onClick={() => {
                    // In a real implementation, this would open a custom food form
                    console.log('Add custom food');
                  }}
                  className="w-full p-4 rounded-lg border-2 border-dashed border-gray-600 hover:border-teal-500 hover:bg-teal-500/10 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">Add Custom Food</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodSearch;


















