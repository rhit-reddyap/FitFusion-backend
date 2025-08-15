import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Target, Brain, Dumbbell, Apple } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'lightly_active', label: 'Lightly Active' },
  { value: 'moderately_active', label: 'Moderately Active' },
  { value: 'very_active', label: 'Very Active' },
]

export default function Plans() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    goal: 'recomp',
    gender: 'male',
    age: 24,
    height: 178, // cm
    weight: 75,  // kg
    activity: 'moderately_active',
    experience: 'intermediate',
  })
  const [plan, setPlan] = useState(null)
  const [saving, setSaving] = useState(false)

  const handle = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const estimateTDEE = () => {
    // Mifflin-St Jeor (very rough)
    const { gender, age, height, weight, activity } = form
    let bmr = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161
    const mults = {
      sedentary: 1.2, lightly_active: 1.375,
      moderately_active: 1.55, very_active: 1.725
    }
    return Math.round(bmr * (mults[activity] ?? 1.2))
  }

  const generatePlan = () => {
    const tdee = estimateTDEE()
    const goalAdj = form.goal === 'cut' ? -450 : form.goal === 'bulk' ? +300 : -100
    const calories = Math.max(1400, tdee + goalAdj)
    // macros: 30/40/30 split (protein/carbs/fat)
    const protein = Math.round((calories * 0.30) / 4)
    const carbs   = Math.round((calories * 0.40) / 4)
    const fat     = Math.round((calories * 0.30) / 9)

    const workout = [
      { day: 'Mon',  workout_name: 'Upper Push', exercises: [
        { name:'Barbell Bench Press', sets:4, reps:'6–8' },
        { name:'Overhead Press', sets:3, reps:'6–8' },
        { name:'Incline DB Press', sets:3, reps:'8–10' },
        { name:'Cable Fly', sets:3, reps:'12–15' },
        { name:'Triceps Rope Pushdown', sets:3, reps:'10–12' },
      ]},
      { day: 'Tue',  workout_name: 'Lower A', exercises: [
        { name:'Back Squat', sets:4, reps:'5–8' },
        { name:'Romanian Deadlift', sets:3, reps:'6–10' },
        { name:'Leg Press', sets:3, reps:'10–12' },
        { name:'Calf Raise', sets:4, reps:'12–15' },
        { name:'Hanging Knee Raise', sets:3, reps:'12–15' },
      ]},
      { day: 'Thu',  workout_name: 'Upper Pull', exercises: [
        { name:'Weighted Pull-up or Lat Pulldown', sets:4, reps:'6–10' },
        { name:'Barbell Row', sets:3, reps:'6–10' },
        { name:'Seated Cable Row', sets:3, reps:'10–12' },
        { name:'Face Pull', sets:3, reps:'12–15' },
        { name:'DB Curl', sets:3, reps:'10–12' },
      ]},
      { day: 'Sat',  workout_name: 'Lower B', exercises: [
        { name:'Deadlift (or Trap Bar)', sets:3, reps:'3–5' },
        { name:'Front Squat or Hack Squat', sets:3, reps:'6–10' },
        { name:'Split Squat', sets:3, reps:'8–10/leg' },
        { name:'Hamstring Curl', sets:3, reps:'10–12' },
        { name:'Plank', sets:3, reps:'45–60s' },
      ]},
    ]

    const diet = {
      daily_calories: calories,
      daily_protein: protein,
      daily_carbs: carbs,
      daily_fat: fat,
      example_day: {
        breakfast: ['Greek yogurt + berries + granola', '2 eggs + toast'],
        lunch: ['Chicken rice bowl w/ veggies', 'Turkey sandwich + salad'],
        dinner: ['Salmon, potatoes, asparagus', 'Lean beef taco bowl'],
        snacks: ['Protein shake', 'Fruit + almonds']
      }
    }

    setPlan({ tdee, workout, diet })
  }

  const savePlan = async () => {
    // stubbed – replace with your API later
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    setSaving(false)
    alert('Plan saved (demo). Replace with your backend call later.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-emerald-500 grid place-items-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AI Plans</h1>
            <p className="text-slate-600">Enter a few details and generate a personalized plan.</p>
          </div>
        </div>

        {/* Form + Preview */}
        <div className="grid lg:grid-cols-[380px,1fr] gap-6 items-start">
          {/* Form */}
          <section className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" /> Your details
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm text-slate-600 mb-1">Goal</label>
                <select value={form.goal} onChange={e=>handle('goal', e.target.value)}
                        className="w-full rounded-lg border-slate-300">
                  <option value="recomp">Recomp (slow fat loss / muscle)</option>
                  <option value="cut">Cut (fat loss)</option>
                  <option value="bulk">Bulk (muscle gain)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Gender</label>
                <select value={form.gender} onChange={e=>handle('gender', e.target.value)}
                        className="w-full rounded-lg border-slate-300">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Age</label>
                <input type="number" value={form.age} onChange={e=>handle('age', +e.target.value)}
                       className="w-full rounded-lg border-slate-300" />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Height (cm)</label>
                <input type="number" value={form.height} onChange={e=>handle('height', +e.target.value)}
                       className="w-full rounded-lg border-slate-300" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Weight (kg)</label>
                <input type="number" value={form.weight} onChange={e=>handle('weight', +e.target.value)}
                       className="w-full rounded-lg border-slate-300" />
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-slate-600 mb-1">Activity level</label>
                <select value={form.activity} onChange={e=>handle('activity', e.target.value)}
                        className="w-full rounded-lg border-slate-300">
                  {activityLevels.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-slate-600 mb-1">Experience</label>
                <select value={form.experience} onChange={e=>handle('experience', e.target.value)}
                        className="w-full rounded-lg border-slate-300">
                  <option>beginner</option>
                  <option>intermediate</option>
                  <option>advanced</option>
                </select>
              </div>
            </div>

            <button onClick={generatePlan}
                    className="mt-5 w-full rounded-xl bg-emerald-600 text-white font-semibold py-3 hover:bg-emerald-700">
              Generate Plan
            </button>

            {plan && (
              <div className="mt-4 text-sm text-slate-600">
                Estimated TDEE: <span className="font-semibold text-slate-900">{plan.tdee} kcal</span>
              </div>
            )}
          </section>

          {/* Preview */}
          <section className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            {!plan ? (
              <div className="h-64 grid place-items-center text-slate-500">
                <p className="text-center">Fill the form and click <b>Generate Plan</b> to preview.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Workout */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-emerald-600" /> 4-Day Workout Split
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {plan.workout.map((w, i) => (
                      <div key={i} className="rounded-xl border border-slate-200 p-4">
                        <div className="font-semibold text-slate-800">{w.day} • {w.workout_name}</div>
                        <ul className="mt-2 text-sm text-slate-600 space-y-1">
                          {w.exercises.map((e, j) => (
                            <li key={j}>• {e.name} — {e.sets}×{e.reps}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diet */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Apple className="h-5 w-5 text-emerald-600" /> Daily Nutrition Targets
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Stat label="Calories" value={`${plan.diet.daily_calories}`} />
                    <Stat label="Protein"  value={`${plan.diet.daily_protein} g`} />
                    <Stat label="Carbs"    value={`${plan.diet.daily_carbs} g`} />
                    <Stat label="Fat"      value={`${plan.diet.daily_fat} g`} />
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 p-4">
                    <div className="font-semibold text-slate-800 mb-2">Example Day</div>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <Meal title="Breakfast" items={plan.diet.example_day.breakfast} />
                      <Meal title="Lunch" items={plan.diet.example_day.lunch} />
                      <Meal title="Dinner" items={plan.diet.example_day.dinner} />
                      <Meal title="Snacks" items={plan.diet.example_day.snacks} />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={savePlan}
                    disabled={saving}
                    className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save to Profile'}
                  </button>
                  <button
                    onClick={() => navigate('/tracker')}
                    className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold hover:bg-slate-50"
                  >
                    Start with this plan
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-4 text-center">
      <div className="text-xs uppercase tracking-wide text-emerald-700">{label}</div>
      <div className="text-xl font-bold text-emerald-800">{value}</div>
    </div>
  )
}

function Meal({ title, items }) {
  return (
    <div>
      <div className="font-medium text-slate-800">{title}</div>
      <ul className="mt-1 text-slate-600 space-y-1">
        {items.map((i, idx) => <li key={idx}>• {i}</li>)}
      </ul>
    </div>
  )
}
