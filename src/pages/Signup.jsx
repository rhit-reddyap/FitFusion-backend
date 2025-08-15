import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
export default function Signup() {
  async function onSubmit(e) {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message); else window.location.href = '/';
  }
  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto p-6 space-y-3 text-gray-100">
      <h1 className="text-2xl font-bold mb-2">Create account</h1>
      <input name="email" placeholder="Email" className="w-full px-3 py-2 rounded-lg text-slate-900" />
      <input type="password" name="password" placeholder="Password" className="w-full px-3 py-2 rounded-lg text-slate-900" />
      <button className="w-full rounded-xl bg-emerald-600 py-2 font-semibold">Sign up</button>
      <p className="text-sm opacity-80 text-center">Have an account? <Link to="/login" className="underline">Log in</Link></p>
    </form>
  );
}
