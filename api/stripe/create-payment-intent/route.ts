import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Use the correct Stripe secret key
const stripe = new Stripe('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', {
  apiVersion: '2024-06-20',
});

const supabase = createClient(
  'https://zlxbmtpuekcvtmqwfaie.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE || 'your_service_role_key_here'
);

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, planId, customerId } = await request.json();

    if (!amount || !currency || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the correct price ID if not provided
    const finalPlanId = planId || 'price_1RyHEb0yFM5cg5nbtjk5Cnzn';

    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', customerId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let stripeCustomerId = user.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.display_name,
        metadata: {
          user_id: customerId,
        },
      });

      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', customerId);
    }

    // Create ephemeral key for customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: stripeCustomerId },
      { apiVersion: '2024-06-20' }
    );

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: stripeCustomerId,
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
      customerId: stripeCustomerId,
      ephemeralKey: ephemeralKey.secret,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
