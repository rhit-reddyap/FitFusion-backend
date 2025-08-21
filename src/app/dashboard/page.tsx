
import { useEffect, useMemo, useState } from "react";
import { Flame, Droplets, Activity, Plus, Sparkles } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Line, LineChart, Legend } from "recharts";
import { format, subDays } from "date-fns";

const FOOD_KEY = "ff-food-logs-v1";
const WORKOUT_KEY = "ff-workout-logs-v1";
const WEIGHT_KEY = "ff-weight-log-v1";
const BURN_KEY = "ff-burn-logs-v1";
const UNITS_KEY = "ff-units-v1";

const safeJSON = (s, f) => { try { return JSON.parse(s) ?? f; } catch { return f; } };
const todayKey = () => new Date().toISOString().slice(0,10);
const sum = (arr, fn) => arr.reduce((a, x) => a + (fn ? fn(x) : Number(x)||0), 0);

export default function Dashboard() {
  const [units, setUnits] = useState(() => safeJSON(localStorage.getItem(UNITS_KEY), { mass: "lb", length: "in" }));
  const [food, setFood] = useState(() => safeJSON(localStorage.getItem(FOOD_KEY), {}));
  const [workouts, setWorkouts] = useState(() => safeJSON(localStorage.getItem(WORKOUT_KEY), {}));
  const [weights, setWeights] = useState(() => safeJSON(localStorage.getItem(WEIGHT_KEY), []));
  const [burn, setBurn] = useState(() => safeJSON(localStorage.getItem(BURN_KEY), {}));
  const day = todayKey();

  useEffect(() => {
    const write = () => {
      localStorage.setItem(UNITS_KEY, JSON.stringify(units));
    };
    write();
  }, [units]);

  const foodToday = food[day] || [];
  const cIn = sum(foodToday, (x) => x.calories || 0);
  const pToday = sum(foodToday, (x) => x.protein || 0);

  const burnToday = Number(burn[day] || 0);
  const volToday = sum(workouts[day] || [], (x) => x.volume || (x.sets||0)*(x.reps||0)*(x.weight||0));

  // 7-day arrays
  const week = [...Array(7)].map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const key = d.toISOString().slice(0,10);
    const fin = sum(food[key] || [], (x) => x.calories || 0);
    const fout = Number(burn[key] || 0);
    const w = findNearestWeight(weights, key);
    return { key, label: format(d, "EEE"), in: fin, out: fout, weight: w };
  });

  const netAvg = useMemo(() => {
    const nets = week.map(d => (d.in || 0) - (d.out || 0));
    return Math.round((sum(nets) / (nets.length || 1)) || 0);
  }, [food, burn]);

  const predicted = units.mass === "kg"
    ? `${(netAvg * 7 / 7700).toFixed(2)} kg/wk`
    : `${(netAvg * 7 / 3500).toFixed(2)} lb/wk`;

  const proteinTarget = 160; // could pull from Profile
  const calorieGoal = 2400;  // could pull from Profile
  const ringPct = Math.min(cIn / calorieGoal, 1);

  return (
    <div className="container vstack">
      {/* Header */}
      <div className="header-row">
        <div className="vstack" style={{gap: 4}}>
          <div className="title">Hi 👋</div>
          <div className="badge">7‑day log streak 🔥</div>
        </div>
        <div className="hstack">
          <button className="btn" onClick={() => setUnits(u => ({...u, mass: u.mass === "lb" ? "kg" : "lb"}))}>
            {units.mass.toUpperCase()}
          </button>
          <button className="btn">{/* Theme toggle placeholder */}Dark</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="card vstack">
          <div className="small">Calories Today</div>
          <div className="hstack" style={{justifyContent:"space-between"}}>
            <div style={{fontSize: 22, fontWeight: 800}}>{cIn}</div>
            <div className="badge"><Flame size={16}/> Goal {calorieGoal}</div>
          </div>
          <div className="small">Consumed vs Goal</div>
          <div style={{height: 8, background: "#1b2440", borderRadius: 999}}>
            <div style={{width: `${ringPct*100}%`, height: 8, borderRadius: 999, background: "var(--primary)"}} />
          </div>
        </div>

        <div className="card vstack">
          <div className="small">Protein</div>
          <div className="hstack" style={{justifyContent:"space-between"}}>
            <div style={{fontSize: 22, fontWeight: 800}}>{pToday} g</div>
            <div className="badge">Target {proteinTarget} g</div>
          </div>
          <div className="small">Today’s intake</div>
        </div>

        <div className="card vstack">
          <div className="small">Workout Volume</div>
          <div className="hstack" style={{justifyContent:"space-between"}}>
            <div style={{fontSize: 22, fontWeight: 800}}>
              {formatVolume(volToday, units.mass)}
            </div>
            <div className="badge"><Activity size={16}/> Today</div>
          </div>
          <div className="small">All lifts</div>
        </div>

        <div className="card vstack">
          <div className="small">Hydration</div>
          <div className="hstack" style={{justifyContent:"space-between"}}>
            <div style={{fontSize: 22, fontWeight: 800}}>—</div>
            <div className="badge"><Droplets size={16}/> Connect</div>
          </div>
          <div className="small">Daily progress</div>
        </div>
      </div>

      {/* Weekly Metabolism */}
      <div className="card vstack">
        <div className="hstack" style={{justifyContent:"space-between"}}>
          <div className="title">Weekly Metabolism</div>
          <div className="badge">Net avg: {netAvg} kcal • Pred: {predicted}</div>
        </div>
        <div style={{width: "100%", height: 220}}>
          <ResponsiveContainer>
            <BarChart data={week}>
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background:"#0e1427", border:"1px solid #1b2440", borderRadius:12 }} />
              <Legend />
              <Bar dataKey="in" name="Calories In" />
              <Bar dataKey="out" name="Calories Out" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{width: "100%", height: 120}}>
          <ResponsiveContainer>
            <LineChart data={week}>
              <XAxis dataKey="label" hide />
              <YAxis hide />
              <Tooltip contentStyle={{ background:"#0e1427", border:"1px solid #1b2440", borderRadius:12 }} />
              <Line type="monotone" dataKey="weight" name="Weight" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick actions */}
      <div className="hstack" style={{gap: 8}}>
        <a href="/food" className="btn btn-primary"><Plus size={18}/> Log Food</a>
        <a href="/workout" className="btn"><Plus size={18}/> Log Workout</a>
        <a href="/ai" className="btn"><Sparkles size={18}/> AI Plan</a>
      </div>
    </div>
  );
}

function formatVolume(v, massUnit) {
  if (!v) return "0";
  const n = Number(v) || 0;
  // v is in kg*reps by your log; treat as mass-based summary
  if (massUnit === "lb") return `${Math.round(n*2.20462).toLocaleString()} lb·reps`;
  return `${Math.round(n).toLocaleString()} kg·reps`;
}

function findNearestWeight(list, key) {
  // list: [{date, weight_kg}]
  if (!Array.isArray(list) || !list.length) return null;
  // exact
  const ex = list.find(x => x.date === key);
  if (ex) return ex.weight_kg;
  // nearest in past
  const past = list.filter(x => x.date <= key).sort((a,b)=> b.date.localeCompare(a.date))[0];
  return past ? past.weight_kg : null;
}
