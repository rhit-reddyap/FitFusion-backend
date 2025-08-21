'use client';

import { useState, useEffect } from 'react';

type WeightLog = { date: string; weightKg: number };
type BurnLog = { date: string; caloriesBurned: number };

export default function AnalyticsPage() {
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [burn, setBurn] = useState<BurnLog[]>([]);
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const savedWeights = localStorage.getItem('weight_logs');
    const savedBurn = localStorage.getItem('burn_logs');
    if (savedWeights) setWeights(JSON.parse(savedWeights));
    if (savedBurn) setBurn(JSON.parse(savedBurn));
  }, []);

  const convertWeight = (w: number) => unit === 'kg' ? w : w * 2.20462;

  const calc1RM = (weight: number, reps: number) => {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  };

  return (
    <div>
      <h1>Analytics</h1>
      <div style={{ margin: '1rem 0' }}>
        <label>Units: </label>
        <select value={unit} onChange={(e) => setUnit(e.target.value as 'kg' | 'lb')}>
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </select>
      </div>

      <h3>Weight Log</h3>
      <ul>
        {weights.map((w, i) => (
          <li key={i}>
            {w.date}: {convertWeight(w.weightKg).toFixed(1)} {unit}
          </li>
        ))}
      </ul>

      <h3>Burn Logs</h3>
      <ul>
        {burn.map((b, i) => (
          <li key={i}>{b.date}: {b.caloriesBurned} kcal</li>
        ))}
      </ul>

      <h3>Estimated 1RM Calculator</h3>
      <p>Example: 100kg x 5 reps ≈ {calc1RM(100, 5)}kg</p>

      <h3>Streaks & Badges</h3>
      <p>You are on a {streak}-day streak!</p>
      <p>(Badges system coming soon)</p>
    </div>
  );
}
