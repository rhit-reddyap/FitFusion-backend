'use client';

import { useState, useEffect } from 'react';

type FoodEntry = {
  id?: number;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function FoodPage() {
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [name, setName] = useState('');
  const [grams, setGrams] = useState(0);

  // Temporary local state (later will connect to Supabase)
  useEffect(() => {
    const saved = localStorage.getItem('food_logs');
    if (saved) setFoods(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('food_logs', JSON.stringify(foods));
  }, [foods]);

  const addFood = () => {
    if (!name || grams <= 0) return;
    const entry: FoodEntry = {
      name,
      grams,
      calories: Math.round(grams * 2),
      protein: Math.round(grams * 0.1),
      carbs: Math.round(grams * 0.2),
      fat: Math.round(grams * 0.05)
    };
    setFoods([...foods, entry]);
    setName('');
    setGrams(0);
  };

  const removeFood = (i: number) => {
    const copy = [...foods];
    copy.splice(i, 1);
    setFoods(copy);
  };

  const totalCalories = foods.reduce((a, f) => a + f.calories, 0);
  const totalProtein = foods.reduce((a, f) => a + f.protein, 0);

  return (
    <div>
      <h1>Food Tracker</h1>
      <div style={{ margin: '1rem 0' }}>
        <input
          placeholder="Food name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <input
          type="number"
          placeholder="Grams"
          value={grams}
          onChange={(e) => setGrams(Number(e.target.value))}
          style={{ marginRight: '0.5rem' }}
        />
        <button onClick={addFood}>Add</button>
      </div>

      <ul>
        {foods.map((f, i) => (
          <li key={i}>
            {f.name} - {f.grams}g | {f.calories} cal, {f.protein}g protein
            <button onClick={() => removeFood(i)} style={{ marginLeft: '0.5rem' }}>X</button>
          </li>
        ))}
      </ul>

      <h3>Total Calories: {totalCalories}</h3>
      <h3>Total Protein: {totalProtein}g</h3>
    </div>
  );
}
