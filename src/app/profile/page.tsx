"use client";

import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthContext";
import { useState } from "react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [units, setUnits] = useState<"metric"|"imperial">("metric");

  async function deleteAccount() {
    alert("Account deletion requires admin action or a server function; placeholder here.");
  }

  return (
    <AuthGuard>
      <section className="container py-6 space-y-4">
        <h1 className="text-xl font-semibold">Profile</h1>
        <div className="card space-y-3">
          <div><span className="font-medium">Email:</span> {user?.email}</div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Units:</span>
            <select className="input max-w-[200px]" value={units} onChange={e=>setUnits(e.target.value as any)}>
              <option value="metric">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lb, in)</option>
            </select>
          </div>
          <button className="btn-outline" onClick={deleteAccount}>Delete account</button>
        </div>
      </section>
    </AuthGuard>
  );
}
