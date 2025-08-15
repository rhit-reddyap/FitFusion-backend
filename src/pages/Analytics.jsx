// src/pages/Analytics.jsx
import { useEffect, useMemo, useState } from "react";

/* Storage Keys */
const FOOD_KEY    = "ff-food-logs-v1";     // { 'YYYY-MM-DD': [{calories,...}] }
const WEIGHT_KEY  = "ff-weight-log-v1";    // [{date, weight_kg}]
const BURN_KEY    = "ff-burn-logs-v1";     // { 'YYYY-MM-DD': number }  (manual burn)
const WKOUT_KEY   = "ff-workouts-v1";      // [ { date:'YYYY-MM-DD', duration_s:number } ]
const PROFILE_KEY = "ff-user-profile-v1";  // { weight_kg, ... }

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

/* ---------- Sparkline (inline, safe) ---------- */
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

export default function Analytics() {
  const [food, setFood] = useState({});
  const [weights, setWeights] = useState([]);
  const [burn, setBurn] = useState({});
  const [burnInput, setBurnInput] = useState("");

  const [workouts, setWorkouts] = useState([]);
  const [profile, setProfile] = useState({});

  // Intensity for fallback (workout estimate); manual burns override this
  const [metLevel, setMetLevel] = useState("moderate"); // light | moderate | hard
  const MET = metLevel === "light" ? 3.5 : metLevel === "hard" ? 8 : 6;

  // Unit system toggle: "metric" (kg, cm) or "imperial" (lb, in)
  const [unitSystem, setUnitSystem] = useState("metric");
  const toggleUnitSystem = () => setUnitSystem(u => (u === "metric" ? "imperial" : "metric"));

  // conversions and display helpers
  const kgToLb = (kg) => kg * 2.20462;
  const cmToIn = (cm) => cm / 2.54;
  const formatWeight = (kg, digits = 1) => {
    if (!Number.isFinite(kg)) return "—";
    return unitSystem === "metric" ? `${kg.toFixed(digits)} kg` : `${kgToLb(kg).toFixed(digits)} lb`;
    };
  const formatWeightChange = (kgChange, digits = 2) => {
    if (!Number.isFinite(kgChange)) return "—";
    return unitSystem === "metric" ? `${kgChange.toFixed(digits)} kg` : `${kgToLb(kgChange).toFixed(digits)} lb`;
  };

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

  // Fallback burned from workouts if manual burn not provided
  const last7BurnedFromWorkouts = useMemo(() => {
    const kg = Number(profile?.weight_kg) || 75;
    const since = new Date(); since.setDate(since.getDate() - 6);
    const weekSessions = (Array.isArray(workouts) ? workouts : []).filter(w => new Date(w.date) >= since);
    let total = 0;
    for (const w of weekSessions) {
      const sec = Number(w.duration_s) || 0;
      total += MET * kg * (sec / 3600); // kcal = MET * kg * hours
    }
    return Math.round(total);
  }, [workouts, profile?.weight_kg, MET]);

  // Prefer manual burns; else fallback estimate
  const usedBurn = last7BurnedManual > 0 ? last7BurnedManual : last7BurnedFromWorkouts;
  const burnSource = last7BurnedManual > 0 ? "Manual (ff-burn-logs-v1)" : "Estimated from workouts (MET)";

  // Metabolism calc
  const net7 = last7Consumed - usedBurn;     // kcal
  const avgDailyNet = net7 / 7;              // kcal/day
  const estLbChange = net7 / 3500;           // lb
  const estKgChange = estLbChange * 0.45359237; // kg
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

  return (
    <div className="p-6 space-y-6">
      {/* Header + Unit toggle */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics — Fusion Fitness</h1>
          <p className="text-slate-600">Trends for your calories, weight, and weekly metabolism estimate.</p>
        </div>
        <button
          onClick={toggleUnitSystem}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm hover:bg-slate-50"
          title="Toggle unit system"
        >
          Units: {unitSystem === "metric" ? "Metric (kg, cm)" : "Imperial (lb, in)"}
        </button>
      </div>

      {/* ===== Weekly Metabolism Estimate ===== */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold text-slate-900">Weekly Metabolism Estimate</div>
          {/* Intensity only matters for fallback (workouts estimate) */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Intensity (fallback)</label>
            <select
              value={metLevel}
              onChange={(e)=>setMetLevel(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
              title="Used only when no manual burn is logged"
            >
              <option value="light">Light (MET ~ 3.5)</option>
              <option value="moderate">Moderate (MET ~ 6)</option>
              <option value="hard">Hard (MET ~ 8)</option>
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
          Burn source: <b>{burnSource}</b>. Projection uses <b>3500 kcal ≈ 1 lb</b>. Current weight:{" "}
          <b>{formatWeight(latestWeightKg)}</b>.
        </div>
      </section>

      {/* Quick burn entry (manual) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm text-slate-700">Enter today’s calories burned (manual):</div>
          <input
            type="number"
            min={0}
            value={burnInput}
            onChange={(e)=>setBurnInput(e.target.value)}
            className="w-28 rounded-xl border border-slate-300 px-3 py-2"
            placeholder="e.g., 600"
          />
          <button onClick={saveTodayBurn} className="rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold hover:bg-slate-800">
            Save
          </button>
          <div className="text-xs text-slate-500">Stored in <code>ff-burn-logs-v1</code>. Overrides fallback.</div>
        </div>
      </section>

      {/* Calories (28d) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Calories Consumed (28 days)</div>
        <Sparkline data={cal28.vals} />
        <div className="text-xs text-slate-600 mt-1">
          7-day avg: <b>{format(avg(cal28.vals,7))}</b> kcal • 28-day avg: <b>{format(avg(cal28.vals,28))}</b> kcal
        </div>
      </section>

      {/* Weight (28d) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Weight (28 days)</div>
        <Sparkline data={w28.vals} />
        <div className="text-xs text-slate-600 mt-1">
          Latest: <b>{formatWeight(latestWeightKg)}</b>
        </div>
      </section>
    </div>
  );
}

function KPI({ label, value }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
