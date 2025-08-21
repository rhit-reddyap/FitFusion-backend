"use client";

import { useState } from "react";
import { validatePromo } from "@/lib/promo";

export default function ProfilePage() {
  const [promo, setPromo] = useState("");
  const [status, setStatus] = useState("");

  const applyPromo = () => {
    const result = validatePromo(promo);
    setStatus(result.message);

    if (result.success) {
      if (result.type === "lifetime") {
        localStorage.setItem("premium", "lifetime");
      } else if (result.type === "trial") {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + (result.days ?? 7));
        localStorage.setItem("premiumTrial", expiry.toISOString());
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            Enter Promo Code
          </label>
          <input
            type="text"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg mb-2"
          />
          <button
            onClick={applyPromo}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Apply Code
          </button>
        </div>

        {status && (
          <p className="mt-2 text-center font-medium">{status}</p>
        )}
      </div>
    </main>
  );
}
