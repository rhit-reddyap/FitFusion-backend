export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-slate-600 flex items-center justify-between">
        <p>© {new Date().getFullYear()} Fit Fusion AI</p>
        <p className="text-slate-500">Built with React + Tailwind</p>
      </div>
    </footer>
  )
}
