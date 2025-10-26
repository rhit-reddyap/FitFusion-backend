"use client";

import { useState } from "react";

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    const res = await fetch("/api/stripe/create-checkout-session", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }
  return (
    <button onClick={go} className="btn" disabled={loading}>
      {loading ? "Loading..." : "Upgrade to Pro"}
    </button>
  );
}
