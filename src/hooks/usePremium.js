"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
      
      // Check if user has premium subscription in Supabase
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_tier, premium_end')
        .eq('id', user.uid)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        if (active) {
          setLoading(false);
          setIsPremium(false);
          setPremiumEnd(null);
        }
        return;
      }
      
      const end = profile?.premium_end ? new Date(profile.premium_end) : null;
      const premium = profile?.subscription_tier === 'premium' || (end && end > new Date());
      
      if (active) {
        setPremiumEnd(end);
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

    if (code === "freshmanfriday") {
      const emailOk = user.email && allowlist.has(user.email.toLowerCase());
      if (!FF_OPEN && !emailOk) return { ok: false, msg: "This code is not enabled for this account." };
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_tier: 'premium',
          premium_end: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.uid);
      
      if (error) {
        console.error('Error updating profile:', error);
        return { ok: false, msg: "Error applying code. Please try again." };
      }
      
      setIsPremium(true); 
      setPremiumEnd(null);
      return { ok: true, msg: "Premium unlocked. Enjoy!" };
    }

    if (code === "cc") {
      const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_tier: 'premium',
          premium_end: end.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.uid);
      
      if (error) {
        console.error('Error updating profile:', error);
        return { ok: false, msg: "Error applying code. Please try again." };
      }
      
      setIsPremium(true); 
      setPremiumEnd(end);
      return { ok: true, msg: "7‑day premium trial activated." };
    }

    return { ok: false, msg: "Invalid code." };
  };

  return useMemo(() => ({ loading, isPremium, premiumEnd, openCheckout, applyCode }), [loading, isPremium, premiumEnd]);
}
