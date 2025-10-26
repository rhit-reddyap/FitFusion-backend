import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Stripe key being used:', process.env.STRIPE_SECRET_KEY ? 'From env' : 'No key found');
    console.log('Key starts with:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...' : 'No key');
    
    const { amount, currency, customerId } = await request.json();

    if (!amount || !currency || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Test Stripe connection first
    try {
      const account = await stripe.accounts.retrieve();
      console.log('Stripe account connected:', account.id);
    } catch (stripeError) {
      console.error('Stripe connection error:', stripeError);
      return NextResponse.json(
        { error: 'Stripe authentication failed', details: stripeError.message },
        { status: 401 }
      );
    }

    // Create a simple payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      metadata: {
        user_id: customerId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customerId,
      ephemeralKey: 'test_ephemeral_key', // We'll create this properly later
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent', details: error.message },
      { status: 500 }
    );
  }
}