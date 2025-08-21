"use client";

import Link from "next/link";
import { useAuth } from "./AuthContext";
import { Crown, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  // Hide header on signin page
  if (pathname?.startsWith("/signin")) return null;

  return (
    <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-40">
      <div className="container flex items-center justify-between py-3">
        <Link href="/dashboard" className="font-semibold text-lg">
          FitFusion
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/profile" className="btn-outline rounded-xl px-3 py-1.5 text-sm">Profile</Link>
          <Link href="/ai" className="btn rounded-xl px-3 py-1.5 text-sm">
            <Crown size={16} /> Go Pro
          </Link>
          {user && (
            <button onClick={signOut} className="btn-outline rounded-xl px-3 py-1.5 text-sm">
              <LogOut size={16} /> Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
