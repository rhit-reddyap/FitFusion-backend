// src/pages/AIPlans.jsx
import { useEffect, useMemo, useRef, useState } from "react";
// If you haven't created WeightQuickLog yet, comment this next line out temporarily.
// import WeightQuickLog from "../components/WeightQuickLog";

/* ---------- Storage Keys ---------- */
const CONVO_KEY   = "ff-coach-convo-v1";
const PLAN_KEY    = "ff-ai-plans-v1";
const PROFILE_KEY = "ff-user-profile-v1";
const FOOD_KEY    = "ff-food-logs-v1";   // { 'YYYY-MM-DD': [items...] }
const WEIGHT_KEY  = "ff-weight-log-v1";  // [{date:'YYYY-MM-DD', weight_kg:Number}]

/* ---------- Defaults ---------- */
const defaultProfile = {
  name: "Athlete",
  age: 21,
  sex: "male",
  height_cm: 178,
  weight_kg: 78,
  experience: "intermediate",
  equipment: "gym",
  goal: "recomposition",
};

const defaultPlan = {
  startedAt: new Date().toISOString().slice(0, 10),
  calories: 2600,
  macros: { protein: 180, carbs: 280, fat: 70 },
  training: {
    daysPerWeek: 4,
    focus: "hypertrophy",
    deload: false,
    template: [
      { day: "Upper A", blocks: ["Bench 5x5", "Row 4x8", "Incline DB 3x10", "Lat Pulldown 3x10"] },
      { day: "Lower A", blocks: ["Squat 5x5", "RDL 4x8", "Leg Press 3x12", "Calf 3x15"] },
      { day: "Upper B", blocks: ["OHP 5x5", "Pull-up 4xAMRAP", "Dip 3x10", "Cable Row 3x12"] },
      { day: "Lower B", blocks: ["Deadlift 3x5", "Front Squat 4x6", "Ham Curl 3x12", "Plank 3x45s"] },
    ],
  },
  periodization: { deloadEveryWeeks: 4 },
  sleep_target_h: 7.5,
  notes: "Auto-deload on high fatigue or every 4th week. Adjust calories based on weekly trends.",
};

/* ---------- Utils ---------- */
const safeJSON = (s, f) => { try { return JSON.parse(s) ?? f; } catch { return f; } };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const today = () => new Date().toISOString().slice(0, 10);

function daysSince(dateStr) {
  const d0 = new Date(dateStr);
  const d1 = new Date();
  return Math.floor((d1 - d0) / (1000 * 60 * 60 * 24));
}
function weekIndexFrom(startDate) {
  const d = daysSince(startDate || today());
  return Math.floor(d / 7) + 1;
}

/* ---------- Readers ---------- */
function readFood() { return safeJSON(localStorage.getItem(FOOD_KEY), {}); }
function readWeights() { return safeJSON(localStorage.getItem(WEIGHT_KEY), []); }
function writeWeights(arr) { localStorage.setItem(WEIGHT_KEY, JSON.stringify(arr)); }

function lastNDates(n) {
  const out = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.unshift(new Date(d).toISOString().slice(0, 10));
    d.setDate(d.getDate() - 1);
  }
  return out;
}
function sum(arr) { return arr.reduce((a, b) => a + (Number(b) || 0), 0); }

/* ---------- Series ---------- */
function caloriesSeries(foodObj, n = 14) {
  const keys = lastNDates(n);
  const vals = keys.map(k => {
    const items = Array.isArray(foodObj[k]) ? foodObj[k] : [];
    return items.reduce((t, it) => t + (Number(it.calories) || 0), 0);
  });
  return { keys, vals };
}
function weightSeries(weightsArr, n = 14) {
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
  return a.length ? (sum(a) / a.length) : 0;
}

