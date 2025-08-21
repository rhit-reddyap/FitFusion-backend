"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  const isAdmin = session?.user?.email === "your-email@example.com"; // 👈 replace with your email

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-gray-900 text-white">
      {/* Left: Logo */}
      <Link href="/" className="text-xl font-bold">
        FitFusion
      </Link>

      {/* Center: Links */}
      <div className="flex gap-6">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/analytics">Analytics</Link>
        <Link href="/gamification">Gamification</Link>
        {isAdmin && <Link href="/admin">Admin</Link>}
      </div>

      {/* Right: Auth Section */}
      <div className="flex items-center gap-4">
        {session ? (
          <>
            <span className="text-sm">{session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/signin"
              className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
