"use client";

import AuthGuard from "@/components/AuthGuard";
import PaywallGate from "@/app/components/PaywallGate";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type SetEntry = { reps: number; weight: number };
type Exercise = { name: string; sets: SetEntry[] };

const WORKOUT_KEY = "ff-workout-logs-v1";
const UNITS_KEY = "ff-units-v1";

// helpers
const todayKey = () => new Date().toISOString().slice(0, 10);
const safeJSON = <T,>(s: string | null, f: T): T => {
  try {
    const v = s ? JSON.parse(s) : null;
    return (v ?? f) as T;
  } catch {
    return f;
  }
};

export default function WorkoutsPage() {
  const dateKey = todayKey();

  // Units (read-only here; elsewhere you toggle and save)
  const units = safeJSON<{ mass: "lb" | "kg"; length: "in" | "cm" }>(
    typeof window !== "undefined" ? localStorage.getItem(UNITS_KEY) : null,
    { mass: "lb", length: "in" }
  );

  // Load today's workouts
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    if (typeof window === "undefined") return [{ name: "Bench Press", sets: [{ reps: 8, weight: 135 }] }];
    const all = safeJSON<Record<string, Exercise[]>>(localStorage.getItem(WORKOUT_KEY), {});
    return all[dateKey] || [{ name: "Bench Press", sets: [{ reps: 8, weight: 135 }] }];
  });

  // Persist on change
  useEffect(() => {
    const all = safeJSON<Record<string, Exercise[]>>(localStorage.getItem(WORKOUT_KEY), {});
    const next = { ...all, [dateKey]: exercises };
    localStorage.setItem(WORKOUT_KEY, JSON.stringify(next));
  }, [exercises, dateKey]);

  // Derived: total volume (Σ sets reps*weight)
  const totalVolume = useMemo(() => {
    const raw = exercises.reduce(
      (acc, ex) => acc + ex.sets.reduce((a, s) => a + (Number(s.reps) || 0) * (Number(s.weight) || 0), 0),
      0
    );
    // display per units
    return units.mass === "lb"
      ? `${Math.round(raw * 2.20462).toLocaleString()} lb·reps`
      : `${Math.round(raw).toLocaleString()} kg·reps`;
  }, [exercises, units.mass]);

  function addExercise() {
    setExercises((prev) => [...prev, { name: "New Exercise", sets: [{ reps: 10, weight: 0 }] }]);
  }

  function addSet(i: number) {
    setExercises((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], sets: [...next[i].sets, { reps: 10, weight: 0 }] };
      return next;
    });
  }

  function removeExercise(i: number) {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateSet(i: number, j: number, field: "reps" | "weight", value: number) {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[i] };
      const sets = [...ex.sets];
      const curr = { ...sets[j], [field]: value };
      sets[j] = curr;
      ex.sets = sets;
      next[i] = ex;
      return next;
    });
  }

  function renameExercise(i: number, name: string) {
    setExercises((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], name };
      return next;
    });
  }

  return (
    <AuthGuard>
      <section className="container py-6 space-y-4">
        <PaywallGate title="Workout Tracker is Premium">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Workouts</h1>
            <button className="btn" onClick={addExercise}>
              <Plus size={18} /> Add exercise
            </button>
          </div>

          {/* Summary card */}
          <div className="card flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm text-slate-400">Today&apos;s total volume</div>
              <div className="text-2xl font-bold">{totalVolume}</div>
            </div>
            <div className="text-xs text-slate-400">Units: {units.mass.toUpperCase()}</div>
          </div>

          {/* Exercises */}
          {exercises.map((ex, i) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between gap-2">
                <input
                  className="input max-w-sm w-full"
                  value={ex.name}
                  onChange={(e) => renameExercise(i, e.target.value)}
                />
                <button className="btn" onClick={() => removeExercise(i)} aria-label="Remove exercise">
                  <Trash2 size={16} /> Remove
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 items-center text-sm">
                <div className="font-medium text-slate-300">Set</div>
                <div className="font-medium text-slate-300">Reps</div>
                <div className="font-medium text-slate-300">Weight ({units.mass})</div>

                {ex.sets.map((s, j) => (
                  <div key={`${i}-${j}`} className="contents">
                    <div className="py-2 text-slate-400">#{j + 1}</div>
                    <input
                      className="input"
                      type="number"
                      inputMode="numeric"
                      value={s.reps}
                      onChange={(e) => updateSet(i, j, "reps", Number(e.target.value))}
                    />
                    <input
                      className="input"
                      type="number"
                      inputMode="decimal"
                      value={s.weight}
                      onChange={(e) => updateSet(i, j, "weight", Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>

              <button onClick={() => addSet(i)} className="btn mt-3 w-full">
                Add set
              </button>
            </div>
          ))}
        </PaywallGate>
      </section>
    </AuthGuard>
  );
}
