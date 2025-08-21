"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Home,
  Dumbbell,
  UtensilsCrossed,
  BarChart3,
  Users,
  Brain,
  User,
} from "lucide-react";

const items = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/workouts", icon: Dumbbell, label: "Workouts" },
  { href: "/food", icon: UtensilsCrossed, label: "Food" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/communities", icon: Users, label: "Communities" },
  { href: "/ai", icon: Brain, label: "AI" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on auth routes (add more if you have them)
  if (pathname?.startsWith("/signin")) return null;

  return (
    <nav
      className={clsx(
        "fixed inset-x-0 bottom-0 z-40",
        // Dark, glassy, mobile-first
        "border-t border-slate-800 bg-slate-900/80 backdrop-blur",
        // Safe-area padding for iOS
        "pb-[max(env(safe-area-inset-bottom),8px)]"
      )}
    >
      <div className="mx-auto max-w-2xl grid grid-cols-7 text-[11px] sm:text-xs">
        {items.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center gap-1 py-2 transition",
                "text-slate-400 hover:text-slate-200",
                active &&
                  "text-white bg-slate-900/70 border-x border-slate-800"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} className={clsx(active && "stroke-[2.2]")} />
              <span
                className={clsx(
                  "px-1 rounded-md",
                  active && "text-[11px] font-semibold"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
