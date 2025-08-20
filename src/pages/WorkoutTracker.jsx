// src/pages/WorkoutTracker.jsx
import { useEffect, useState } from "react";
import { Dumbbell, Plus, Trash2 } from "lucide-react";

/* ------------------------------------------------
   Placeholder hook: replace with real premium check
   (Stripe subscription status, etc.)
------------------------------------------------- */
function usePremium() {
  const [isPremium] = useState(false); // ⬅️ change to true if testing premium
  return isPremium;
}

export default function WorkoutTracker() {
  const isPremium = usePremium();

  if (!isPremium) {
    return (
      <div className="relative p-6">
        {/* Blurred locked preview */}
        <div className="blur-sm pointer-events-none select-none">
          <LockedWorkoutPreview />
        </div>

        {/* Upgrade overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white border border-gray-300 shadow-lg rounded-2xl p-6 text-center max-w-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Upgrade to Premium
            </h2>
            <p className="text-gray-600 mb-4">
              Unlock the Workout Tracker, Analytics, and AI Coach.
            </p>
            <a
              href="/pricing"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Upgrade Now
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Premium users see the full tracker
  return <WorkoutTrackerContent />;
}

/* ------------------------------------------------
   Locked Preview (blurred placeholder)
------------------------------------------------- */
function LockedWorkoutPreview() {
  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50">
      <div className="flex items-center gap-3 mb-4">
        <Dumbbell className="h-6 w-6 text-gray-400" />
        <h1 className="text-2xl font-bold text-gray-400">
          Workout Tracker (Locked)
        </h1>
      </div>
      <p className="text-gray-500">
        Track workouts, build templates, and review your progress.
      </p>
    </div>
  );
}

/* ------------------------------------------------
   Full Workout Tracker
------------------------------------------------- */
function WorkoutTrackerContent() {
  const STORAGE_KEY = "ff-workout-logs-v1"; // { 'YYYY-MM-DD': [{name, sets, reps, weight}] }
  const todayKey = new Date().toISOString().slice(0, 10);

  const [logs, setLogs] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  });

  const day = logs[todayKey] || [];
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const save = (nextDay) => {
    const next = { ...logs, [todayKey]: nextDay };
    setLogs(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const add = () => {
    if (!exercise || !sets || !reps || !weight) return;
    save([
      ...day,
      {
        name: exercise,
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight),
        volume: Number(sets) * Number(reps) * Number(weight),
      },
    ]);
    setExercise("");
    setSets("");
    setReps("");
    setWeight("");
  };

  const remove = (idx) => {
    const copy = [...day];
    copy.splice(idx, 1);
    save(copy);
  };

  useEffect(() => {
    const onStorage = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      setLogs(raw ? JSON.parse(raw) : {});
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Dumbbell className="h-8 w-8 text-slate-700" />
        <h1 className="text-3xl font-bold text-slate-900">Workout Tracker</h1>
      </div>
      <p className="text-slate-600">
        Log today’s exercises and review your progress.
      </p>

      {/* Add form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Exercise"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Sets"
            type="number"
            min={1}
            value={sets}
            onChange={(e) => setSets(e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Reps"
            type="number"
            min={1}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Weight"
            type="number"
            min={0}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <button
          onClick={add}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold"
        >
          <Plus className="h-4 w-4" /> Add Exercise
        </button>
      </div>

      {/* Today’s log */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Today’s Workout ({todayKey})
        </h2>
        {day.length === 0 ? (
          <p className="text-slate-500">No exercises logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {day.map((it, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
              >
                <div>
                  <div className="font-semibold text-slate-800">{it.name}</div>
                  <div className="text-sm text-slate-600">
                    {it.sets} × {it.reps} @ {it.weight}kg • Volume: {it.volume}
                  </div>
                </div>
                <button
                  onClick={() => remove(idx)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
