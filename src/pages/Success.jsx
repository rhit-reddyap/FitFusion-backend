// src/pages/Success.jsx
import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

export default function Success() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPurchase = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("session_id");

      if (sessionId) {
        try {
          const res = await fetch(`/api/session?session_id=${sessionId}`);
          const data = await res.json();

          if (data.metadata?.product === "cookbook") {
            localStorage.setItem("hasCookbook", "true");
          } else if (data.metadata?.product === "premium") {
            localStorage.setItem("isPremium", "true");
          }
        } catch (err) {
          console.error("Error verifying session:", err);
        }
      }
      setLoading(false);
    };

    verifyPurchase();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Finalizing your purchase...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-center px-6">
      <CheckCircle className="w-20 h-20 text-green-600 mb-6" />
      <h1 className="text-4xl font-bold text-green-700 mb-4">Payment Successful!</h1>
      <p className="text-lg text-gray-700 mb-8">
        Thank you for your purchase 🎉 <br />
        Your features are now unlocked.
      </p>
      <a
        href="/dashboard"
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow"
      >
        Go to Dashboard
      </a>
    </div>
  );
}
