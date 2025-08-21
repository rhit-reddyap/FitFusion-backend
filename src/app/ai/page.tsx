"use client";

import AuthGuard from "@/components/AuthGuard";
import PaywallGate from "@/app/components/PaywallGate";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Pencil, Trash2, PlusCircle } from "lucide-react";

type Meal = { name: string; calories: number; protein: number; };
type Workout = { day: string; focus: string; notes?: string; };
type AIPlan = {
  title: string;
  goal: "cut" | "recomp" | "bulk";
  caloriesTarget: number;
  proteinTarget: number;
  meals: Meal[];
  workouts: Workout[];
  createdAt: string; // ISO
};

const AIPLANS_KEY = "ff-ai-plans-v1";

const safeJSON = <T,>(s: string | null, f: T): T => {
  try { const v = s ? JSON.parse(s) : null; return (v ?? f) as T; } catch { return f; }
};

export default function AIPage() {
  // Load existing plan
  const [plan, setPlan] = useState<AIPlan | null>(() => {
    if (typeof window === "undefined") return null;
    return safeJSON<AIPlan | null>(localStorage.getItem(AIPLANS_KEY), null);
  });

  // Persist on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (plan) localStorage.setItem(AIPLANS_KEY, JSON.stringify(plan));
    else localStorage.removeItem(AIPLANS_KEY);
  }, [plan]);

  // Derived summary
  const totals = useMemo(() => {
    if (!plan) return { calories: 0, protein: 0 };
    const calories = (plan.meals || []).reduce((a, m) => a + (Number(m.calories) || 0), 0);
    const protein = (plan.meals || []).reduce((a, m) => a + (Number(m.protein) || 0), 0);
    return { calories, protein };
  }, [plan]);

  function generateMockPlan() {
    const next: AIPlan = {
      title: "Lean Mass Plan",
      goal: "recomp",
      caloriesTarget: 2400,
      proteinTarget: 160,
      meals: [
        { name: "Greek yogurt + berries", calories: 300, protein: 28 },
        { name: "Chicken & rice bowl", calories: 650, protein: 45 },
        { name: "Egg‑white omelet", calories: 350, protein: 32 },
        { name: "Salmon + veggies", calories: 600, protein: 40 },
      ],
      workouts: [
        { day: "Mon", focus: "Push – chest/shoulders/triceps", notes: "Top set + backoff" },
        { day: "Tue", focus: "Pull – back/biceps" },
        { day: "Wed", focus: "Legs – quads/hams/glutes" },
        { day: "Thu", focus: "Upper – volume" },
        { day: "Fri", focus: "Lower – volume" },
      ],
      createdAt: new Date().toISOString(),
    };
    setPlan(next);
  }

  function clearPlan() {
    setPlan(null);
  }

  function editCaloriesTarget(delta: number) {
    if (!plan) return;
    setPlan({ ...plan, caloriesTarget: Math.max(1200, plan.caloriesTarget + delta) });
  }

  function editProteinTarget(delta: number) {
    if (!plan) return;
    setPlan({ ...plan, proteinTarget: Math.max(60, plan.proteinTarget + delta) });
  }

  return (
    <AuthGuard>
      <section className="container py-6 space-y-4">
        <PaywallGate title="AI Coach is Premium">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">AI Coach</h1>
            {plan ? (
              <div className="flex items-center gap-2">
                <button className="btn" onClick={() => editCaloriesTarget(-100)} aria-label="Dec calories">
                  −100 kcal
                </button>
                <button className="btn" onClick={() => editCaloriesTarget(+100)} aria-label="Inc calories">
                  +100 kcal
                </button>
              </div>
            ) : null}
          </div>

          {/* Empty state */}
          {!plan && (
            <div className="card text-center space-y-3">
              <div className="text-sm text-slate-400">
                No plan yet. Generate a personalized program to guide your meals and training.
              </div>
              <button className="btn btn-primary w-full" onClick={generateMockPlan}>
                <Sparkles size={18} /> Generate AI Plan
              </button>
            </div>
          )}

          {/* Plan content */}
          {plan && (
            <>
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Plan</div>
                    <div className="text-lg font-semibold">{plan.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn" onClick={() => editProteinTarget(-10)} aria-label="Dec protein">
                      −10 g
                    </button>
                    <button className="btn" onClick={() => editProteinTarget(+10)} aria-label="Inc protein">
                      +10 g
                    </button>
                    <button className="btn" onClick={clearPlan} aria-label="Clear">
                      <Trash2 size={16} /> Clear
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                    <div className="text-xs text-slate-400">Target Calories</div>
                    <div className="text-2xl font-bold">{plan.caloriesTarget.toLocaleString()} kcal</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Today’s plan total: {totals.calories.toLocaleString()} kcal
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                    <div className="text-xs text-slate-400">Target Protein</div>
                    <div className="text-2xl font-bold">{plan.proteinTarget} g</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Today’s plan total: {totals.protein} g
                    </div>
                  </div>
                </div>
              </div>

              {/* Meals */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Meals</div>
                  <button
                    className="btn"
                    onClick={() => {
                      const name = prompt("New meal name?");
                      if (!name) return;
                      const calories = Number(prompt("Calories?") || "0");
                      const protein = Number(prompt("Protein (g)?") || "0");
                      setPlan({
                        ...plan,
                        meals: [...plan.meals, { name, calories, protein }],
                      });
                    }}
                  >
                    <PlusCircle size={18} /> Add meal
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {plan.meals.map((m, idx) => (
                    <div
                      key={`${m.name}-${idx}`}
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
                    >
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-slate-400">
                          {m.calories} kcal • {m.protein} g protein
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn"
                          onClick={() => {
                            const name = prompt("Meal name:", m.name) || m.name;
                            const calories = Number(prompt("Calories:", String(m.calories)) || m.calories);
                            const protein = Number(prompt("Protein (g):", String(m.protein)) || m.protein);
                            const next = [...plan.meals];
                            next[idx] = { name, calories, protein };
                            setPlan({ ...plan, meals: next });
                          }}
                        >
                          <Pencil size={16} /> Edit
                        </button>
                        <button
                          className="btn"
                          onClick={() => {
                            const next = plan.meals.slice();
                            next.splice(idx, 1);
                            setPlan({ ...plan, meals: next });
                          }}
                        >
                          <Trash2 size={16} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workouts */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Weekly Workouts</div>
                  <button
                    className="btn"
                    onClick={() => {
                      const day = prompt("Day label (e.g., Sat)?") || "Day";
                      const focus = prompt("Focus (e.g., Push / Pull / Legs)?") || "Full body";
                      const notes = prompt("Notes (optional)") || "";
                      setPlan({
                        ...plan,
                        workouts: [...plan.workouts, { day, focus, notes }],
                      });
                    }}
                  >
                    <PlusCircle size={18} /> Add day
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {plan.workouts.map((w, idx) => (
                    <div
                      key={`${w.day}-${idx}`}
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
                    >
                      <div>
                        <div className="font-medium">{w.day} — {w.focus}</div>
                        {w.notes ? <div className="text-xs text-slate-400">{w.notes}</div> : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn"
                          onClick={() => {
                            const day = prompt("Day label:", w.day) || w.day;
                            const focus = prompt("Focus:", w.focus) || w.focus;
                            const notes = prompt("Notes:", w.notes || "") || w.notes || "";
                            const next = [...plan.workouts];
                            next[idx] = { day, focus, notes };
                            setPlan({ ...plan, workouts: next });
                          }}
                        >
                          <Pencil size={16} /> Edit
                        </button>
                        <button
                          className="btn"
                          onClick={() => {
                            const next = plan.workouts.slice();
                            next.splice(idx, 1);
                            setPlan({ ...plan, workouts: next });
                          }}
                        >
                          <Trash2 size={16} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </PaywallGate>
      </section>
    </AuthGuard>
  );
}
