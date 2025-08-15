// src/pages/WorkoutTracker.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dumbbell,
  Play,
  Square,
  Plus,
  BookOpen,
  Timer,
  TrendingUp,
  X,
  Search,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  FolderOpen,
  Save,
  Upload,
  Download,
  CheckSquare,
  Edit3,
} from "lucide-react";

/* ----- Storage Keys ----- */
const EX_KEY  = "ff-exercise-lib-v1";      // [ { id, name, bodypart? } ]
const WK_KEY  = "ff-workouts-v1";          // [ workoutSession ]
const TPL_KEY = "ff-workout-templates-v1"; // [ workoutTemplate ]
const safeJSON = (s, f) => { try { return JSON.parse(s) ?? f; } catch { return f; } };

/* ----- Helpers ----- */
const todayKey = () => new Date().toISOString().slice(0,10);
const fmtSec = (s) => {
  s = Math.max(0, Math.round(Number(s)||0));
  const h = Math.floor(s/3600);
  const m = Math.floor((s%3600)/60);
  const ss = s%60;
  return h ? `${h}h ${m}m ${ss}s` : (m ? `${m}m ${ss}s` : `${ss}s`);
};
const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2,9);
const deepClone = (x) => JSON.parse(JSON.stringify(x));
const downloadBlob = (name, data, type="application/json") => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};

/* ----- Default Library ----- */
const DEFAULT_EXERCISES = [
  { id: "ex-bench", name: "Barbell Bench Press", bodypart: "Chest" },
  { id: "ex-squat", name: "Back Squat", bodypart: "Legs" },
  { id: "ex-dead",  name: "Deadlift", bodypart: "Back" },
  { id: "ex-ohp",   name: "Overhead Press", bodypart: "Shoulders" },
  { id: "ex-row",   name: "Barbell Row", bodypart: "Back" },
  { id: "ex-curl",  name: "Dumbbell Curl", bodypart: "Arms" },
];

