"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { toast } from "react-hot-toast";

interface Achievement {
  id: number;
  name: string;
  icon: React.ReactNode;
}

export default function GamificationPage() {
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<Achievement[]>([]);
  const [lastVisit, setLastVisit] = useState<string | null>(null);

  // Handle streaks (reset if skipped a day)
  useEffect(() => {
    const today = new Date().toDateString();
    const storedLastVisit = localStorage.getItem("lastVisit");
    const storedStreak = localStorage.getItem("streak");

    if (storedLastVisit) {
      const last = new Date(storedLastVisit);
      const diffDays = Math.floor(
        (new Date(today).getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        const newStreak = (storedStreak ? parseInt(storedStreak) : 0) + 1;
        setStreak(newStreak);
        localStorage.setItem("streak", newStreak.toString());
      } else if (diffDays > 1) {
        setStreak(1);
        localStorage.setItem("streak", "1");
      } else {
        setStreak(storedStreak ? parseInt(storedStreak) : 1);
      }
    } else {
      setStreak(1);
      localStorage.setItem("streak", "1");
    }

    setLastVisit(today);
    localStorage.setItem("lastVisit", today);
  }, []);

  // Award badge with toast + confetti
  const awardBadge = (id: number, name: string, icon: React.ReactNode) => {
    if (!badges.some((b) => b.id === id)) {
      setBadges([...badges, { id, name, icon }]);
      toast.success(`🏅 New Badge Unlocked: ${name}!`);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  // Award badges on milestones
  useEffect(() => {
    if (streak === 3) {
      awardBadge(1, "3-Day Streak", "🔥");
    } else if (streak === 7) {
      awardBadge(2, "One Week Strong", "🌟");
    } else if (streak === 30) {
      awardBadge(3, "30 Days Consistency", "💎");
    }
  }, [streak]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🎮 Gamification</h1>

      {/* Streak Tracker */}
      <div className="bg-blue-100 text-blue-800 p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold">🔥 Current Streak</h2>
        <p className="text-2xl">{streak} days</p>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-xl font-semibold mb-2">🏆 Achievements</h2>
        {badges.length === 0 ? (
          <p>No badges yet. Keep going!</p>
        ) : (
          <ul className="space-y-2">
            {badges.map((badge) => (
              <li
                key={badge.id}
                className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg shadow"
              >
                <span className="text-2xl">{badge.icon}</span>
                <span>{badge.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
