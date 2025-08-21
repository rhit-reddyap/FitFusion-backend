import { useEffect, useState } from "react";

const FOOD_KEY = "ff-food-logs-v1";
const WORKOUT_KEY = "ff-workout-logs-v1";

const safeJSON = (s, fallback) => {
  try {
    return JSON.parse(s) ?? fallback;
  } catch {
    return fallback;
  }
};

export default function Dashboard() {
  const [foods, setFoods] = useState([]);
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const foodLogs = safeJSON(localStorage.getItem(FOOD_KEY), {});
    const workoutLogs = safeJSON(localStorage.getItem(WORKOUT_KEY), {});
    setFoods(foodLogs[today] || []);
    setWorkouts(workoutLogs[today] || []);
  }, []);

  const calories = foods.reduce((a, f) => a + (f.calories || 0), 0);
  const protein = foods.reduce((a, f) => a + (f.protein || 0), 0);
  const volume = workouts.reduce((a, w) => a + (w.volume || 0), 0);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats">
        <div className="stat-card">
          <h3>Calories Today</h3>
          <p>{calories}</p>
        </div>
        <div className="stat-card">
          <h3>Protein Today</h3>
          <p>{protein} g</p>
        </div>
        <div className="stat-card">
          <h3>Workout Volume</h3>
          <p>{volume} kg</p>
        </div>
      </div>
    </div>
  );
}
