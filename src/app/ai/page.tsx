"use client";

import AuthGuard from "@/components/AuthGuard";
import { useState } from "react";

export default function AIPage() {
  const [goal, setGoal] = useState("Build muscle and improve strength");
  return (
    <AuthGuard>
      <section className="container py-6 space-y-4">
        <h1 className="text-xl font-semibold">AI Coach</h1>
        <div className="card space-y-3">
          <textarea className="input h-28" value={goal} onChange={e=>setGoal(e.target.value)} />
          <button className="btn">Generate plan</button>
          <p className="text-sm text-gray-600">Premium users get longer plans and automatic periodization.</p>
        </div>
      </section>
    </AuthGuard>
  );
}
