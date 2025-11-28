"use client";

export const dynamic = 'force-dynamic';

import AuthGuard from "@/components/AuthGuard";
import { useParams } from "next/navigation";

export default function CommunityDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  return (
    <AuthGuard>
      <section className="container py-6 space-y-4">
        <h1 className="text-xl font-semibold">Community {id}</h1>
        <div className="card">
          <p className="text-gray-600">
            This is a placeholder feed for community <strong>{id}</strong>.
            Soon you’ll see posts, PRs, and discussions here.
          </p>
        </div>
      </section>
    </AuthGuard>
  );
}
