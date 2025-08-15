import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Brain, Target, Apple, BarChart3, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium mb-4">
              <Zap className="h-4 w-4" /> AI-Powered Fitness
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              Your personal coach for <span className="text-emerald-600">workouts</span> and <span className="text-emerald-600">nutrition</span>
            </h1>
            <p className="mt-4 text-slate-600 text-lg">
              Generate custom plans, track meals & workouts, and get insights on your progress — all in one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/plans" className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">
                Create My AI Plan
              </Link>
              <Link to="/tracker" className="px-5 py-3 rounded-xl bg-white text-slate-800 border border-slate-200 hover:bg-slate-50">
                Open Tracker
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="grid grid-cols-3 gap-4">
                {[Brain, Target, Apple].map((Icon, i) => (
                  <div key={i} className="rounded-2xl bg-slate-50 p-6 grid place-items-center">
                    <Icon className="h-10 w-10 text-emerald-600" />
                  </div>
                ))}
                <div className="col-span-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-6 w-6" />
                    <p className="font-semibold">Weekly insights unlocked</p>
                  </div>
                  <p className="text-emerald-100 mt-1 text-sm">
                    Weight trend, calories, and metabolic efficiency at a glance.
                  </p>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-emerald-500/10 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-3 gap-6">
        {[
          {
            icon: <Target className="h-6 w-6 text-emerald-600" />,
            title: 'Smart workout planning',
            text: 'Progressive 4–5 day splits with sets/reps and rest tailored to you.'
          },
          {
            icon: <Apple className="h-6 w-6 text-emerald-600" />,
            title: 'Simple meal logging',
            text: 'Quick food search, cup/gram conversions, and macro summaries.'
          },
          {
            icon: <BarChart3 className="h-6 w-6 text-emerald-600" />,
            title: 'Clear analytics',
            text: 'Weight, intake, TDEE estimate, and metabolic efficiency each week.'
          },
        ].map((f, i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="h-10 w-10 grid place-items-center rounded-xl bg-emerald-50 mb-4">{f.icon}</div>
            <h3 className="font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-slate-600 text-sm">{f.text}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-10 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">Ready to start your plan?</h3>
            <p className="text-slate-300 mt-1">Generate your first AI plan and deploy updates automatically via GitHub.</p>
          </div>
          <Link to="/plans" className="px-5 py-3 rounded-xl bg-emerald-500 font-semibold hover:bg-emerald-600">
            Generate Plan
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
