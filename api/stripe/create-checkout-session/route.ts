import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, getCustomerByEmail, createCustomer } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { priceId, userEmail, promoCode } = await request.json();

    if (!priceId || !userEmail) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customer = await getCustomerByEmail(userEmail);
    if (!customer) {
      customer = await createCustomer(userEmail);
    }

    const session = await createCheckoutSession({
      priceId,
      customerId: customer.id,
      successUrl: `${request.nextUrl.origin}/dashboard?success=true`,
      cancelUrl: `${request.nextUrl.origin}/dashboard?canceled=true`,
      promoCode,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
