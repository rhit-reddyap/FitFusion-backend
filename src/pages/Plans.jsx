import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Plans() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-16">
        <h1 className="text-3xl font-bold text-slate-900">AI Plans</h1>
        <p className="mt-2 text-slate-600">This is where we’ll generate and show your workout & diet plans.</p>
      </main>
      <Footer />
    </div>
  )
}
