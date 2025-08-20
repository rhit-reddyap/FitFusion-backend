import { useEffect, useMemo, useState } from "react";

/* Storage Keys */
const FOOD_KEY    = "ff-food-logs-v1";
const WEIGHT_KEY  = "ff-weight-log-v1";
const BURN_KEY    = "ff-burn-logs-v1";
const WKOUT_KEY   = "ff-workouts-v1";
const PROFILE_KEY = "ff-user-profile-v1";

const safeJSON = (s, f) => { try { return JSON.parse(s) ?? f; } catch { return f; } };
const today = () => new Date().toISOString().slice(0, 10);
const sum = (arr) => arr.reduce((a, b) => a + (Number(b) || 0), 0);
const format = (n, digits = 0) =>
  (Number.isFinite(n) ? n : 0).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });

function lastNDates(n, newestFirst = false) {
  const arr = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const k = new Date(d).toISOString().slice(0, 10);
    newestFirst ? arr.push(k) : arr.unshift(k);
    d.setDate(d.getDate() - 1);
  }
  return arr;
}
function caloriesSeries(foodObj, n = 28) {
  const keys = lastNDates(n);
  const vals = keys.map(k => {
    const items = Array.isArray(foodObj[k]) ? foodObj[k] : [];
    return items.reduce((t, it) => t + (Number(it.calories) || 0), 0);
  });
  return { keys, vals };
}
function weightSeries(weightsArr, n = 28) {
  const arr = Array.isArray(weightsArr) ? [...weightsArr] : [];
  arr.sort((a, b) => (a?.date || "").localeCompare(b?.date || ""));
  const keys = lastNDates(n);
  const map = new Map(arr.map(x => [x?.date, Number(x?.weight_kg)]));
  const vals = [];
  let last = null;
  for (const k of keys) {
    const v = map.get(k);
    if (Number.isFinite(v)) { last = v; vals.push(v); }
    else { vals.push(last != null ? last : null); }
  }
  return { keys, vals };
}
function avg(arr, len = arr.length) {
  const a = arr.slice(-len).filter(Number.isFinite);
  return a.length ? sum(a) / a.length : 0;
}

