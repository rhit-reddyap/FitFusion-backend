import { Link, NavLink } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const linkBase =
    'px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg'
  const active =
    'text-emerald-700 bg-emerald-100'

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-800 to-emerald-500 grid place-items-center">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">Fit Fusion AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={({isActive}) => `${linkBase} ${isActive?active:''}`}>Home</NavLink>
            <NavLink to="/plans" className={({isActive}) => `${linkBase} ${isActive?active:''}`}>AI Plans</NavLink>
            <NavLink to="/tracker" className={({isActive}) => `${linkBase} ${isActive?active:''}`}>Tracker</NavLink>
            <NavLink to="/analytics" className={({isActive}) => `${linkBase} ${isActive?active:''}`}>Analytics</NavLink>
            <NavLink to="/profile" className={({isActive}) => `${linkBase} ${isActive?active:''}`}>Profile</NavLink>
          </nav>

          <button
            className="md:hidden rounded-lg p-2 hover:bg-slate-100"
            onClick={() => setOpen(v=>!v)}
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-700">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden mt-3 grid gap-1">
            <NavLink onClick={()=>setOpen(false)} to="/" end className={({isActive}) => `${linkBase} ${isActive?active:''}`}>Home</NavLink>
            <NavLink onClick={()=>setOpen(false)} to="/plans" className={({isActive}) => `${linkBase} ${isActive?active:''}`}>AI Plans</NavLink>
            <NavLink onClick={()=>setOpen(false)} to="/tracker" className={({isActive}) => `${linkBase} ${isActive?active:''}`}>Tracker</NavLink>
            <NavLink onClick={()=>setOpen(false)} to="/analytics" className={({isActive}) => `${linkBase} ${isActive?active:''}`}>Analytics</NavLink>
            <NavLink onClick={()=>setOpen(false)} to="/profile" className={({isActive}) => `${linkBase} ${isActive?active:''}`}>Profile</NavLink>
          </div>
        )}
      </div>
    </header>
  )
}
