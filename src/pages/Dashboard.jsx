// src/pages/Dashboard.jsx
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

/** ---------- Storage Keys ---------- **/
const FOOD_KEY = "ff-food-logs-v1";       // { [YYYY-MM-DD]: [{name, grams, calories, protein, carbs, fat}, ...] }
const WORKOUT_KEY = "ff-workout-logs-v1"; // { [YYYY-MM-DD]: [{name, sets, reps, weight, volume}, ...] }
const AIPLANS_KEY = "ff-ai-plans-v1";     // plan object

/** ---------- Small utils (self-contained) ---------- **/
const safeJSON = (s, fallback) => {
  try {
    const v = JSON.parse(s);
    // Guard against null/undefined
    return v ?? fallback;
  } catch {
    return fallback;
  }
};
const todayKey = () => new Date().toISOString().slice(0, 10);

const lastNDates = (n) => {
  const arr = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    arr.push(new Date(d).toISOString().slice(0, 10));
    d.setDate(d.getDate() - 1);
  }
  return arr; // newest -> older (we’ll just iterate through)
};

const safeNum = (v, f = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : f;
};

const sumMacros = (items) =>
  (Array.isArray(items) ? items : []).reduce(
    (t, x) => ({
      calories: t.calories + safeNum(x.calories),
      protein: t.protein + safeNum(x.protein),
      carbs: t.carbs + safeNum(x.carbs),
      fat: t.fat + safeNum(x.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

const formatNumber = (n, d = 0) =>
  (Number.isFinite(n) ? n : 0).toLocaleString(undefined, {
    maximumFractionDigits: d,
    minimumFractionDigits: d,
  });

/** ---------- Component ---------- **/
export default function Dashboard() {
  // Load from localStorage on mount; keep it defensive
  const [food, setFood] = useState({});
  const [workouts, setWorkouts] = useState({});
  const [aiPlans, setAiPlans] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setFood(safeJSON(localStorage.getItem(FOOD_KEY), {}));
    setWorkouts(safeJSON(localStorage.getItem(WORKOUT_KEY), {}));
    setAiPlans(safeJSON(localStorage.getItem(AIPLANS_KEY), null));
  }, []);

  const tKey = todayKey();
  const weekKeys = lastNDates(7);

  // --- Food stats ---
  const todayFoodTotals = useMemo(() => sumMacros(food[tKey] || []), [food, tKey]);

  const weekFoodTotals = useMemo(() => {
    const weekItems = weekKeys.flatMap((k) => (Array.isArray(food[k]) ? food[k] : []));
    return sumMacros(weekItems);
  }, [food]);

  const recentFoodItems = useMemo(() => {
    const list = [];
    weekKeys.forEach((k) => {
      (Array.isArray(food[k]) ? food[k] : []).forEach((it, idx) => list.push({ ...it, _date: k, _idx: idx }));
    });
    return list.slice(0, 5);
  }, [food]);

  // --- Workout stats ---
  const todayWorkouts = Array.isArray(workouts[tKey]) ? workouts[tKey] : [];
  const weekWorkoutCount = useMemo(
    () =>
      weekKeys.reduce((acc, k) => {
        const arr = Array.isArray(workouts[k]) ? workouts[k] : [];
        return acc + (arr.length > 0 ? 1 : 0);
      }, 0),
    [workouts]
  );

  const recentWorkouts = useMemo(() => {
    const list = [];
    weekKeys.forEach((k) => {
      (Array.isArray(workouts[k]) ? workouts[k] : []).forEach((w, idx) => list.push({ ...w, _date: k, _idx: idx }));
    });
    return list.slice(0, 5);
  }, [workouts]);

  const plan = aiPlans || null;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard — Fusion Fitness</h1>
      <p className="text-slate-600">Your week at a glance. Jump into any tool to update.</p>

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Today Calories" value={formatNumber(todayFoodTotals.calories)} />
        <KPI label="Today Protein" value={`${formatNumber(todayFoodTotals.protein, 1)} g`} />
        <KPI label="Workouts This Week" value={formatNumber(weekWorkoutCount)} />
        <KPI label="7-Day Calories" value={formatNumber(weekFoodTotals.calories)} />
      </section>

      {/* AI Plans Preview */}
      <Card title="AI Coach" to="/ai-plans" cta="Open AI Coach">
        {plan ? (
          <div className="text-sm text-slate-700 grid gap-1">
            {"planType" in plan && (
              <div>
                <span className="text-slate-500">Plan: </span>
                <b className="text-slate-900 capitalize">{String(plan.planType)}</b>
              </div>
            )}
            {"calories" in plan && (
              <div>
                <span className="text-slate-500">Target Calories: </span>
                <b className="text-slate-900">{formatNumber(plan.calories)}</b>
              </div>
            )}
            <div className="flex flex-wrap gap-4 text-slate-600">
              {"protein" in (plan.macros || {}) && (
                <span>
                  Protein: <b className="text-slate-900">{formatNumber(plan.macros.protein)} g</b>
                </span>
              )}
              {"carbs" in (plan.macros || {}) && (
                <span>
                  Carbs: <b className="text-slate-900">{formatNumber(plan.macros.carbs)} g</b>
                </span>
              )}
              {"fat" in (plan.macros || {}) && (
                <span>
                  Fat: <b className="text-slate-900">{formatNumber(plan.macros.fat)} g</b>
                </span>
              )}
            </div>
            {"lastUpdated" in plan && (
              <div className="text-xs text-slate-500 mt-1">Updated {String(plan.lastUpdated)}</div>
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-500">No saved plan yet. Start in AI Coach.</div>
        )}
      </Card>

      {/* Food Tracker Preview */}
      <Card title="Food Tracker" to="/food-tracker" cta="Open Food Tracker">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Today</div>
            <div className="text-2xl font-bold text-slate-900">{formatNumber(todayFoodTotals.calories)} kcal</div>
            <div className="text-sm text-slate-600 mt-1">
              P {formatNumber(todayFoodTotals.protein, 1)} g • C {formatNumber(todayFoodTotals.carbs, 1)} g • F {formatNumber(todayFoodTotals.fat, 1)} g
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Last 7 Days</div>
            <div className="text-2xl font-bold text-slate-900">{formatNumber(weekFoodTotals.calories)} kcal</div>
            <div className="text-sm text-slate-600 mt-1">
              P {formatNumber(weekFoodTotals.protein, 1)} g • C {formatNumber(weekFoodTotals.carbs, 1)} g • F {formatNumber(weekFoodTotals.fat, 1)} g
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm font-semibold text-slate-900 mb-2">Recent foods</div>
          {recentFoodItems.length === 0 ? (
            <div className="text-sm text-slate-500">No food logged in the last 7 days.</div>
          ) : (
            <ul className="text-sm text-slate-700 divide-y divide-slate-200 rounded-xl border border-slate-200">
              {recentFoodItems.map((it, i) => (
                <li key={`${it._date}-${i}`} className="px-3 py-2 flex items-center justify-between">
                  <div className="truncate">
                    <div className="font-medium text-slate-900 truncate">{it.name}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {it._date} • {formatNumber(it.grams)} g — {formatNumber(it.calories)} kcal
                    </div>
                  </div>
                  <span className="text-xs text-slate-600">
                    P {formatNumber(it.protein, 1)} / C {formatNumber(it.carbs, 1)} / F {formatNumber(it.fat, 1)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {/* Workout Tracker Preview */}
      <Card title="Workout Tracker" to="/workout-tracker" cta="Open Workout Tracker">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Today</div>
            <div className="text-2xl font-bold text-slate-900">
              {todayWorkouts.length} exercise{todayWorkouts.length === 1 ? "" : "s"}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              {todayWorkouts.slice(0, 3).map((w, i) => (
                <span key={i} className="inline-block mr-3">{w?.name || "Exercise"}</span>
              ))}
              {todayWorkouts.length > 3 && <span>+{todayWorkouts.length - 3} more</span>}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Last 7 Days</div>
            <div className="text-2xl font-bold text-slate-900">
              {formatNumber(weekWorkoutCount)} day{weekWorkoutCount === 1 ? "" : "s"} worked out
            </div>
            <div className="text-sm text-slate-600 mt-1">Keep the streak going 💪</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm font-semibold text-slate-900 mb-2">Recent workouts</div>
          {recentWorkouts.length === 0 ? (
            <div className="text-sm text-slate-500">No workouts logged in the last 7 days.</div>
          ) : (
            <ul className="text-sm text-slate-700 divide-y divide-slate-200 rounded-xl border border-slate-200">
              {recentWorkouts.map((w, i) => (
                <li key={`${w._date}-${i}`} className="px-3 py-2 flex items-center justify-between">
                  <div className="truncate">
                    <div className="font-medium text-slate-900 truncate">{w?.name || "Workout"}</div>
                    <div className="text-xs text-slate-500">{w._date}</div>
                  </div>
                  <div className="text-xs text-slate-600">
                    {w?.sets ? `${w.sets} sets` : ""} {w?.reps ? `• ${w.reps} reps` : ""} {w?.weight ? `• ${w.weight} ${w?.unit || "lb"}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {/* Quick links */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Healthy Recipes" to="/recipes" cta="Browse Recipes">
          <div className="text-sm text-slate-600">Get meal ideas that match your macros and preferences.</div>
        </Card>
        <Card title="Analytics" to="/analytics" cta="Open Analytics">
          <div className="text-sm text-slate-600">Charts and trends for food & workouts, plus weekly metabolism estimate.</div>
        </Card>
      </div>
    </div>
  );
}

/** ---------- Simple UI helpers ---------- **/
function KPI({ label, value }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function Card({ title, to, cta, children }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <Link
          to={to}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-500"
        >
          {cta}
          <span aria-hidden>›</span>
        </Link>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
