'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Flame, Crown, Medal } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'ff-gamification';

type Badge = {
  id: number;
  name: string;
  icon: JSX.Element;
};

export default function GamificationPage() {
  const defaultBadges: Badge[] = [
    { id: 1, name: 'Consistency King', icon: <Flame className="w-6 h-6 text-red-500" /> },
    { id: 2, name: 'First PR Badge', icon: <Trophy className="w-6 h-6 text-yellow-500" /> },
    { id: 3, name: 'Team Player', icon: <Star className="w-6 h-6 text-blue-500" /> },
  ];

  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<Badge[]>(defaultBadges);
  const [lastActionDate, setLastActionDate] = useState<string | null>(null);

  // Utility: get today's date as YYYY-MM-DD
  const today = () => new Date().toISOString().slice(0, 10);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setPoints(saved.points ?? 0);
        setStreak(saved.streak ?? 0);
        setBadges(saved.badges ?? defaultBadges);
        setLastActionDate(saved.lastActionDate ?? null);

        // Check streak reset condition
        if (saved.lastActionDate) {
          const lastDate = new Date(saved.lastActionDate);
          const currentDate = new Date(today());

          const diffDays =
            Math.floor(
              (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
            );

          if (diffDays > 1) {
            setStreak(0); // reset streak if missed more than 1 day
          }
        }
      }
    } catch {
      console.warn('Failed to parse gamification storage');
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const payload = { points, streak, badges, lastActionDate };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [points, streak, badges, lastActionDate]);

  // Confetti launcher (web only)
  const launchConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Award badge with toast + confetti
  const awardBadge = (id: number, name: string, icon: JSX.Element) => {
    if (!badges.some((b) => b.id === id)) {
      setBadges([...badges, { id, name, icon }]);
      toast.success(`🏅 New Badge Unlocked: ${name}!`);
      launchConfetti();
    }
  };

  // Handle completing a task
  const completeTask = () => {
    const currentDate = today();
    let newStreak = streak;

    if (lastActionDate !== currentDate) {
      if (
        lastActionDate &&
        Math.floor(
          (new Date(currentDate).getTime() - new Date(lastActionDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) === 1
      ) {
        newStreak = streak + 1;
        setStreak(newStreak);
      } else {
        newStreak = 1;
        setStreak(1);
      }
    }

    setPoints(points + 50);
    setLastActionDate(currentDate);

    if (newStreak === 7) {
      awardBadge(101, '1 Week Warrior', <Medal className="w-6 h-6 text-green-500" />);
    }
    if (newStreak === 30) {
      awardBadge(102, '30-Day Legend', <Crown className="w-6 h-6 text-purple-500" />);
    }
    if (newStreak === 100) {
      awardBadge(103, 'Century Streaker', <Trophy className="w-6 h-6 text-orange-500" />);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold">Gamification</h1>

      {/* Points / Progress */}
      <div className="rounded-2xl shadow-md bg-white p-4">
        <h2 className="text-xl font-semibold">Your Progress</h2>
        <p className="mt-2 text-gray-600">
          Total Points: <span className="font-bold">{points}</span>
        </p>
        <p className="text-gray-600">Current Streak: 🔥 {streak} days</p>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${(points % 1000) / 10}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Next reward at {(Math.floor(points / 1000) + 1) * 1000} pts
        </p>
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
          onClick={completeTask}
          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition"
        >
          Complete a Task (+50 pts)
        </button>
      </div>
    </div>
  );
}
