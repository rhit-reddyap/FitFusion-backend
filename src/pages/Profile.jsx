// src/pages/Profile.jsx
import { useEffect, useState, useMemo } from "react";
import { User, Settings, Ruler, Weight, Target, BadgeCheck } from "lucide-react";

const PROFILE_KEY = "ff-user-profile-v1";
const safeJSON = (s, f) => { try { return JSON.parse(s) ?? f; } catch { return f; } };

export default function Profile() {
  const [profile, setProfile] = useState(() => safeJSON(localStorage.getItem(PROFILE_KEY), defaultProfile()));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  // keep draft in sync if profile changes externally
  useEffect(() => setDraft(profile), [profile]);

  // react to changes from other tabs/pages (Analytics page editor, etc.)
  useEffect(() => {
    const onStorage = () => setProfile(safeJSON(localStorage.getItem(PROFILE_KEY), defaultProfile()));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const save = () => {
    const cleaned = {
      ...profile,
      ...draft,
      age: numOr(draft.age, 21),
      height_cm: numOr(draft.height_cm, 178),
      weight_kg: numOr(draft.weight_kg, 78),
    };
    setProfile(cleaned);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(cleaned));
    setEditing(false);
  };

  // simple derived metrics
  const { bmi, height_m } = useMemo(() => {
    const m = (Number(profile.height_cm) || 0) / 100;
    const kg = Number(profile.weight_kg) || 0;
    return { height_m: m, bmi: m > 0 ? +(kg / (m * m)).toFixed(1) : null };
  }, [profile.height_cm, profile.weight_kg]);

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-sky-100 grid place-items-center">
          <User className="h-5 w-5 text-sky-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-600">Edit your personal details used across Fusion Fitness.</p>
        </div>
      </header>

      {/* Quick summary card */}
      <section className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <KPI label="Name" value={profile.name} icon={<BadgeCheck className="h-4 w-4" />} />
          <KPI label="Height" value={`${profile.height_cm} cm`} icon={<Ruler className="h-4 w-4" />} />
          <KPI label="Weight" value={`${profile.weight_kg} kg`} icon={<Weight className="h-4 w-4" />} />
          <KPI label="BMI" value={bmi ?? "—"} />
        </div>
      </section>

      {/* Editable profile card */}
      <section className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-slate-700" />
            <div className="text-lg font-semibold text-slate-900">Personal Info</div>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              <Settings className="h-4 w-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setDraft(profile); setEditing(false); }}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="rounded-xl bg-slate-900 text-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-800"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {!editing ? (
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <FieldView label="Name" value={profile.name} />
            <FieldView label="Age" value={profile.age} />
            <FieldView label="Sex" value={profile.sex} />
            <FieldView label="Height" value={`${profile.height_cm} cm`} />
            <FieldView label="Weight" value={`${profile.weight_kg} kg`} />
            <FieldView label="Goal" value={profile.goal} />
            <FieldView label="Experience" value={profile.experience} />
            <FieldView label="Equipment" value={profile.equipment} />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-3">
            <FieldEdit label="Name" value={draft.name} onChange={(v)=>setDraft(d=>({...d, name:v}))} />
            <FieldEdit label="Age" type="number" value={draft.age} onChange={(v)=>setDraft(d=>({...d, age:v}))} />
            <FieldEdit label="Sex" value={draft.sex} onChange={(v)=>setDraft(d=>({...d, sex:v}))} />
            <FieldEdit label="Height (cm)" type="number" value={draft.height_cm} onChange={(v)=>setDraft(d=>({...d, height_cm:v}))} />
            <FieldEdit label="Weight (kg)" type="number" value={draft.weight_kg} onChange={(v)=>setDraft(d=>({...d, weight_kg:v}))} />
            <FieldEdit label="Goal" value={draft.goal} onChange={(v)=>setDraft(d=>({...d, goal:v}))} />
            <FieldEdit label="Experience" value={draft.experience} onChange={(v)=>setDraft(d=>({...d, experience:v}))} />
            <FieldEdit label="Equipment" value={draft.equipment} onChange={(v)=>setDraft(d=>({...d, equipment:v}))} />
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------- small UI bits ------------- */
function KPI({ label, value, icon }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500 flex items-center gap-2">
        {icon} {label}
      </div>
      <div className="text-xl font-bold text-slate-900">{String(value ?? "—")}</div>
    </div>
  );
}
function FieldView({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-slate-900 font-medium">{String(value ?? "—")}</div>
    </div>
  );
}
function FieldEdit({ label, value, onChange, type="text" }) {
  return (
    <label className="rounded-xl border border-slate-200 p-3 block">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">{label}</div>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2"
      />
    </label>
  );
}

/* ------------- helpers ------------- */
function defaultProfile() {
  return {
    name: "Athlete",
    age: 21,
    sex: "male",
    height_cm: 178,
    weight_kg: 78,
    experience: "intermediate",
    equipment: "gym",
    goal: "recomposition",
  };
}
function numOr(v, d) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}
