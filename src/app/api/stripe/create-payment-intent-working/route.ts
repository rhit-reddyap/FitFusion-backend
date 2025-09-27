import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Use the correct Stripe secret key
const stripe = new Stripe('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', {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, planId, customerId } = await request.json();

    if (!amount || !currency || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the correct price ID
    const finalPlanId = planId || 'price_1RyHEb0yFM5cg5nbtjk5Cnzn';

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: `${customerId}@example.com`,
      name: `User ${customerId}`,
      metadata: {
        user_id: customerId,
      },
    });

    // Create ephemeral key for customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-06-20' }
    );

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: customer.id,
      metadata: {
        user_id: customerId,
        plan_id: finalPlanId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      ephemeralKey: ephemeralKey.secret,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent', details: error.message },
      { status: 500 }
    );
  }
}