/* ---------- Sparkline ---------- */
function Sparkline({ data = [], height = 44, width = 560 }) {
  const vals = data.map(v => (Number.isFinite(Number(v)) ? Number(v) : null));
  const finite = vals.filter(Number.isFinite);
  const min = finite.length ? Math.min(...finite) : 0;
  const max = finite.length ? Math.max(...finite) : 1;
  const pad = (max - min) * 0.1 || 1;
  const yMin = min - pad, yMax = max + pad;

  const pts = vals.map((v, i) => {
    const x = (i / Math.max(vals.length - 1, 1)) * (width - 8) + 4;
    const y = v == null ? null : height - ((v - yMin) / Math.max(yMax - yMin, 1)) * (height - 8) - 4;
    return { x, y };
  });

  const d = pts.reduce((acc, p, i) => {
    if (!p || p.y == null) return acc;
    return acc + (i === 0 || pts[i - 1].y == null ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`);
  }, "");

  return <svg width={width} height={height} className="block"><path d={d} fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
}

/* ---------- Locked Overlay ---------- */
function LockedOverlay({ children }) {
  return (
    <div className="relative">
      <div className="pointer-events-none filter blur-sm">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
        <p className="text-white font-semibold text-lg">
          🔒 Upgrade to Premium to Unlock
        </p>
      </div>
    </div>
  );
}

export default function Analytics() {
  const isPremium = localStorage.getItem("isPremium") === "true";

  const [food, setFood] = useState({});
  const [weights, setWeights] = useState([]);
  const [burn, setBurn] = useState({});
  const [burnInput, setBurnInput] = useState("");

  const [workouts, setWorkouts] = useState([]);
  const [profile, setProfile] = useState({});
  const [metLevel, setMetLevel] = useState("moderate");
  const [unitSystem, setUnitSystem] = useState("metric");

  const MET = metLevel === "light" ? 3.5 : metLevel === "hard" ? 8 : 6;
  const kgToLb = (kg) => kg * 2.20462;
  const formatWeight = (kg, digits = 1) =>
    !Number.isFinite(kg) ? "—" : unitSystem === "metric" ? `${kg.toFixed(digits)} kg` : `${kgToLb(kg).toFixed(digits)} lb`;
  const formatWeightChange = (kgChange, digits = 2) =>
    !Number.isFinite(kgChange) ? "—" : unitSystem === "metric" ? `${kgChange.toFixed(digits)} kg` : `${kgToLb(kgChange).toFixed(digits)} lb`;

  useEffect(() => {
    setFood(safeJSON(localStorage.getItem(FOOD_KEY), {}));
    setWeights(safeJSON(localStorage.getItem(WEIGHT_KEY), []));
    setBurn(safeJSON(localStorage.getItem(BURN_KEY), {}));
    setWorkouts(safeJSON(localStorage.getItem(WKOUT_KEY), []));
    setProfile(safeJSON(localStorage.getItem(PROFILE_KEY), {}));

    const onStorage = () => {
      setFood(safeJSON(localStorage.getItem(FOOD_KEY), {}));
      setWeights(safeJSON(localStorage.getItem(WEIGHT_KEY), []));
      setBurn(safeJSON(localStorage.getItem(BURN_KEY), {}));
      setWorkouts(safeJSON(localStorage.getItem(WKOUT_KEY), []));
      setProfile(safeJSON(localStorage.getItem(PROFILE_KEY), {}));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const cal28 = useMemo(() => caloriesSeries(food, 28), [food]);
  const w28 = useMemo(() => weightSeries(weights, 28), [weights]);

  const last7Keys = useMemo(() => lastNDates(7, true), []);
  const last7Consumed = sum(last7Keys.map(k => {
    const items = Array.isArray(food[k]) ? food[k] : [];
    return items.reduce((t, it) => t + (Number(it.calories) || 0), 0);
  }));
  const last7BurnedManual = sum(last7Keys.map(k => Number(burn[k] || 0)));

  const last7BurnedFromWorkouts = useMemo(() => {
    const kg = Number(profile?.weight_kg) || 75;
    const since = new Date(); since.setDate(since.getDate() - 6);
    const weekSessions = (Array.isArray(workouts) ? workouts : []).filter(w => new Date(w.date) >= since);
    let total = 0;
    for (const w of weekSessions) {
      const sec = Number(w.duration_s) || 0;
      total += MET * kg * (sec / 3600);
    }
    return Math.round(total);
  }, [workouts, profile?.weight_kg, MET]);

  const usedBurn = last7BurnedManual > 0 ? last7BurnedManual : last7BurnedFromWorkouts;
  const burnSource = last7BurnedManual > 0 ? "Manual" : "Estimated (MET)";
  const net7 = last7Consumed - usedBurn;
  const avgDailyNet = net7 / 7;
  const estLbChange = net7 / 3500;
  const estKgChange = estLbChange * 0.45359237;
  const latestWeightKg = w28.vals.filter(Number.isFinite).slice(-1)[0] ?? null;

  const saveTodayBurn = () => {
    const v = Number(burnInput);
    if (!Number.isFinite(v) || v < 0) return;
    const k = today();
    const next = { ...burn, [k]: v };
    setBurn(next);
    localStorage.setItem(BURN_KEY, JSON.stringify(next));
    setBurnInput("");
  };

  const content = (
    <div className="p-6 space-y-6">
      {/* Header + Unit toggle */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics — Fusion Fitness</h1>
          <p className="text-slate-600">Trends for your calories, weight, and weekly metabolism estimate.</p>
        </div>
        <button
          onClick={() => setUnitSystem(u => (u === "metric" ? "imperial" : "metric"))}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm hover:bg-slate-50"
        >
          Units: {unitSystem === "metric" ? "Metric (kg, cm)" : "Imperial (lb, in)"}
        </button>
      </div>

      {/* Weekly Metabolism Estimate */}
      <section className="bg-white rounded-2xl border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Weekly Metabolism Estimate</div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Intensity (fallback)</label>
            <select
              value={metLevel}
              onChange={(e)=>setMetLevel(e.target.value)}
              className="rounded-lg border px-2 py-1 text-sm"
            >
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KPI label="Consumed (7d)" value={`${format(last7Consumed)} kcal`} />
          <KPI label="Burned (7d)" value={`${format(usedBurn)} kcal`} />
          <KPI label="Net (7d)" value={`${format(net7)} kcal`} />
          <KPI label="Avg Daily Net" value={`${format(avgDailyNet)} kcal/d`} />
          <KPI label="Projected Δ (7d)" value={formatWeightChange(estKgChange)} />
        </div>

        <div className="mt-2 text-xs text-slate-600">
          Burn source: <b>{burnSource}</b>. Projection uses 3500 kcal ≈ 1 lb. Current weight:{" "}
          <b>{formatWeight(latestWeightKg)}</b>.
        </div>
      </section>

      {/* Quick burn entry */}
      <section className="bg-white rounded-2xl border p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm">Enter today’s calories burned:</div>
          <input
            type="number"
            min={0}
            value={burnInput}
            onChange={(e)=>setBurnInput(e.target.value)}
            className="w-28 rounded-xl border px-3 py-2"
          />
          <button onClick={saveTodayBurn} className="rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold hover:bg-slate-800">
            Save
          </button>
        </div>
      </section>

      {/* Calories (28d) */}
      <section className="bg-white rounded-2xl border p-4 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Calories (28d)</div>
        <Sparkline data={cal28.vals} />
      </section>

      {/* Weight (28d) */}
      <section className="bg-white rounded-2xl border p-4 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Weight (28d)</div>
        <Sparkline data={w28.vals} />
        <div className="text-xs mt-1">Latest: <b>{formatWeight(latestWeightKg)}</b></div>
      </section>
    </div>
  );

  return isPremium ? content : <LockedOverlay>{content}</LockedOverlay>;
}

function KPI({ label, value }) {
  return (
    <div className="rounded-xl bg-white border p-4 text-center shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
