import React from "react";
import { XCircle } from "lucide-react";

export default function Cancel() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-center px-6">
      <XCircle className="w-20 h-20 text-red-600 mb-6" />
      <h1 className="text-4xl font-bold text-red-700 mb-4">Payment Canceled</h1>
      <p className="text-lg text-gray-700 mb-8">
        Your subscription was not completed. No charges have been made.
      </p>
      <a
        href="/pricing"
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow"
      >
        Return to Pricing
      </a>
    </div>
  );
}
