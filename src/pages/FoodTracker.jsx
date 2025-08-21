import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const STORAGE_KEY = "ff-food-logs-v1";

function gramsToNutrition(food, grams) {
  return {
    calories: (food.caloriesPer100g * grams) / 100,
    protein: (food.proteinPer100g * grams) / 100,
    carbs: (food.carbsPer100g * grams) / 100,
    fat: (food.fatPer100g * grams) / 100,
  };
}

export default function FoodTracker() {
  const today = new Date().toISOString().slice(0, 10);
  const [logs, setLogs] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  });
  const dayLogs = logs[today] || [];

  const save = (next) => {
    const updated = { ...logs, [today]: next };
    setLogs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addFood = () => {
    const name = prompt("Food name?");
    const grams = Number(prompt("How many grams?"));
    if (!name || !grams) return;
    const entry = { name, grams, calories: grams, protein: grams/10, carbs: grams/5, fat: grams/20 }; // placeholder
    save([...dayLogs, entry]);
  };

  const removeFood = (i) => {
    const copy = [...dayLogs];
    copy.splice(i, 1);
    save(copy);
  };

  return (
    <div className="food-tracker">
      <h1>Food Tracker</h1>
      <button onClick={addFood} className="add-btn">
        <Plus size={16} /> Add Food
      </button>
      <ul>
        {dayLogs.map((f, i) => (
          <li key={i}>
            {f.name} - {f.grams} g | {f.calories} cal, {f.protein} g protein
            <button onClick={() => removeFood(i)}>
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
