'use client';

import { useState, useEffect } from 'react';

type WorkoutEntry = {
  id?: number;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  volume: number;
};

const exerciseLibrary = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Overhead Press",
  "Barbell Row",
  "Pull Ups",
  "Bicep Curls",
  "Tricep Extensions"
];

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [exercise, setExercise] = useState('Bench Press');
  const [sets, setSets] = useState(0);
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('workout_logs');
    if (saved) setWorkouts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('workout_logs', JSON.stringify(workouts));
  }, [workouts]);

  const addWorkout = () => {
    if (!exercise || sets <= 0 || reps <= 0 || weight <= 0) return;
    const entry: WorkoutEntry = {
      exercise,
      sets,
      reps,
      weight,
      volume: sets * reps * weight
    };
    setWorkouts([...workouts, entry]);
    setSets(0); setReps(0); setWeight(0);
  };

  const removeWorkout = (i: number) => {
    const copy = [...workouts];
    copy.splice(i, 1);
    setWorkouts(copy);
  };

  const totalVolume = workouts.reduce((a, w) => a + w.volume, 0);

  return (
    <div>
      <h1>Workout Tracker</h1>
      <div style={{ margin: '1rem 0' }}>
        <select value={exercise} onChange={(e) => setExercise(e.target.value)}>
          {exerciseLibrary.map((ex) => <option key={ex}>{ex}</option>)}
        </select>
        <input type="number" placeholder="Sets" value={sets} onChange={(e) => setSets(Number(e.target.value))} />
        <input type="number" placeholder="Reps" value={reps} onChange={(e) => setReps(Number(e.target.value))} />
        <input type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
        <button onClick={addWorkout}>Add</button>
      </div>

      <ul>
        {workouts.map((w, i) => (
          <li key={i}>
            {w.exercise} - {w.sets}x{w.reps} @ {w.weight}kg → {w.volume}kg total
            <button onClick={() => removeWorkout(i)} style={{ marginLeft: '0.5rem' }}>X</button>
          </li>
        ))}
      </ul>

      <h3>Total Volume: {totalVolume}kg</h3>
    </div>
  );
}
