"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

// ✅ Force this page to be client-rendered only
export const dynamic = "force-dynamic";

export default function AdminPage() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">👑 Admin Dashboard</h1>
        <p className="mb-6 text-gray-700">
          Welcome, <span className="font-semibold">{session?.user?.email ?? "Guest"}</span>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/users"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg shadow text-center"
          >
            Manage Users
          </Link>
          <Link
            href="/admin/settings"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg shadow text-center"
          >
            App Settings
          </Link>
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg shadow">
            Analytics
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg shadow">
            Danger Zone
          </button>
        </div>
      </div>
    </main>
  );
}
