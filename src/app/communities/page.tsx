"use client";

import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";

export default function CommunitiesPage() {
  const demo = [
    { id: "1", name: "Rose-Hulman Lifters", members: 124 },
    { id: "2", name: "Hypertrophy Squad", members: 89 },
  ];
  return (
    <AuthGuard>
      <section className="container py-6 space-y-4">
        <h1 className="text-xl font-semibold">Communities</h1>
        <div className="grid md:grid-cols-2 gap-4">
          {demo.map(c => (
            <div key={c.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-gray-600">{c.members} members</div>
              </div>
              <Link href={`/communities/${c.id}`} className="btn">Open</Link>
            </div>
          ))}
        </div>
      </section>
    </AuthGuard>
  );
}
