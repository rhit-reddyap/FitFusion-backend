
import React, { useState, useEffect } from 'react';

export default function GamificationPage() {
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // Fetch from Supabase in real app
    setXp(1200);
    setBadges(['Consistency King', 'Iron Master']);
    setLeaderboard([
      { user: 'Aditya', xp: 1200 },
      { user: 'Ron', xp: 950 },
      { user: 'Sam', xp: 800 },
    ]);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🎮 Gamification</h1>
      <h2>Your XP: {xp}</h2>
      <h3>Badges</h3>
      <ul>
        {badges.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      <h3>Leaderboard</h3>
      <ol>
        {leaderboard.map((l, i) => (
          <li key={i}>{l.user} — {l.xp} XP</li>
        ))}
      </ol>
    </div>
  );
}
