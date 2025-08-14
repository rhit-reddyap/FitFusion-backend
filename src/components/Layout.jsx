import { NavLink } from "react-router-dom";
import { LayoutDashboard, Target, Apple, ChefHat, Dumbbell, TrendingUp, User } from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ai-plans", label: "AI Plans", icon: Target },
  { to: "/food-tracker", label: "Food Tracker", icon: Apple },
  { to: "/recipes", label: "Recipes", icon: ChefHat },
  { to: "/workout-tracker", label: "Workout Tracker", icon: Dumbbell },
  { to: "/analytics", label: "Analytics", icon: TrendingUp },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {/* sidebar */}
      <aside className="w-64 shrink-0 bg-white/90 backdrop-blur border-r border-slate-200 p-4 hidden md:block">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-emerald-500 grid place-items-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg">FitnessPro</div>
            <div className="text-xs text-slate-500">AI-Powered Health</div>
          </div>
        </div>

        <nav className="space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition
                 ${isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "hover:bg-slate-50"}`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 p-3 rounded-lg bg-slate-50 text-sm">
          <div className="font-semibold">Your Journey</div>
          <div className="text-slate-500">Track, Plan, Succeed</div>
        </div>
      </aside>

      {/* main */}
      <main className="flex-1">
        <header className="md:hidden sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 p-4">
          <div className="font-bold text-lg bg-gradient-to-r from-slate-800 to-emerald-500 bg-clip-text text-transparent">
            FitnessPro
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
