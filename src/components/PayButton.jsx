// src/components/PayButton.jsx
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_live_xxx"); // <-- your publishable key

export default function PayButton() {
  const checkout = async () => {
    const res = await fetch("http://localhost:4242/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <button
      onClick={checkout}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
    >
      Subscribe to Fit Fusion
    </button>
  );
}
