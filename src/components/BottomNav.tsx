"use client";

import Link from "next/link";
import { Dumbbell, UtensilsCrossed, BarChart3, Users, Brain, Home, User } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

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
  if (pathname?.startsWith("/signin")) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 border-t bg-white/90 backdrop-blur z-40">
      <div className="mx-auto max-w-2xl grid grid-cols-7 text-xs">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center py-2 hover:bg-gray-50",
                active && "text-black font-medium"
              )}
            >
              <Icon size={20} />
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
