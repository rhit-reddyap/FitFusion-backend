"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/app/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

const STRIPE_URL = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL || "";
const ALLOWLIST_CSV = (process.env.NEXT_PUBLIC_FF_ALLOWLIST || "").trim();
const FF_OPEN = String(process.env.NEXT_PUBLIC_FF_OPEN || "false").toLowerCase() === "true";

const allowlist = new Set(
  ALLOWLIST_CSV ? ALLOWLIST_CSV.split(",").map((s) => s.trim().toLowerCase()) : []
);

export function usePremium(user: { uid: string; email?: string | null } | null | undefined) {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumEnd, setPremiumEnd] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) {
        setLoading(false);
        setIsPremium(false);
        setPremiumEnd(null);
        return;
      }
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const data: any = snap.data() || {};
      const end = data?.premium_end?.toDate?.() ?? (data?.premium_end ? new Date(data.premium_end) : null);
      const premium = end === null || (end && end > new Date());
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: user.uid,
          email: user.email ?? null,
          createdAt: serverTimestamp(),
          premium_end: null,
          source: null,
        });
      }
      if (active) {
        setPremiumEnd(end ?? null);
        setIsPremium(Boolean(premium));
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  const openCheckout = () => {
    if (!STRIPE_URL) return alert("Stripe checkout link not configured.");
    window.open(STRIPE_URL, "_blank", "noopener,noreferrer");
  };

  const applyCode = async (codeInput: string) => {
    if (!user) return { ok: false, msg: "Please sign in first." };
    const code = String(codeInput || "").trim().toLowerCase();
    if (!code) return { ok: false, msg: "Enter a code." };

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { uid: user.uid, email: user.email ?? null, createdAt: serverTimestamp() });
    }

    if (code === "freshmanfriday") {
      const emailOk = user.email && allowlist.has(user.email.toLowerCase());
      if (!FF_OPEN && !emailOk) return { ok: false, msg: "This code is not enabled for this account." };
      await updateDoc(ref, { premium_end: null, source: "freshmanfriday", updatedAt: serverTimestamp() });
      setIsPremium(true); setPremiumEnd(null);
      return { ok: true, msg: "Premium unlocked. Enjoy!" };
    }

    if (code === "cc") {
      const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await updateDoc(ref, { premium_end: end, source: "cc", updatedAt: serverTimestamp() });
      setIsPremium(true); setPremiumEnd(end);
      return { ok: true, msg: "7‑day premium trial activated." };
    }

    return { ok: false, msg: "Invalid code." };
  };

  return useMemo(() => ({ loading, isPremium, premiumEnd, openCheckout, applyCode }), [loading, isPremium, premiumEnd]);
}
