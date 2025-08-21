'use client';

import { useState, useEffect } from 'react';

type AIPlan = {
  id?: number;
  type: string;
  details: string;
  premium: boolean;
};

export default function AICoachPage() {
  const [plans, setPlans] = useState<AIPlan[]>([]);
  const [type, setType] = useState<string>('Workout');
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('ai_plans');
    if (saved) setPlans(JSON.parse(saved) as AIPlan[]);
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_plans', JSON.stringify(plans));
  }, [plans]);

  const addPlan = () => {
    if (!details) return;
    const premium = type === 'Diet';
    const plan: AIPlan = { type, details, premium };
    setPlans([...plans, plan]);
    setDetails('');
  };

  return (
    <div>
      <h1>AI Coach</h1>
      <p>Generate AI workout or diet plans (diet plans require Premium).</p>
      <div style={{ margin: '1rem 0' }}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>Workout</option>
          <option>Diet</option>
        </select>
        <input
          placeholder="Enter plan details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          style={{ marginLeft: '0.5rem' }}
        />
        <button onClick={addPlan}>Add Plan</button>
      </div>
      <ul>
        {plans.map((p, i) => (
          <li key={i}>
            <strong>{p.type}</strong>: {p.details}{' '}
            {p.premium && <span style={{ color: 'orange' }}>Premium</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
