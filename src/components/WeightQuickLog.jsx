// src/components/WeightQuickLog.jsx
import { useEffect, useMemo, useState } from "react";

const WEIGHT_KEY = "ff-weight-log-v1";
const PROFILE_KEY = "ff-user-profile-v1";

const today = () => new Date().toISOString().slice(0,10);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function WeightQuickLog({ onLogged }) {
  const [units, setUnits] = useState("lb"); // "lb" | "kg"
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const placeholder = useMemo(() => (units === "lb" ? "e.g., 181.6" : "e.g., 82.4"), [units]);

  const readWeights = () => {
    try { return JSON.parse(localStorage.getItem(WEIGHT_KEY)) || []; } catch { return []; }
  };
  const writeWeights = (arr) => localStorage.setItem(WEIGHT_KEY, JSON.stringify(arr));

  const writeProfileWeight = (kg) => {
    try {
      const p = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...p, weight_kg: kg }));
    } catch {}
  };

  const log = () => {
    const raw = Number(value);
    if (!Number.isFinite(raw) || raw <= 0) {
      setMsg("Enter a valid number.");
      return;
    }
    setSaving(true);
    const kg = units === "kg" ? raw : raw / 2.20462;
    const kgClamped = +clamp(kg, 35, 250).toFixed(1);
    const entry = { date: today(), weight_kg: kgClamped };

    const arr = readWeights();
    // overwrite today's entry if exists
    const i = arr.findIndex(x => x.date === entry.date);
    if (i >= 0) arr[i] = entry; else arr.push(entry);
    writeWeights(arr);
    writeProfileWeight(kgClamped);

    setMsg(`Saved: ${kgClamped.toFixed(1)} kg (${(kgClamped*2.20462).toFixed(1)} lb)`);
    setSaving(false);
    setValue("");
    onLogged?.(entry);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        step="0.1"
        inputMode="decimal"
        value={value}
        onChange={(e)=>setValue(e.target.value)}
        placeholder={placeholder}
        className="w-28 rounded-xl border border-slate-300 px-3 py-2"
      />
      <select
        value={units}
        onChange={(e)=>setUnits(e.target.value)}
        className="rounded-xl border border-slate-300 px-2 py-2"
      >
        <option value="lb">lb</option>
        <option value="kg">kg</option>
      </select>
      <button
        onClick={log}
        disabled={saving}
        className="rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold hover:bg-slate-800 disabled:opacity-50"
      >
        Log weight
      </button>
      {msg && <div className="text-xs text-slate-600">{msg}</div>}
    </div>
  );
}
