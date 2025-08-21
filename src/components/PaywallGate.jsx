"use client";

import { useState } from "react";
import { Lock, Crown, KeyRound } from "lucide-react";
import { usePremium } from "@/app/hooks/usePremium";
import { useAuthContext } from "@/components/AuthGuard"; // assuming your AuthGuard exposes context

type Props = {
  title?: string;
  children: React.ReactNode;
};

export default function PaywallGate({ title = "Premium Feature", children }: Props) {
  // Get the current Firebase user from your AuthGuard (adjust import if different)
  const { user } = useAuthContext(); // { uid, email } or null
  const { loading, isPremium, openCheckout, applyCode } = usePremium(user);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  if (loading || isPremium) return <>{children}</>;

  return (
    <div className="relative">
      <div className="paywall-blur">{children}</div>
      <div className="paywall-overlay">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={18} className="text-amber-400" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-sm text-slate-400 mb-3">
            This page is blurred. Upgrade to Premium to unlock Analytics, Workout Tracker, and AI Coach.
          </p>

          <button
            onClick={openCheckout}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] text-black font-semibold py-2.5 hover:opacity-95 active:opacity-90 transition"
          >
            <Lock size={18} /> Upgrade to Premium
          </button>

          <div className="mt-4 text-xs text-slate-400">Have a code?</div>
          <div className="mt-2 flex gap-2">
            <input
              className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[var(--brand)]"
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              onClick={async () => {
                const res = await applyCode(code);
                setMsg(res.msg);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm hover:bg-slate-800"
            >
              <KeyRound size={16} /> Apply
            </button>
          </div>

          {msg ? <div className="mt-2 text-xs text-slate-300">{msg}</div> : null}
        </div>
      </div>
    </div>
  );
}

