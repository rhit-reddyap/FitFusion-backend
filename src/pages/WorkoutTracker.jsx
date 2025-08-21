import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const STORAGE_KEY = "ff-workout-logs-v1";

export default function WorkoutTracker() {
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

  const addWorkout = () => {
    const name = prompt("Workout name?");
    const sets = Number(prompt("Sets?"));
    const reps = Number(prompt("Reps?"));
    const weight = Number(prompt("Weight per rep (kg)?"));
    if (!name || !sets || !reps || !weight) return;
    const volume = sets * reps * weight;
    const entry = { name, sets, reps, weight, volume };
    save([...dayLogs, entry]);
  };

  const removeWorkout = (i) => {
    const copy = [...dayLogs];
    copy.splice(i, 1);
    save(copy);
  };

  return (
    <div className="workout-tracker">
      <h1>Workout Tracker</h1>
      <button onClick={addWorkout} className="add-btn">
        <Plus size={16} /> Add Workout
      </button>
      <ul>
        {dayLogs.map((w, i) => (
          <li key={i}>
            {w.name} - {w.sets}x{w.reps} @ {w.weight}kg → {w.volume}kg total
            <button onClick={() => removeWorkout(i)}>
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
