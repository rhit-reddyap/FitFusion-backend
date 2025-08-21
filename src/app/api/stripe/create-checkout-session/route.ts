import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const price = process.env.STRIPE_PRICE_ID;
    if (!price) return NextResponse.json({ error: "Missing STRIPE_PRICE_ID" }, { status: 400 });

    const origin = process.env.NEXT_PUBLIC_APP_URL!;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/profile?status=success`,
      cancel_url: `${origin}/profile?status=cancelled`,
      // recommend attaching supabase user id in metadata from client later
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
