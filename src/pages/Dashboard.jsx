// src/pages/Dashboard.jsx (dark athletic theme)
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Beef, Dumbbell, CalendarDays, ArrowRight, CircleHelp, Star, Sparkles } from "lucide-react";

/** ---------- Storage Keys ---------- **/
const FOOD_KEY = "ff-food-logs-v1"; // { [YYYY-MM-DD]: [{name, grams, calories, protein, carbs, fat}, ...] }
const WORKOUT_KEY = "ff-workout-logs-v1"; // { [YYYY-MM-DD]: [{name, sets, reps, weight, volume}, ...] }
const AIPLANS_KEY = "ff-ai-plans-v1"; // plan object

/** ---------- Small utils (self-contained) ---------- **/
const safeJSON = (s, fallback) => {
  try {
    const v = JSON.parse(s);
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
  return arr; // newest -> older
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

/** ---------- Decorative helpers ---------- **/
function GradientBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="pointer-events-none h-[520px] w-[1200px] blur-3xl opacity-30 bg-[radial-gradient(circle_at_top_left,theme(colors.emerald.700),transparent_60%)] absolute -top-40 -left-40" />
      <div className="pointer-events-none h-[520px] w-[1200px] blur-3xl opacity-30 bg-[radial-gradient(circle_at_top_right,theme(colors.indigo.700),transparent_60%)] absolute -top-40 -right-40" />
    </div>
  );
}

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
    <div className="relative bg-slate-950 text-slate-100 min-h-screen">
      <GradientBackdrop />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto"
      >
        {/* Header / Monetization CTA */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Fusion Fitness</h1>
            <p className="text-slate-400 mt-1">Your week at a glance. Dial in nutrition, training, and trends.</p>
          </div>

          <ProBanner />
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <KPI icon={Flame} label="Today Calories" value={formatNumber(todayFoodTotals.calories)} suffix="kcal" />
          <KPI icon={Beef} label="Today Protein" value={formatNumber(todayFoodTotals.protein, 1)} suffix="g" />
          <KPI icon={CalendarDays} label="Workouts This Week" value={formatNumber(weekWorkoutCount)} />
          <KPI icon={Sparkles} label="7‑Day Calories" value={formatNumber(weekFoodTotals.calories)} suffix="kcal" />
        </section>

        {/* Content cards */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <Card title="AI Coach" to="/ai-plans" cta="Open AI Coach">
            {plan ? (
              <div className="text-sm text-slate-300 grid gap-2">
                {"planType" in plan && (
                  <Row label="Plan"><span className="capitalize font-semibold">{String(plan.planType)}</span></Row>
                )}
                {"calories" in plan && (
                  <Row label="Target Calories"><b>{formatNumber(plan.calories)}</b></Row>
                )}
                <div className="flex flex-wrap gap-4 text-slate-300">
                  {"protein" in (plan.macros || {}) && (
                    <MacroPill label="Protein" value={formatNumber(plan.macros.protein)} unit="g" />
                  )}
                  {"carbs" in (plan.macros || {}) && (
                    <MacroPill label="Carbs" value={formatNumber(plan.macros.carbs)} unit="g" />
                  )}
                  {"fat" in (plan.macros || {}) && (
                    <MacroPill label="Fat" value={formatNumber(plan.macros.fat)} unit="g" />
                  )}
                </div>
                {"lastUpdated" in plan && (
                  <div className="text-xs text-slate-500 mt-1">Updated {String(plan.lastUpdated)}</div>
                )}
              </div>
            ) : (
              <EmptyState icon={CircleHelp} title="No plan yet" subtitle="Start the AI Coach to get tailored calories & macros." action={{ to: "/ai-plans", label: "Create Plan" }} />
            )}
          </Card>

          <Card title="Workout Tracker" to="/workout-tracker" cta="Open Workout Tracker">
            <div className="grid md:grid-cols-2 gap-4">
              <MiniStat title="Today" value={`${todayWorkouts.length} exercise${todayWorkouts.length === 1 ? "" : "s"}`}>
                <div className="text-sm text-slate-400 mt-1">
                  {todayWorkouts.slice(0, 3).map((w, i) => (
                    <span key={i} className="inline-block mr-3">{w?.name || "Exercise"}</span>
                  ))}
                  {todayWorkouts.length > 3 && <span>+{todayWorkouts.length - 3} more</span>}
                </div>
              </MiniStat>

              <MiniStat title="Last 7 Days" value={`${formatNumber(weekWorkoutCount)} day${weekWorkoutCount === 1 ? "" : "s"} worked out`}>
                <div className="text-sm text-slate-400 mt-1 flex items-center gap-2"><Dumbbell className="h-4 w-4" />Keep the streak going</div>
              </MiniStat>
            </div>

            <div className="mt-4">
              <SectionTitle>Recent workouts</SectionTitle>
              {recentWorkouts.length === 0 ? (
                <EmptyMuted>No workouts logged in the last 7 days.</EmptyMuted>
              ) : (
                <FancyList>
                  {recentWorkouts.map((w, i) => (
                    <li key={`${w._date}-${i}`} className="px-3 py-2 flex items-center justify-between">
                      <div className="truncate">
                        <div className="font-medium truncate">{w?.name || "Workout"}</div>
                        <div className="text-xs text-slate-400">{w._date}</div>
                      </div>
                      <div className="text-xs text-slate-300">
                        {w?.sets ? `${w.sets} sets` : ""} {w?.reps ? `• ${w.reps} reps` : ""} {w?.weight ? `• ${w.weight} ${w?.unit || "lb"}` : ""}
                      </div>
                    </li>
                  ))}
                </FancyList>
              )}
            </div>
          </Card>
        </div>

        {/* Food card full width */}
        <Card className="mt-6" title="Food Tracker" to="/food-tracker" cta="Open Food Tracker">
          <div className="grid md:grid-cols-2 gap-4">
            <MiniStat title="Today" value={`${formatNumber(todayFoodTotals.calories)} kcal`}>
              <div className="text-sm text-slate-400 mt-1">
                P {formatNumber(todayFoodTotals.protein, 1)} g • C {formatNumber(todayFoodTotals.carbs, 1)} g • F {formatNumber(todayFoodTotals.fat, 1)} g
              </div>
            </MiniStat>

            <MiniStat title="Last 7 Days" value={`${formatNumber(weekFoodTotals.calories)} kcal`}>
              <div className="text-sm text-slate-400 mt-1">
                P {formatNumber(weekFoodTotals.protein, 1)} g • C {formatNumber(weekFoodTotals.carbs, 1)} g • F {formatNumber(weekFoodTotals.fat, 1)} g
              </div>
            </MiniStat>
          </div>

          <div className="mt-4">
            <SectionTitle>Recent foods</SectionTitle>
            {recentFoodItems.length === 0 ? (
              <EmptyMuted>No food logged in the last 7 days.</EmptyMuted>
            ) : (
              <FancyList>
                {recentFoodItems.map((it, i) => (
                  <li key={`${it._date}-${i}`} className="px-3 py-2 flex items-center justify-between">
                    <div className="truncate">
                      <div className="font-medium truncate">{it.name}</div>
                      <div className="text-xs text-slate-400 truncate">
                        {it._date} • {formatNumber(it.grams)} g — {formatNumber(it.calories)} kcal
                      </div>
                    </div>
                    <span className="text-xs text-slate-300">
                      P {formatNumber(it.protein, 1)} / C {formatNumber(it.carbs, 1)} / F {formatNumber(it.fat, 1)}
                    </span>
                  </li>
                ))}
              </FancyList>
            )}
          </div>
        </Card>

        {/* Quick links */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card title="Healthy Recipes" to="/recipes" cta="Browse Recipes">
            <p className="text-sm text-slate-400">Get meal ideas that match your macros and preferences.</p>
          </Card>
          <Card title="Analytics" to="/analytics" cta="Open Analytics">
            <p className="text-sm text-slate-400">Charts and trends for food & workouts, plus weekly metabolism estimate.</p>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

/** ---------- Simple UI helpers ---------- **/
function KPI({ icon: Icon, label, value, suffix }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl bg-slate-900/80 backdrop-blur border border-slate-800 p-4 text-center shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wide text-slate-400">
        {Icon && <Icon className="h-4 w-4 text-emerald-400" />} {label}
      </div>
      <div className="text-xl font-bold mt-1">
        {value} {suffix && <span className="text-slate-400 font-medium text-base align-top">{suffix}</span>}
      </div>
    </motion.div>
  );
}

function Card({ title, to, cta, children, className = "" }) {
  return (
    <section className={`relative bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="absolute inset-0 pointer-events-none rounded-2xl border border-transparent [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link
          to={to}
          className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-500/90 active:scale-[0.99]"
        >
          {cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function MiniStat({ title, value, children }) {
  return (
    <div className="rounded-xl border border-slate-800 p-4 bg-slate-900/80">
      <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return <div className="text-sm font-semibold mb-2">{children}</div>;
}

function FancyList({ children }) {
  return (
    <ul className="text-sm divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/60">
      {children}
    </ul>
  );
}

function EmptyMuted({ children }) {
  return <div className="text-sm text-slate-400">{children}</div>;
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-2 text-sm">
      <div className="text-slate-400">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function MacroPill({ label, value, unit }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300">
      <Beef className="h-3.5 w-3.5 text-emerald-400" /> {label}: <b className="ml-1">{value} {unit}</b>
    </span>
  );
}

function ProBanner() {
  return (
    <div className="relative rounded-2xl border border-emerald-800 bg-gradient-to-br from-emerald-900/30 to-slate-900/30 p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Star className="h-5 w-5 text-emerald-400" />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-emerald-200">Unlock Fusion Pro</div>
          <div className="text-xs text-emerald-300/80">Weekly macros, advanced analytics & AI meal plans.</div>
        </div>
        <Link
          to="/pricing"
          className="ml-auto inline-flex items-center gap-1 rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-500/90"
        >
          See plans <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 p-4 bg-slate-900/80">
      <div className="flex items-start gap-3">
        {Icon && <Icon className="h-5 w-5 text-slate-500 mt-0.5" />}
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-slate-400">{subtitle}</div>
        </div>
      </div>
      {action?.to && (
        <Link
          to={action.to}
          className="inline-flex items-center gap-1 rounded-xl bg-slate-200 text-slate-900 px-3 py-1.5 text-sm font-semibold hover:bg-white"
        >
          {action.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