/* ========================= PAGE ========================= */
export default function WorkoutTracker() {
  /* Library, Workouts, Templates */
  const [lib, setLib] = useState(() => safeJSON(localStorage.getItem(EX_KEY), DEFAULT_EXERCISES));
  const [workouts, setWorkouts] = useState(() => safeJSON(localStorage.getItem(WK_KEY), []));
  const [templates, setTemplates] = useState(() => safeJSON(localStorage.getItem(TPL_KEY), []));

  useEffect(() => localStorage.setItem(EX_KEY, JSON.stringify(lib)), [lib]);
  useEffect(() => localStorage.setItem(WK_KEY, JSON.stringify(workouts)), [workouts]);
  useEffect(() => localStorage.setItem(TPL_KEY, JSON.stringify(templates)), [templates]);

  /* Session state */
  const [active, setActive] = useState(null); // {id, date, startedAt, endedAt?, duration_s, items, followMode?}
  const [tick, setTick] = useState(0);
  const timerRef = useRef(null);

  // Start / Stop / Save
  const begin = () => {
    if (active) return;
    setActive({ id: `wk-${uid()}`, date: todayKey(), startedAt: now(), endedAt: null, duration_s: 0, items: [], followMode: false });
  };
  const stop = () => {
    if (!active) return;
    const dur = getElapsed(active);
    setActive({ ...active, endedAt: now(), duration_s: dur });
  };
  const save = () => {
    if (!active) return;
    const duration_s = active.endedAt ? active.duration_s : getElapsed(active);
    const volume_kg = totalVolume(active.items);
    const toSave = { ...active, duration_s, volume_kg };
    setWorkouts(prev => [...prev, toSave]);
    setActive(null);
  };

  // Manual duration override
  const setManualDuration = (sec) => {
    const s = Math.max(0, Math.round(Number(sec)||0));
    if (!active) {
      setActive({ id: `wk-${uid()}`, date: todayKey(), startedAt: null, endedAt: null, duration_s: s, items: [], followMode: false });
    } else {
      setActive({ ...active, duration_s: s, startedAt: null, endedAt: null });
    }
  };

  // Timer loop
  useEffect(() => {
    if (!active || active.endedAt || active.startedAt == null) return;
    timerRef.current = setInterval(() => setTick(t => t+1), 1000);
    return () => clearInterval(timerRef.current);
  }, [active?.id, active?.startedAt, active?.endedAt]);
  const elapsed = active ? (active.endedAt ? active.duration_s : getElapsed(active)) : 0;

  /* Weekly summary */
  const week = useMemo(() => summarizeWeek(workouts), [workouts]);

  /* History helpers */
  const removeWorkout = (id) => setWorkouts(ws => ws.filter(w => w.id !== id));
  const duplicateWorkout = (w) => {
    const items = (w.items || []).map(it => ({ id: `it-${uid()}`, name: it.name, sets: deepClone(it.sets || []) }));
    setActive({ id: `wk-${uid()}`, date: todayKey(), startedAt: now(), endedAt: null, duration_s: 0, items, followMode: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Templates */
  const startFromTemplate = (tpl, follow=false) => {
    const items = deepClone(tpl.items || []).map(it => ({
      ...it,
      id: `it-${uid()}`,
      sets: (it.sets || []).map(s => ({ ...s, completed: false })) // prep for follow mode
    }));
    setActive({ id: `wk-${uid()}`, date: todayKey(), startedAt: now(), endedAt: null, duration_s: 0, items, followMode: follow });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const deleteTemplate = (id) => setTemplates(ts => ts.filter(t => t.id !== id));
  const saveCurrentAsTemplate = (name) => {
    if (!active || !name?.trim()) return;
    const tpl = { id: `tpl-${uid()}`, name: name.trim(), items: deepClone(active.items || []).map(it => ({ ...it, sets: (it.sets||[]).map(({reps,weight})=>({reps,weight})) })) };
    setTemplates(prev => [...prev, tpl]);
  };

  /* Template editor UI state */
  const [tplEditor, setTplEditor] = useState(null); // {mode:'new'|'edit', data, idx?}
  const onCreateTemplate = () => setTplEditor({ mode: "new", data: { name: "", items: [] } });
  const onEditTemplate = (tpl, idx) => setTplEditor({ mode: "edit", data: deepClone(tpl), idx });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-rose-100 grid place-items-center">
            <Dumbbell className="h-5 w-5 text-rose-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Workout Tracker</h1>
            <p className="text-slate-600">Build templates, follow them, and track your sessions</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <LibraryButton lib={lib} setLib={setLib} />
          <button
            onClick={onCreateTemplate}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 hover:bg-slate-50"
          >
            <FolderPlus className="h-4 w-4" /> New Template
          </button>
          {!active ? (
            <button onClick={begin} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 font-semibold hover:bg-emerald-700">
              <Play className="h-4 w-4" /> Start Workout
            </button>
          ) : (
            <button onClick={stop} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 text-white px-4 py-2 font-semibold hover:bg-rose-700">
              <Square className="h-4 w-4" /> Stop Workout
            </button>
          )}
        </div>
      </div>

      {/* Ready / Timer card */}
      <section className={`rounded-3xl p-5 shadow-sm border ${active ? "bg-emerald-100 border-emerald-300" : "bg-emerald-600 text-white border-emerald-700"}`}>
        <div className="flex items-center gap-2">
          <Play className={`h-5 w-5 ${active ? "text-emerald-700" : "text-white"}`} />
          <h2 className={`text-xl font-semibold ${active ? "text-emerald-900" : "text-white"}`}>{active ? "Workout in Progress" : "Ready to Train?"}</h2>
        </div>
        <p className={`mt-1 ${active ? "text-emerald-800" : "text-emerald-100"}`}>
          {active ? (active.followMode ? "Follow Mode: tick sets as you complete them." : "Timer is running. Log your exercises and sets below.") : "Start a fresh session or launch a saved template."}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 ${active ? "bg-white text-emerald-700 border border-emerald-300" : "bg-emerald-500/30 text-white ring-1 ring-white/20"}`}>
            <Timer className="h-4 w-4" />
            <span className="font-semibold">{fmtSec(elapsed)}</span>
          </div>

          {/* Manual duration input */}
          <ManualTime onApply={(s) => setManualDuration(s)} />

          {active && (
            <button
              onClick={()=>setActive(a=>({ ...a, followMode: !a.followMode }))}
              className={`ml-auto rounded-xl px-4 py-2 font-semibold border ${active.followMode ? "border-slate-300 text-slate-800 bg-white" : "bg-slate-900 text-white hover:bg-slate-800"}`}
              title="Toggle Follow Mode (lock reps/weight)"
            >
              {active.followMode ? <Edit3 className="inline h-4 w-4 mr-2" /> : <CheckSquare className="inline h-4 w-4 mr-2" />}
              {active.followMode ? "Edit Mode" : "Follow Mode"}
            </button>
          )}

          {!active ? (
            <button onClick={begin} className="rounded-xl bg-white text-emerald-700 px-4 py-2 font-semibold hover:bg-emerald-50">Begin Workout</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={stop} className="rounded-xl bg-white text-emerald-700 px-4 py-2 font-semibold hover:bg-emerald-50">End Session</button>
              <button onClick={save} className="rounded-xl bg-emerald-700 text-white px-4 py-2 font-semibold hover:bg-emerald-800">Save Workout</button>
            </div>
          )}
        </div>
      </section>

      {/* Templates (with Export/Import) */}
      <TemplatesSection
        templates={templates}
        onStart={(t)=>startFromTemplate(t,false)}
        onStartFollow={(t)=>startFromTemplate(t,true)}
        onEdit={(t,idx)=>setTplEditor({mode:"edit", data: deepClone(t), idx})}
        onDelete={deleteTemplate}
        onExport={()=>downloadBlob(`fusion-templates-${todayKey()}.json`, JSON.stringify(templates, null, 2))}
        onImport={(arr)=> {
          const incoming = Array.isArray(arr) ? arr : [];
          // assign new ids to avoid collisions
          const withIds = incoming.map(t => ({ ...t, id: `tpl-${uid()}` }));
          setTemplates(prev => [...prev, ...withIds]);
        }}
      />

      {/* Session builder (respects follow mode) */}
      <SessionBuilder active={active} setActive={setActive} lib={lib} />

      {/* Save current as template */}
      <SaveAsTemplateBar active={active} onSave={saveCurrentAsTemplate} />

      {/* Weekly Summary */}
      <section className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900 font-semibold mb-3">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          <div className="text-lg">This Week</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Stat label="Workouts" value={week.count} />
          <Stat label="Total Volume" value={`${week.volume.toLocaleString()} kg`} />
          <Stat label="Avg Duration" value={week.count ? avgFmt(week.durations) : "—"} />
        </div>
      </section>

      {/* Workout History */}
      <History
        workouts={workouts}
        onDuplicate={duplicateWorkout}
        onDelete={removeWorkout}
      />

      {/* Template Editor Modal */}
      {tplEditor && (
        <TemplateEditor
          lib={lib}
          data={tplEditor.data}
          mode={tplEditor.mode}
          onCancel={() => setTplEditor(null)}
          onSave={(tpl) => {
            if (tplEditor.mode === "new") {
              setTemplates(prev => [...prev, { ...tpl, id: `tpl-${uid()}` }]);
            } else {
              setTemplates(prev => prev.map((t,i)=> i===tplEditor.idx ? tpl : t));
            }
            setTplEditor(null);
          }}
        />
      )}
    </div>
  );
}

/* ========================= tiny bits ========================= */
function avgFmt(arr) {
  const n = arr.length || 1;
  const s = Math.round(arr.reduce((a,b)=>a+b,0)/n);
  return fmtSec(s);
}
function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
function getElapsed(active) {
  if (!active?.startedAt) return Math.max(0, Number(active?.duration_s)||0);
  const end = active?.endedAt ?? now();
  return Math.max(0, Math.round((end - active.startedAt)/1000));
}
function setVolume(item) {
  return (item.sets||[]).reduce((t,s)=> t + (Number(s.reps)||0)*(Number(s.weight)||0), 0);
}
function totalVolume(items=[]) {
  return items.reduce((tv, ex) => tv + setVolume(ex), 0);
}
function summarizeWeek(workouts=[]) {
  const since = new Date(); since.setDate(since.getDate()-6);
  const week = workouts.filter(w => new Date(w.date) >= since);
  return {
    count: week.length,
    volume: Math.round(week.reduce((t,w)=>t+(Number(w.volume_kg)||totalVolume(w.items||[])),0)),
    durations: week.map(w => Number(w.duration_s)||0)
  };
}

/* ========================= Manual time ========================= */
function ManualTime({ onApply }) {
  const [h,setH] = useState(""); const [m,setM] = useState(""); const [s,setS] = useState("");
  const apply = () => {
    const HH = Math.max(0, Number(h)||0);
    const MM = Math.max(0, Number(m)||0);
    const SS = Math.max(0, Number(s)||0);
    onApply(HH*3600 + MM*60 + SS);
  };
  return (
    <div className="flex items-center gap-2">
      <input value={h} onChange={e=>setH(e.target.value)} placeholder="h" className="w-14 rounded-lg border border-slate-300 px-2 py-1 text-sm" />
      <input value={m} onChange={e=>setM(e.target.value)} placeholder="m" className="w-14 rounded-lg border border-slate-300 px-2 py-1 text-sm" />
      <input value={s} onChange={e=>setS(e.target.value)} placeholder="s" className="w-14 rounded-lg border border-slate-300 px-2 py-1 text-sm" />
      <button onClick={apply} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">Set Duration</button>
    </div>
  );
}

/* ========================= Library ========================= */
function LibraryButton({ lib, setLib }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={()=>setOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 font-semibold text-amber-800 hover:bg-amber-100">
        <Plus className="h-4 w-4" /> Exercise Library
      </button>
      {open && <LibraryModal lib={lib} setLib={setLib} onClose={()=>setOpen(false)} />}
    </>
  );
}

function LibraryModal({ lib, setLib, onClose }) {
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [part, setPart] = useState("");

  const filtered = lib.filter(x => x.name.toLowerCase().includes(q.toLowerCase()));

  const add = () => {
    const nm = name.trim();
    if (!nm) return;
    setLib(prev => [...prev, { id: `ex-${uid()}`, name: nm, bodypart: part.trim() || undefined }]);
    setName(""); setPart("");
  };

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-slate-700" />
            <div className="text-lg font-semibold">Exercise Library</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search exercises…" className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2" />
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto divide-y divide-slate-200 rounded-xl border border-slate-200">
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-slate-500">No matches.</div>
          ) : filtered.map(ex => (
            <div key={ex.id} className="p-3 text-sm">
              <div className="font-medium text-slate-900">{ex.name}</div>
              {ex.bodypart && <div className="text-xs text-slate-500">{ex.bodypart}</div>}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 p-3">
          <div className="text-sm font-semibold text-slate-800 mb-2">Create Exercise</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Exercise name" className="rounded-xl border border-slate-300 px-3 py-2" />
            <input value={part} onChange={e=>setPart(e.target.value)} placeholder="Body part (optional)" className="rounded-xl border border-slate-300 px-3 py-2" />
            <button onClick={add} className="rounded-xl bg-slate-900 text-white px-3 py-2 font-semibold hover:bg-slate-800">
              Add to Library
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 hover:bg-slate-50">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ========================= Session builder (Follow Mode aware) ========================= */
function SessionBuilder({ active, setActive, lib }) {
  if (!active) return null;

  const addExercise = (exName) => {
    const name = exName?.trim();
    if (!name) return;
    const newItem = { id: `it-${uid()}`, name, sets: [] };
    setActive(s => ({ ...s, items: [...s.items, newItem] }));
  };

  const updateItem = (id, updater) => {
    setActive(s => ({ ...s, items: s.items.map(it => it.id === id ? updater(it) : it) }));
  };

  const removeItem = (id) => {
    setActive(s => ({ ...s, items: s.items.filter(it => it.id !== id) }));
  };

  return (
    <section className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-slate-700" />
          <div className="text-lg font-semibold text-slate-900">
            Exercises (This Session){active.followMode ? " — Follow Mode" : ""}
          </div>
        </div>
        {!active.followMode && <ExercisePicker lib={lib} onPick={addExercise} />}
      </div>

      {active.items.length === 0 ? (
        <div className="text-sm text-slate-500">No exercises yet. {active.followMode ? "Start from a template to populate." : "Use “Add Exercise” to start."}</div>
      ) : (
        <div className="space-y-3">
          {active.items.map((it) => (
            <ExerciseCard
              key={it.id}
              item={it}
              followMode={!!active.followMode}
              onChange={(next) => updateItem(it.id, () => next)}
              onRemove={() => removeItem(it.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ExercisePicker({ lib, onPick }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const matches = useMemo(() =>
    lib.filter(e => e.name.toLowerCase().includes(q.toLowerCase())).slice(0,10), [lib, q]);

  const add = (name) => { onPick(name); setOpen(false); setQ(""); };

  return (
    <>
      <button onClick={()=>setOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 hover:bg-slate-50">
        <Plus className="h-4 w-4" /> Add Exercise
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-slate-700" />
                <div className="text-lg font-semibold">Add Exercise</div>
              </div>
              <button onClick={()=>setOpen(false)} className="rounded-lg p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>

            <input
              value={q}
              onChange={e=>setQ(e.target.value)}
              placeholder="Search or type a new exercise…"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />

            <div className="mt-3 max-h-60 overflow-y-auto divide-y divide-slate-200 rounded-xl border border-slate-200">
              {matches.length === 0 ? (
                <div className="p-3 text-sm text-slate-500">No matches.</div>
              ) : matches.map(m => (
                <button key={m.id} onClick={()=>add(m.name)} className="w-full text-left p-3 hover:bg-slate-50">
                  <div className="font-medium text-slate-900">{m.name}</div>
                  {m.bodypart && <div className="text-xs text-slate-500">{m.bodypart}</div>}
                </button>
              ))}
            </div>

            <div className="mt-3 flex justify-between">
              <button onClick={()=>add(q)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-3 py-2 font-semibold hover:bg-slate-800">
                <Plus className="h-4 w-4" /> Create “{q || "exercise"}”
              </button>
              <button onClick={()=>setOpen(false)} className="rounded-xl border border-slate-300 px-3 py-2 hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ExerciseCard({ item, onChange, onRemove, followMode }) {
  const addSet = () => onChange({ ...item, sets: [...(item.sets||[]), { reps: "", weight: "" }] });
  const updateSet = (i, field, val) => {
    const sets = (item.sets||[]).map((s,idx)=> idx===i ? { ...s, [field]: val } : s);
    onChange({ ...item, sets });
  };
  const removeSet = (i) => onChange({ ...item, sets: (item.sets||[]).filter((_,idx)=>idx!==i) });

  const toggleDone = (i) => {
    if (!followMode) return;
    const sets = (item.sets||[]).map((s,idx)=> idx===i ? { ...s, completed: !s.completed } : s);
    onChange({ ...item, sets });
  };

  const vol = setVolume(item);

  return (
    <div className={`rounded-xl border border-slate-200 p-4 ${followMode ? "bg-slate-50" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-slate-900">{item.name}</div>
        {!followMode && (
          <button onClick={onRemove} className="text-slate-500 hover:text-slate-700 text-sm">Remove</button>
        )}
      </div>

      {(item.sets||[]).length === 0 && !followMode ? (
        <div className="text-sm text-slate-500 mb-2">No sets yet.</div>
      ) : (
        <div className="space-y-2 mb-2">
          {(item.sets||[]).map((s, i) => (
            <div key={i} className={`grid ${followMode ? "grid-cols-[auto,1fr,1fr]" : "grid-cols-[1fr,1fr,auto]"} gap-2 items-center`}>
              {followMode ? (
                <>
                  <input type="checkbox" checked={!!s.completed} onChange={()=>toggleDone(i)} className="h-5 w-5 accent-emerald-600" />
                  <div className={`rounded-lg border px-2 py-1 text-sm ${s.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                    Reps: {s.reps ?? "-"}
                  </div>
                  <div className={`rounded-lg border px-2 py-1 text-sm ${s.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                    Weight: {s.weight ?? "-"} kg
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    min={0}
                    value={s.reps ?? ""}
                    onChange={e=>updateSet(i,"reps",e.target.value)}
                    placeholder="Reps"
                    className="rounded-lg border border-slate-300 px-2 py-1"
                  />
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    value={s.weight ?? ""}
                    onChange={e=>updateSet(i,"weight",e.target.value)}
                    placeholder="Weight (kg)"
                    className="rounded-lg border border-slate-300 px-2 py-1"
                  />
                  <button onClick={()=>removeSet(i)} className="text-slate-500 hover:text-slate-700 text-sm px-2">Remove</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {!followMode && (
        <div className="flex items-center justify-between">
          <button onClick={addSet} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-1.5 hover:bg-slate-50">
            <Plus className="h-4 w-4" /> Add Set
          </button>
          <div className="text-sm text-slate-600">Volume: <span className="font-medium text-slate-900">{vol}</span> kg</div>
        </div>
      )}
      {followMode && (
        <div className="text-sm text-slate-600 text-right">Planned volume: <span className="font-medium text-slate-900">{vol}</span> kg</div>
      )}
    </div>
  );
}

/* ========================= Templates section (Export/Import) ========================= */
function TemplatesSection({ templates, onStart, onStartFollow, onEdit, onDelete, onExport, onImport }) {
  const fileRef = useRef(null);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arr = JSON.parse(String(reader.result || "[]"));
        onImport(arr);
      } catch {
        alert("Could not parse templates JSON.");
      }
    };
    reader.readAsText(f);
    e.target.value = "";
  };

  return (
    <section className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <FolderOpen className="h-5 w-5 text-violet-600" />
          <div className="text-lg">Workout Templates</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onExport} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={()=>fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
            <Upload className="h-4 w-4" /> Import
          </button>
          <input ref={fileRef} type="file" accept="application/json" onChange={onFile} className="hidden" />
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-sm text-slate-500">No templates yet. Create one with “New Template”.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {templates.map((t, idx) => (
            <div key={t.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900">{t.name}</div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>onEdit(t, idx)} className="rounded-lg border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50">Edit</button>
                  <button onClick={()=>onStart(t)} className="rounded-lg bg-slate-900 text-white px-2 py-1 text-sm hover:bg-slate-800">Start</button>
                  <button onClick={()=>onStartFollow(t)} className="rounded-lg bg-emerald-600 text-white px-2 py-1 text-sm hover:bg-emerald-700">Follow</button>
                  <button onClick={()=>onDelete(t.id)} className="rounded-lg border border-rose-200 text-rose-700 px-2 py-1 text-sm hover:bg-rose-50">Delete</button>
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {(t.items || []).map(it => it.name).join(" · ") || "No exercises"}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ========================= Save current as template ========================= */
function SaveAsTemplateBar({ active, onSave }) {
  const [name, setName] = useState("");
  if (!active || (active.items||[]).length === 0) return null;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Save className="h-5 w-5 text-slate-700" />
        <div className="font-semibold text-slate-900">Save this session as a template</div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder='e.g., "Chest Day"'
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2"
        />
        <button
          onClick={()=>{ if (name.trim()) { onSave(name.trim()); setName(""); } }}
          className="rounded-xl bg-slate-900 text-white px-3 py-2 font-semibold hover:bg-slate-800"
        >
          Save Template
        </button>
      </div>
      <div className="mt-1 text-xs text-slate-500">Templates store exercises with their sets, reps, and weights.</div>
    </div>
  );
}

/* ========================= Template editor ========================= */
function TemplateEditor({ lib, data, mode="new", onCancel, onSave }) {
  const [tpl, setTpl] = useState(() => data || { name: "", items: [] });

  const addExercise = (name) => {
    name = (name||"").trim();
    if (!name) return;
    setTpl(t => ({ ...t, items: [...(t.items||[]), { id: `ti-${uid()}`, name, sets: [] }] }));
  };
  const removeExercise = (id) => setTpl(t => ({ ...t, items: t.items.filter(it => it.id !== id) }));
  const updateExercise = (id, updater) => {
    setTpl(t => ({ ...t, items: t.items.map(it => it.id===id ? updater(it) : it) }));
  };

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-slate-700" />
            <div className="text-lg font-semibold">{mode === "new" ? "New Workout Template" : "Edit Template"}</div>
          </div>
          <button onClick={onCancel} className="rounded-lg p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <input
          value={tpl.name}
          onChange={e=>setTpl({...tpl, name: e.target.value})}
          placeholder='Template name e.g., "Chest Day"'
          className="w-full rounded-xl border border-slate-300 px-3 py-2 mb-3"
        />

        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-800">Exercises</div>
          <ExercisePicker lib={lib} onPick={addExercise} />
        </div>

        {(tpl.items||[]).length === 0 ? (
          <div className="text-sm text-slate-500">No exercises yet. Add one to begin.</div>
        ) : (
          <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
            {tpl.items.map((it) => (
              <TemplateExerciseCard
                key={it.id}
                item={it}
                onChange={(next)=>updateExercise(it.id, ()=>next)}
                onRemove={()=>removeExercise(it.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-xl border border-slate-300 px-4 py-2 hover:bg-slate-50">Cancel</button>
          <button
            onClick={()=> tpl.name.trim() && onSave({ ...tpl, name: tpl.name.trim() })}
            className="rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold hover:bg-slate-800"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateExerciseCard({ item, onChange, onRemove }) {
  const [bulkReps, setBulkReps] = useState("");
  const [bulkWt, setBulkWt]   = useState("");

  const addSet = () => onChange({ ...item, sets: [...(item.sets||[]), { reps: "", weight: "" }] });
  const setCount = (n) => {
    n = Math.max(0, Math.round(Number(n)||0));
    const cur = item.sets || [];
    const next = [...cur];
    if (n > cur.length) {
      for (let i=cur.length;i<n;i++) next.push({ reps: bulkReps || "", weight: bulkWt || "" });
    } else {
      next.length = n;
    }
    onChange({ ...item, sets: next });
  };
  const updateSet = (i, field, val) => {
    const sets = (item.sets||[]).map((s,idx)=> idx===i ? { ...s, [field]: val } : s);
    onChange({ ...item, sets });
  };
  const applyBulk = () => {
    const sets = (item.sets||[]).map(s => ({ reps: bulkReps || s.reps, weight: bulkWt || s.weight }));
    onChange({ ...item, sets });
  };

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-slate-900">{item.name}</div>
        <button onClick={onRemove} className="text-slate-500 hover:text-slate-700 text-sm">Remove</button>
      </div>

      <div className="mb-3 grid grid-cols-1 md:grid-cols-[120px,120px,120px,auto] gap-2 items-end">
        <div>
          <label className="text-xs text-slate-500"># Sets</label>
          <input
            type="number"
            min={0}
            value={item.sets?.length || 0}
            onChange={(e)=>setCount(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-2 py-1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Bulk Reps</label>
          <input
            type="number"
            min={0}
            value={bulkReps}
            onChange={(e)=>setBulkReps(e.target.value)}
            placeholder="e.g. 8"
            className="w-full rounded-lg border border-slate-300 px-2 py-1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Bulk Weight (kg)</label>
          <input
            type="number"
            step="0.5"
            min={0}
            value={bulkWt}
            onChange={(e)=>setBulkWt(e.target.value)}
            placeholder="e.g. 60"
            className="w-full rounded-lg border border-slate-300 px-2 py-1"
          />
        </div>
        <button onClick={applyBulk} className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50">Apply to Sets</button>
      </div>

      {(item.sets||[]).length === 0 ? (
        <div className="text-sm text-slate-500">No sets yet — set a number above.</div>
      ) : (
        <div className="space-y-2">
          {item.sets.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr,1fr] md:grid-cols-[1fr,1fr,auto] gap-2 items-center">
              <input
                type="number"
                min={0}
                value={s.reps}
                onChange={e=>updateSet(i,"reps",e.target.value)}
                placeholder={`Set ${i+1} reps`}
                className="rounded-lg border border-slate-300 px-2 py-1"
              />
              <input
                type="number"
                step="0.5"
                min={0}
                value={s.weight}
                onChange={e=>updateSet(i,"weight",e.target.value)}
                placeholder="Weight (kg)"
                className="rounded-lg border border-slate-300 px-2 py-1"
              />
              <div className="text-sm text-slate-500 hidden md:block">Set {i+1}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========================= History ========================= */
function History({ workouts, onDuplicate, onDelete }) {
  if (!workouts?.length) return null;

  const sorted = [...workouts].sort((a,b) => {
    const ta = new Date(`${a.date}T00:00:00`).getTime() + (a.endedAt || a.startedAt || 0);
    const tb = new Date(`${b.date}T00:00:00`).getTime() + (b.endedAt || b.startedAt || 0);
    return tb - ta;
  });

  return (
    <section className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className="text-lg font-semibold text-slate-900 mb-3">Workout History</div>

      <div className="space-y-3">
        {sorted.map((w) => (
          <HistoryItem
            key={w.id}
            w={w}
            onDuplicate={() => onDuplicate(w)}
            onDelete={() => onDelete(w.id)}
          />
        ))}
      </div>
    </section>
  );
}

function HistoryItem({ w, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false);
  const dur = Number(w.duration_s)||0;
  const vol = Number(w.volume_kg)||totalVolume(w.items||[]);

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <button onClick={()=>setOpen(o=>!o)} className="flex items-center gap-2 text-left">
          {open ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
          <div className="font-semibold text-slate-900">{w.date || "Session"}</div>
          <div className="text-sm text-slate-500">• {fmtSec(dur)} • {vol.toLocaleString()} kg</div>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onDuplicate} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50">
            <Copy className="h-4 w-4" /> Duplicate
          </button>
          <button onClick={onDelete} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 text-rose-700 px-2 py-1 text-sm hover:bg-rose-50">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          {(w.items || []).map((it, idx) => {
            const v = setVolume(it);
            return (
              <div key={idx} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-900">{it.name}</div>
                  <div className="text-sm text-slate-600">{v} kg</div>
                </div>
                {it.sets?.length ? (
                  <div className="mt-2 grid gap-1 text-sm text-slate-600">
                    {it.sets.map((s, i) => (
                      <div key={i}>
                        Set {i+1}: {s.reps} reps @ {s.weight} kg
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-1 text-sm text-slate-500">No sets recorded.</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