/* ---------- Component ---------- */
export default function AIPlans() {
  const [convo, setConvo] = useState([
  { role: "assistant", text: "Hi! I’m your Fusion Fitness coach. How can I help today?", at: Date.now(), source: "system" }
]);
  const [plan, setPlan] = useState(() => safeJSON(localStorage.getItem(PLAN_KEY), defaultPlan));
  const [profile, setProfile] = useState(() => safeJSON(localStorage.getItem(PROFILE_KEY), defaultProfile));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef(null);

  const [foodObj, setFoodObj] = useState({});
  const [weights, setWeights] = useState([]);

  useEffect(() => localStorage.setItem(CONVO_KEY, JSON.stringify(convo)), [convo]);
  useEffect(() => localStorage.setItem(PLAN_KEY, JSON.stringify(plan)), [plan]);
  useEffect(() => localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)), [profile]);

  useEffect(() => {
    setFoodObj(readFood());
    setWeights(readWeights());
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [convo, busy]);
useEffect(() => {
  // Move any old visible conversation into an archive, then start fresh.
  const prev = safeJSON(localStorage.getItem(CONVO_KEY), []);
  if (Array.isArray(prev) && prev.length) {
    const ARCHIVE_KEY = "ff-coach-archive-v1"; // new archive bucket
    const archive = safeJSON(localStorage.getItem(ARCHIVE_KEY), []);
    archive.push({ archivedAt: Date.now(), convo: prev });
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
  }
  // Clear the active convo store so it doesn’t get reloaded next app open
  localStorage.removeItem(CONVO_KEY);
}, []);

  const cal14 = useMemo(() => caloriesSeries(foodObj, 14), [foodObj]);
  const w14 = useMemo(() => weightSeries(weights, 14), [weights]);

  const avg7cal = useMemo(() => avg(cal14.vals, 7), [cal14]);
  const avg14cal = useMemo(() => avg(cal14.vals, 14), [cal14]);
  const latestWeight = useMemo(
    () => w14.vals.filter(Number.isFinite).slice(-1)[0] ?? profile.weight_kg,
    [w14, profile.weight_kg]
  );

  /* Periodization */
  useEffect(() => {
    const week = weekIndexFrom(plan.startedAt || today());
    const every = plan.periodization?.deloadEveryWeeks ?? 4;
    const currentDeload = !!plan.training?.deload;
    const shouldDeloadThisWeek = (week % every === 0);
    if (shouldDeloadThisWeek !== currentDeload) {
      setPlan(p => ({ ...p, training: { ...(p.training || {}), deload: shouldDeloadThisWeek } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.startedAt, plan.periodization?.deloadEveryWeeks]);

  /* Auto nutrition tuning */
  useEffect(() => {
    const goal = (profile.goal || "recomposition");
    let adjust = 0;
    if (avg7cal && plan.calories) {
      const diff = (avg7cal - plan.calories) / plan.calories;
      if (diff < -0.12) adjust = -0.05;
      else if (diff > 0.12) adjust = 0.05;
    }
    const nonNull = w14.vals.filter(Number.isFinite);
    if (nonNull.length >= 4) {
      const w_now = nonNull[nonNull.length - 1];
      const w_then = nonNull[Math.max(0, nonNull.length - 8)];
      const delta = w_now - w_then;
      if (goal === "fat-loss" && delta >= 0.3) adjust = Math.min(adjust, -0.08);
      if (goal === "muscle-gain" && delta <= 0) adjust = Math.max(adjust, +0.08);
    }
    if (adjust !== 0) {
      setPlan(p => {
        const nextCals = clamp(Math.round((p.calories || 2400) * (1 + adjust)), 1500, 5000);
        const protein = Math.round((profile.weight_kg || 70) * 2.0);
        const kcalFromProtein = protein * 4;
        const rem = Math.max(0, nextCals - kcalFromProtein);
        const carbs = Math.round((rem * 0.55) / 4);
        const fat = Math.round((rem * 0.45) / 9);
        return { ...p, calories: nextCals, macros: { protein, carbs, fat } };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avg7cal, JSON.stringify(w14.vals), profile.goal, profile.weight_kg]);
function loadLatestArchivedChat() {
  const ARCHIVE_KEY = "ff-coach-archive-v1";
  const archive = safeJSON(localStorage.getItem(ARCHIVE_KEY), []);
  const last = archive[archive.length - 1];
  if (last?.convo?.length) {
    setConvo(last.convo);
  }
}

  /* Chat handling */
  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const nextConvo = [...convo, { role: "user", text, at: Date.now() }];
    setConvo(nextConvo);

    const wPatch = extractWeightFromText(text);
    if (wPatch) {
      const newLog = [...weights, wPatch];
      setWeights(newLog);
      writeWeights(newLog);
      setConvo(c => [...c, { role: "assistant", text: `Logged weight: ${wPatch.weight_kg.toFixed(1)} kg (${(wPatch.weight_kg * 2.20462).toFixed(1)} lb).`, at: Date.now(), source: "rules" }]);
      setProfile(p => ({ ...p, weight_kg: wPatch.weight_kg }));
    }

    const [ruleMsg, rulePatch] = applyLocalRules(text, plan, profile);
    if (ruleMsg) setConvo(c => [...c, { role: "assistant", text: ruleMsg, at: Date.now(), source: "rules" }]);
    if (Object.keys(rulePatch).length) setPlan(p => mergePatch(p, rulePatch));

    setBusy(true);
    try {
      const r = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextConvo, plan: { ...plan, ...rulePatch }, profile }),
      });
      if (!r.ok) throw new Error(`coach ${r.status}`);
      const data = await r.json();
      if (data?.text) setConvo(c => [...c, { role: "assistant", text: data.text, at: Date.now(), source: "llm" }]);
      if (data?.patch && Object.keys(data.patch).length) setPlan(p => mergePatch(p, data.patch));
    } catch {
      // stay local
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 grid lg:grid-cols-[1fr,420px] gap-6">
      {/* Chat */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Fusion Fitness — AI Coach</h1>
            <p className="text-slate-600 text-sm">Tell me how you slept, soreness, time, weight, or goals. I’ll adapt your plan.</p>
          </div>
          {/* Uncomment when WeightQuickLog exists */}
          {/* <WeightQuickLog onLogged={(entry) => {
            setWeights(prev => {
              const arr = [...prev];
              const i = arr.findIndex(x => x.date === entry.date);
              if (i >= 0) arr[i] = entry; else arr.push(entry);
              return arr;
            });
          }} /> */}
        </div>

        <div ref={scroller} className="flex-1 overflow-y-auto p-4 space-y-3">
          {convo.length === 0 && (
            <div className="text-sm text-slate-500">
              Try: “Slept 5h, low energy, only 30 minutes.” • “Cutting for 6 weeks.” • “Weight 181.6 lb today.”
            </div>
          )}
          {convo.map((m, i) => (
            <div key={i} className={`max-w-[80%] p-3 rounded-xl ${m.role === "user" ? "ml-auto bg-emerald-50 text-emerald-900" : "bg-slate-50 text-slate-900"}`}>
              <div className="text-sm whitespace-pre-wrap">{m.text}</div>
              {m.source && <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">{m.source}</div>}
            </div>
          ))}
          {busy && <div className="text-xs text-slate-500">Coach thinking…</div>}
        </div>

        <div className="p-3 border-t border-slate-200 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2"
            placeholder="e.g., Slept 6h, legs sore, 30 min • Weight 82.5 kg • Cutting for 4 weeks"
          />
          <button onClick={send} disabled={busy} className="rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold hover:bg-slate-800 disabled:opacity-50">
            Send
          </button>
        </div>
      </div>

      {/* Plan + Trends */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Current Plan</h2>
          <div className="text-sm text-slate-700">
            Week {weekIndexFrom(plan.startedAt || today())} • Deload every {(plan.periodization?.deloadEveryWeeks ?? 4)} weeks • {plan.training?.deload ? "Deload: YES" : "Deload: No"}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <KPI label="Calories" value={plan.calories} />
          <KPI label="Protein" value={`${plan.macros?.protein ?? 0} g`} />
          <KPI label="Carbs" value={`${plan.macros?.carbs ?? 0} g`} />
          <KPI label="Fat" value={`${plan.macros?.fat ?? 0} g`} />
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Calories (14 days)</div>
          <Sparkline data={cal14.vals} height={44} />
          <div className="text-xs text-slate-600 mt-1">7-day avg: <b>{Math.round(avg7cal)}</b> kcal • 14-day avg: <b>{Math.round(avg14cal)}</b> kcal</div>
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Weight (14 days)</div>
          <Sparkline data={w14.vals} height={44} />
          <div className="text-xs text-slate-600 mt-1">
            Latest: <b>{Number.isFinite(latestWeight) ? Number(latestWeight).toFixed(1) : "—"} kg</b> ({Number.isFinite(latestWeight) ? (Number(latestWeight) * 2.20462).toFixed(1) : "—"} lb)
          </div>
        </div>

        <div className="space-y-2">
          {(plan.training?.template || []).map((d, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-3">
              <div className="font-medium text-slate-900">{d.day}</div>
              <div className="text-sm text-slate-600">{(d.blocks || []).join(" · ")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Tiny UI helpers ---------- */
function KPI({ label, value }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-3 text-center shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-lg font-bold text-slate-900">{value}</div>
    </div>
  );
}
function Sparkline({ data = [], height = 40 }) {
  const w = 260;
  const h = height;
  const vals = data.map(v => (Number.isFinite(v) ? Number(v) : null));
  const finite = vals.filter(Number.isFinite);
  const min = finite.length ? Math.min(...finite) : 0;
  const max = finite.length ? Math.max(...finite) : 1;
  const pad = (max - min) * 0.1 || 1;
  const yMin = min - pad, yMax = max + pad;

  const pts = vals.map((v, i) => {
    const x = (i / Math.max(vals.length - 1, 1)) * (w - 8) + 4;
    const y = v == null ? null : h - ((v - yMin) / Math.max(yMax - yMin, 1)) * (h - 8) - 4;
    return { x, y };
  });

  const path = pts.reduce((acc, p, i) => {
    if (!p || p.y == null) return acc;
    return acc + (i === 0 || pts[i - 1].y == null ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`);
  }, "");

  return (
    <svg width={w} height={h} className="block">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* ---------- Local Rules ---------- */
function applyLocalRules(text, plan, profile) {
  const t = text.toLowerCase();

  const signals = {
    lowSleep: /slept\s*(\d+(\.\d+)?)\s*h/.test(t)
      ? Number(t.match(/slept\s*(\d+(\.\d+)?)/)[1]) < 6.5
      : /(bad|poor) sleep|slept 4|slept 5|slept 6h/.test(t),
    highSleep: /slept\s*(\d+(\.\d+)?)\s*h/.test(t)
      ? Number(t.match(/slept\s*(\d+(\.\d+)?)/)[1]) > 8
      : /(great|good) sleep|8h|9h/.test(t),
    verySore: /(very|extremely)\s*sore|can[’']?t walk|doms from hell/.test(t),
    sore: /\bsore\b|doms/.test(t),
    injured: /injur|sprain|strain|tendon|pain|hurt|doctor/.test(t),
    time30: /\b(20|25|30)\s*(min|minutes)\b/.test(t),
    time45: /\b(35|40|45)\s*(min|minutes)\b/.test(t),
    time60: /\b(50|60|70)\s*(min|minutes)\b/.test(t),
    cutting: /\b(cut|deficit|fat[- ]?loss)\b/.test(t),
    bulking: /\b(bulk|surplus|gain)\b/.test(t),
    hungry: /\bhungry|starv|low energy|craving/.test(t),
    lowEnergy: /\blow energy|tired|exhaust(ed)?|drained\b/.test(t),
    knee: /\bknee\b/.test(t),
    back: /\bback\b/.test(t),
    shoulder: /\bshoulder\b/.test(t),
  };

  const patch = { macros: {}, training: {} };
  const messages = [];

  if (signals.cutting) {
    patch.calories = clamp(Math.round((plan.calories || 2400) * 0.92), 1500, 5000);
    messages.push("Leaning into a small deficit for fat loss.");
  }
  if ((signals.bulking || (signals.hungry && !signals.cutting))) {
    patch.calories = clamp(Math.round((plan.calories || 2400) * 1.06), 1500, 5000);
    messages.push("Slight calorie bump to support recovery/gains.");
  }
  if (signals.lowEnergy && !signals.cutting) {
    patch.macros.carbs = clamp((plan.macros?.carbs || 250) + 25, 120, 700);
    messages.push("Adding carbs to address low energy.");
  }

  if (signals.lowSleep || signals.verySore) {
    patch.training.deload = true;
    patch.sleep_target_h = Math.max(plan.sleep_target_h || 7.5, 8);
    messages.push("Deloading and nudging sleep target up.");
  } else if (signals.highSleep && !signals.sore) {
    patch.training.deload = false;
  }

  if (signals.time30) {
    messages.push("Condensing to a 30-minute session.");
    patch.training.template = trimTodayTemplate(plan.training?.template, 2);
  } else if (signals.time45) {
    messages.push("Tight 45-minute session queued.");
    patch.training.template = trimTodayTemplate(plan.training?.template, 3);
  }

  if (signals.knee) {
    messages.push("Knee-friendly swaps for today.");
    patch.training.template = safeSwap(plan.training?.template, ["Squat", "Lunge"], ["Leg Press (short ROM)", "Hip Hinge", "Leg Ext light"]);
  }
  if (signals.back) {
    messages.push("Reducing spinal loading today.");
    patch.training.template = safeSwap(plan.training?.template, ["Deadlift", "Bent-over Row"], ["Chest-supported Row", "Leg Press", "Hip Thrust"]);
  }
  if (signals.shoulder) {
    messages.push("Avoiding deep overhead pressing.");
    patch.training.template = safeSwap(plan.training?.template, ["OHP", "Dip"], ["Landmine Press", "Cable Fly/Row"]);
  }

  const kg = profile.weight_kg || 78;
  const proteinTarget = Math.round(kg * 2.0);
  if (!plan.macros || Math.abs((plan.macros.protein || 0) - proteinTarget) > 10) {
    patch.macros.protein = proteinTarget;
  }

  const mergedPatch = normalizePatch(patch);
  const msg = messages.length ? messages.join(" ") + " I’ve updated your plan." : "Logged. I’ll adapt your plan as you go.";
  return [msg, mergedPatch];
}

function normalizePatch(p) {
  const out = {};
  if ("calories" in p) out.calories = p.calories;
  if ("sleep_target_h" in p) out.sleep_target_h = p.sleep_target_h;
  if (p.macros && Object.keys(p.macros).length) out.macros = p.macros;
  if (p.training) {
    const t = {};
    ["daysPerWeek", "focus", "deload", "template"].forEach(k => { if (k in p.training) t[k] = p.training[k]; });
    if (Object.keys(t).length) out.training = t;
  }
  return out;
}
function mergePatch(plan, patch) {
  const next = { ...plan };
  if ("calories" in patch) next.calories = patch.calories;
  if ("sleep_target_h" in patch) next.sleep_target_h = patch.sleep_target_h;
  if (patch.macros) next.macros = { ...(plan.macros || {}), ...patch.macros };
  if (patch.training) next.training = { ...(plan.training || {}), ...patch.training };
  return next;
}
function trimTodayTemplate(template = [], keepBlocks = 3) {
  if (!template.length) return template;
  const idx = 0;
  const copy = template.map(d => ({ ...d, blocks: [...(d.blocks || [])] }));
  copy[idx].blocks = copy[idx].blocks.slice(0, keepBlocks);
  return copy;
}
function safeSwap(template = [], findAny = [], replacePool = []) {
  if (!template.length) return template;
  const idx = 0;
  const copy = template.map(d => ({ ...d, blocks: [...(d.blocks || [])] }));
  copy[idx].blocks = copy[idx].blocks.map(b =>
    findAny.some(f => String(b).toLowerCase().includes(f.toLowerCase()))
      ? (replacePool[Math.floor(Math.random() * replacePool.length)] || b)
      : b
  );
  return copy;
}

/* ---------- Weight parsing ---------- */
function extractWeightFromText(text) {
  const t = text.toLowerCase();
  const m = t.match(/(?:weight|weigh|wt)\s*([0-9]+(?:\.[0-9]+)?)\s*(kg|kilograms|lb|lbs|pounds)?/);
  if (!m) return null;
  const num = Number(m[1]);
  const unit = (m[2] || "lb").toLowerCase();
  let kg = num;
  if (unit.startsWith("lb") || unit.startsWith("pound")) kg = num / 2.20462;
  kg = clamp(kg, 35, 250);
  return { date: today(), weight_kg: +kg.toFixed(1) };
}
