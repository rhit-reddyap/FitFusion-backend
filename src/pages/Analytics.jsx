import { useEffect, useState } from "react";

const FOOD_KEY = "ff-food-logs-v1";
const WEIGHT_KEY = "ff-weight-log-v1";
const BURN_KEY = "ff-burn-logs-v1";

const safeJSON = (s, f) => { try { return JSON.parse(s) ?? f; } catch { return f; } };
const today = () => new Date().toISOString().slice(0, 10);
const sum = (arr) => arr.reduce((a, b) => a + (Number(b) || 0), 0);

export default function Analytics() {
  const [food, setFood] = useState({});
  const [weight, setWeight] = useState([]);
  const [burn, setBurn] = useState({});
  const [unit, setUnit] = useState("kg");

  useEffect(() => {
    setFood(safeJSON(localStorage.getItem(FOOD_KEY), {}));
    setWeight(safeJSON(localStorage.getItem(WEIGHT_KEY), []));
    setBurn(safeJSON(localStorage.getItem(BURN_KEY), {}));
  }, []);

  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  }).reverse();

  const weeklyCalories = last7.map((d) => sum((food[d] || []).map(f => f.calories)));
  const weeklyBurn = last7.map((d) => burn[d] || 0);
  const metabolism = weeklyCalories.map((c, i) => c - (weeklyBurn[i] || 0));

  const formatWeight = (w) => {
    if (unit === "kg") return w.toFixed(1) + " kg";
    if (unit === "lb") return (w * 2.20462).toFixed(1) + " lb";
    return w;
  };

  return (
    <div className="analytics">
      <h1>Analytics</h1>

      <div className="unit-toggle">
        <label>Units: </label>
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </select>
      </div>

      <div className="weekly-data">
        <h3>Weekly Metabolism</h3>
        <ul>
          {last7.map((d, i) => (
            <li key={d}>
              {d}: {metabolism[i]} kcal
            </li>
          ))}
        </ul>
      </div>

      <div className="weight-log">
        <h3>Weight Log</h3>
        <ul>
          {weight.map((w, i) => (
            <li key={i}>{w.date}: {formatWeight(w.weight_kg)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
