'use client';

import { useState } from 'react';
import { Trophy, Star, Flame } from 'lucide-react';

export default function GamificationPage() {
  const [points, setPoints] = useState(1200);
  const [streak, setStreak] = useState(5);
  const [badges, setBadges] = useState([
    { id: 1, name: 'Consistency King', icon: <Flame className="w-6 h-6 text-red-500" /> },
    { id: 2, name: 'First PR Badge', icon: <Trophy className="w-6 h-6 text-yellow-500" /> },
    { id: 3, name: 'Team Player', icon: <Star className="w-6 h-6 text-blue-500" /> },
  ]);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Gamification</h1>

      {/* Points / Progress */}
      <div className="rounded-2xl shadow-md bg-white p-4">
        <h2 className="text-xl font-semibold">Your Progress</h2>
        <p className="mt-2 text-gray-600">Total Points: <span className="font-bold">{points}</span></p>
        <p className="text-gray-600">Current Streak: 🔥 {streak} days</p>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
          <div 
            className="bg-green-500 h-4 rounded-full transition-all duration-500" 
            style={{ width: `${(points % 1000) / 10}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">Next reward at {(Math.floor(points / 1000) + 1) * 1000} pts</p>
      </div>

      {/* Badges */}
      <div className="rounded-2xl shadow-md bg-white p-4">
        <h2 className="text-xl font-semibold">Badges</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {badges.map((badge) => (
            <div key={badge.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 shadow-sm">
              {badge.icon}
              <span className="font-medium">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-2xl shadow-md bg-white p-4">
        <h2 className="text-xl font-semibold">Daily Actions</h2>
        <button
          onClick={() => {
            setPoints(points + 50);
            setStreak(streak + 1);
          }}
          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition"
        >
          Complete a Task (+50 pts)
        </button>
      </div>
    </div>
  );
}
