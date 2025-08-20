// src/pages/Pricing.jsx
import React from "react";

export default function Pricing() {
  const handleCheckout = async (priceId, mode = "subscription") => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode }),
      });
      const { url } = await res.json();
      window.location.href = url; // Redirect to Stripe Checkout
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Choose Your Plan</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl w-full px-6">
        {/* Free Plan */}
        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Free</h2>
          <p className="text-gray-600 mb-6">
            Access the <strong>Food Tracker</strong> only.
          </p>
          <p className="text-2xl font-bold mb-6">$0</p>
          <a
            href="/foodtracker"
            className="mt-auto bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-center"
          >
            Start Free
          </a>
        </div>

        {/* Monthly Plan */}
        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly</h2>
          <p className="text-gray-600 mb-6">
            Unlock all premium features, billed monthly.
          </p>
          <p className="text-2xl font-bold mb-6">
            $9.99<span className="text-lg">/mo</span>
          </p>
          <button
            onClick={() => handleCheckout("price_1RyGYY23ct5L2UZDBEt0XULc", "subscription")}
            className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            See Plans
          </button>
        </div>

        {/* Annual Plan */}
        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Annual</h2>
          <p className="text-gray-600 mb-6">
            Save with annual billing (2 months free).
          </p>
          <p className="text-2xl font-bold mb-6">
            $99.99<span className="text-lg">/yr</span>
          </p>
          <button
            onClick={() => handleCheckout("price_1RyGYY23ct5L2UZDBEt0XULc", "subscription")}
            className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            See Plans
          </button>
        </div>

        {/* Cookbook One-time */}
        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookbook</h2>
          <p className="text-gray-600 mb-6">
            Unlock our full cookbook with integrated recipes and macros in your
            Food Tracker.
          </p>
          <p className="text-2xl font-bold mb-6">$29.99</p>
          <button
            onClick={() => handleCheckout("price_1RyGrd23ct5L2UZDMTzQ1feA", "payment")}
            className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            Buy Cookbook
          </button>
        </div>
      </div>
    </div>
  );
}
