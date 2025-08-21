"use client";

import AuthGuard from "@/components/AuthGuard";
import { useMemo } from "react";

// Placeholder for weekly metabolism computation / trends
function computeWeeklyTDEE(weights: number[], burns: number[]) {
  const days = Math.min(weights.length, burns.length, 7);
  let total = 0;
  for (let i=0;i<days;i++) total += burns[i];
  const tdee = days ? Math.round(total / days) : 0;
  return tdee;
}

export default function AnalyticsPage() {
  const tdee = useMemo(()=>computeWeeklyTDEE([80,80,80,80,80,80,80],[2500,2600,2550,2450,2650,2500,2550]),[]);
  return (
    <AuthGuard>
      <section className="container py-6 space-y-4">
        <h1 className="text-xl font-semibold">Analytics</h1>

        <div className="card">
          <h2 className="font-medium mb-1">Weekly metabolism update</h2>
          <p className="text-gray-600 text-sm mb-3">Your estimated average TDEE over the last 7 days.</p>
          <div className="text-4xl font-bold">{tdee} kcal</div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">Charts coming soon</div>
          <div className="card">Body metrics coming soon</div>
        </div>
      </section>
    </AuthGuard>
  );
}
