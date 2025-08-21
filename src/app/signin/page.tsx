"use client";

import { supabase } from "@/lib/supabaseClient";
import { Github, Mail } from "lucide-react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` }
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  async function oauth(provider: "google" | "github") {
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` } });
  }

  return (
    <div className="container py-12 max-w-md">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
        {sent ? (
          <p>Check your email for a magic link.</p>
        ) : (
          <form onSubmit={signInEmail} className="space-y-3">
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button className="btn w-full" type="submit">
              <Mail size={18} /> Send magic link
            </button>
          </form>
        )}
        <div className="my-4 h-px bg-gray-200" />
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => oauth("google")} className="btn-outline w-full py-2 rounded-xl">Google</button>
          <button onClick={() => oauth("github")} className="btn-outline w-full py-2 rounded-xl flex items-center justify-center gap-2">
            <Github size={18}/> GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
