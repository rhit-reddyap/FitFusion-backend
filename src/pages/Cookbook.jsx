// src/pages/Cookbook.jsx
import React from "react";
import { BookOpen, Utensils } from "lucide-react";

export default function Cookbook() {
  const hasCookbook = localStorage.getItem("hasCookbook") === "true";

  if (!hasCookbook) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
        <h1 className="text-3xl font-bold text-gray-700 mb-4">Cookbook Locked 🔒</h1>
        <p className="text-gray-600 mb-8">
          Purchase the cookbook from the Pricing page to unlock this content.
        </p>
        <a
          href="/pricing"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow"
        >
          Go to Pricing
        </a>
      </div>
    );
  }

  // ... existing cookbook code here


  // Example placeholder data
  const recipes = [
    {
      id: 1,
      name: "Grilled Chicken with Quinoa",
      calories: 450,
      protein: 38,
      carbs: 40,
      fat: 12,
    },
    {
      id: 2,
      name: "Greek Yogurt Parfait",
      calories: 300,
      protein: 25,
      carbs: 35,
      fat: 6,
    },
    {
      id: 3,
      name: "Salmon with Sweet Potato",
      calories: 520,
      protein: 42,
      carbs: 45,
      fat: 15,
    },
  ];

  const STORAGE_KEY = "ff-food-logs-v1";

  const addToFoodTracker = (recipe) => {
    const today = new Date().toISOString().slice(0, 10);

    // Load existing logs
    const raw = localStorage.getItem(STORAGE_KEY);
    const logs = raw ? JSON.parse(raw) : {};

    // Add recipe entry
    const newEntry = {
      name: recipe.name,
      grams: null, // optional field in your tracker
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
    };

    const todayLogs = logs[today] || [];
    const updatedLogs = { ...logs, [today]: [...todayLogs, newEntry] };

    // Save back
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));

    alert(`${recipe.name} added to your Food Tracker!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <BookOpen className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-800">Fit Fusion Cookbook</h1>
        </div>
        <p className="text-gray-600 mb-12">
          Discover healthy, high-protein recipes designed to integrate seamlessly
          with your Food Tracker.
        </p>

        {/* Recipes Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <div
              key={r.id}
              className="bg-white shadow-md rounded-2xl p-6 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900">{r.name}</h2>
              </div>

              <div className="text-sm text-gray-700 mb-4">
                <p>
                  <strong>Calories:</strong> {r.calories}
                </p>
                <p>
                  <strong>Protein:</strong> {r.protein}g
                </p>
                <p>
                  <strong>Carbs:</strong> {r.carbs}g
                </p>
                <p>
                  <strong>Fat:</strong> {r.fat}g
                </p>
              </div>

              <button
                onClick={() => addToFoodTracker(r)}
                className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              >
                Add to Food Tracker
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
