"use client";

import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { Dumbbell, UtensilsCrossed, Users, BarChart3, Brain } from "lucide-react";

export default function Dashboard() {
  return (
    <AuthGuard>
      <section className="container py-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <h2 className="font-semibold mb-2">Quick actions</h2>
            <div className="flex flex-wrap gap-2">
              <Link className="btn" href="/workouts"><Dumbbell size={18}/> Log workout</Link>
              <Link className="btn" href="/food"><UtensilsCrossed size={18}/> Log food</Link>
              <Link className="btn" href="/analytics"><BarChart3 size={18}/> View analytics</Link>
              <Link className="btn" href="/ai"><Brain size={18}/> Get AI plan</Link>
            </div>
          </div>
          <div className="card">
            <h2 className="font-semibold mb-2">Communities</h2>
            <p className="text-sm text-gray-600 mb-2">Join groups to share PRs and stay accountable.</p>
            <Link href="/communities" className="btn-outline">Explore <Users className="inline ml-2" size={16}/></Link>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-2">Today</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50">
              <div className="text-sm text-gray-500">Calories</div>
              <div className="text-2xl font-bold">—</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50">
              <div className="text-sm text-gray-500">Protein</div>
              <div className="text-2xl font-bold">—</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50">
              <div className="text-sm text-gray-500">Workouts</div>
              <div className="text-2xl font-bold">—</div>
            </div>
          </div>
        </div>
      </section>
    </AuthGuard>
  );
}
