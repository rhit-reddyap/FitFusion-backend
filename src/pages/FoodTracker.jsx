import { useEffect, useMemo, useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Search, Plus, Trash2 } from "lucide-react"

const STORAGE_KEY = "ff-food-logs-v1"

function useFoodLogs(dateKey) {
  const [logs, setLogs] = useState(() => {
    // localStorage only on client
    if (typeof window === "undefined") return {}
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  })
  const day = logs[dateKey] || []

  const save = (nextDay) => {
    const next = { ...logs, [dateKey]: nextDay }
    setLogs(next)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }
  }

  const add = (entry) => save([...day, entry])
  const remove = (idx) => {
    const copy = [...day]
    copy.splice(idx, 1)
    save(copy)
  }

  return { day, add, remove }
}

// --- Helpers to read either API shape ---
// 1) Your current API:   food.nutriments.{calories_per_100g, protein_per_100g, ...}
// 2) Upgraded API:       food.nutriments_per_100g.{calories, protein, carbs, fat, ...}
function getPer100g(food) {
  const n1 = food?.nutriments || null
  const n2 = food?.nutriments_per_100g || null

  if (n2) {
    return {
      calories: Number(n2.calories) || 0,
      protein: Number(n2.protein) || 0,
      carbs: Number(n2.carbs) || 0,
      fat: Number(n2.fat) || 0,
    }
  }

  return {
    calories: Number(n1?.calories_per_100g) || 0,
    protein: Number(n1?.protein_per_100g) || 0,
    carbs: Number(n1?.carbs_per_100g) || 0,
    fat: Number(n1?.fat_per_100g) || 0,
  }
}

function gramsToNutrition(food, grams) {
  const g = Math.max(0, Number(grams) || 0)
  const per100 = getPer100g(food)
  const m = g / 100
  return {
    calories: Math.round(per100.calories * m),
    protein: +(per100.protein * m).toFixed(1),
    carbs: +(per100.carbs * m).toFixed(1),
    fat: +(per100.fat * m).toFixed(1),
  }
}

export default function FoodTracker() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const { day, add, remove } = useFoodLogs(date)
  const [q, setQ] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [grams, setGrams] = useState(100)

  const totals = useMemo(() => {
    return day.reduce(
      (t, it) => ({
        calories: t.calories + (Number(it.calories) || 0),
        protein: t.protein + (Number(it.protein) || 0),
        carbs: t.carbs + (Number(it.carbs) || 0),
        fat: t.fat + (Number(it.fat) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }, [day])

  const search = async () => {
    const term = q.trim()
    if (!term) return
    setLoading(true)
    try {
      const r = await fetch(`/api/foods?q=${encodeURIComponent(term)}`)
      const data = await r.json()
      setResults(data.items || [])
    } catch (e) {
      console.error(e)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const addFood = (food) => {
    const amount = Math.max(0, Number(grams) || 0)
    const n = gramsToNutrition(food, amount)
    add({
      name: food.name,
      brand: food.brand,
      grams: amount,
      ...n,
    })
  }

  useEffect(() => {
    // search when pressing Enter in the search input
    const onEnter = (e) => {
      if (e.key === "Enter" && document.activeElement?.id === "food-search") {
        e.preventDefault()
        search()
      }
    }
    window.addEventListener("keydown", onEnter)
    return () => window.removeEventListener("keydown", onEnter)
  }, [q])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Food Tracker</h1>
            <p className="text-slate-600">Search the global database and log your meals.</p>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2"
          />
        </div>

        {/* Totals */}
        <section className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Calories" value={totals.calories} />
          <Stat label="Protein" value={`${totals.protein.toFixed(1)} g`} />
          <Stat label="Carbs" value={`${totals.carbs.toFixed(1)} g`} />
          <Stat label="Fat" value={`${totals.fat.toFixed(1)} g`} />
        </section>

        <div className="grid lg:grid-cols-[1fr,420px] gap-6 items-start">
          {/* Logged items */}
          <section className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-3">Today’s Log</h2>
            {day.length === 0 ? (
              <div className="text-slate-500 text-sm">No foods logged yet.</div>
            ) : (
              <div className="space-y-2">
                {day.map((it, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                    <div>
                      <div className="font-medium text-slate-900">{it.name}</div>
                      <div className="text-xs text-slate-500">
                        {it.grams} g • {it.calories} kcal — P {it.protein}g / C {it.carbs}g / F {it.fat}g
                      </div>
                    </div>
                    <button
                      onClick={() => remove(i)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Search box */}
          <section className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-3">Search Foods</h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="food-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="e.g., chicken breast, rice, granola bar…"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2"
                />
              </div>
              <button
                onClick={search}
                className="rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold hover:bg-slate-800"
              >
                Search
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm text-slate-600">Amount</label>
              <input
                type="number"
                min={0}
                value={grams}
                onChange={(e) => setGrams(Number(e.target.value))}
                className="w-24 rounded-lg border border-slate-300 px-2 py-1"
              />
              <span className="text-sm text-slate-600">grams</span>
            </div>

            <div className="mt-4 max-h-[420px] overflow-y-auto divide-y divide-slate-200">
              {loading ? (
                <div className="p-4 text-slate-500 text-sm">Searching…</div>
              ) : results.length === 0 ? (
                <div className="p-4 text-slate-500 text-sm">No results yet.</div>
              ) : (
                results.map((f) => {
                  const per100 = getPer100g(f)
                  return (
                    <div key={f.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 truncate">{f.name}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {(f.brand && `${f.brand} • `) || ""} {f.category || "food"} — {per100.calories} kcal / 100g
                        </div>
                      </div>
                      <button
                        onClick={() => addFood(f)}
                        className="flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Plus className="h-4 w-4" /> Add
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 text-center shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
    </div>
  )
}
