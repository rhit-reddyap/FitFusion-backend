// Simple promo code logic
export type PromoResult = {
  success: boolean;
  type?: "lifetime" | "trial";
  message: string;
  days?: number; // for trials
};

export function validatePromo(code: string): PromoResult {
  const normalized = code.trim().toLowerCase();

  if (normalized === "freshmanfriday") {
    return {
      success: true,
      type: "lifetime",
      message: "🎉 Lifetime premium unlocked with Freshman Friday!"
    };
  }

  if (normalized === "cc") {
    return {
      success: true,
      type: "trial",
      days: 7,
      message: "✅ 7-day premium trial activated!"
    };
  }

  return {
    success: false,
    message: "❌ Invalid promo code"
  };
}
