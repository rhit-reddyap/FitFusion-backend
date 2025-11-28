import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function POST(request: NextRequest) {
  try {
    const { planId, paymentMethodId, customerId } = await request.json();

    // Validate required fields with detailed error messages
    if (!planId) {
      return NextResponse.json(
        { error: 'Missing required field: planId' },
        { status: 400 }
      );
    }
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Missing required field: customerId' },
        { status: 400 }
      );
    }

    // Strict validation for paymentMethodId
    if (!paymentMethodId) {
      console.error('paymentMethodId is missing or undefined:', { planId, customerId, paymentMethodId });
      return NextResponse.json(
        { 
          error: 'Missing or invalid payment method',
          details: 'paymentMethodId is required. If using Stripe Checkout, subscriptions are created automatically via webhooks and you should not call this endpoint manually.'
        },
        { status: 400 }
      );
    }
    
    if (typeof paymentMethodId !== 'string') {
      console.error('paymentMethodId is not a string:', { planId, customerId, paymentMethodId, type: typeof paymentMethodId });
      return NextResponse.json(
        { 
          error: 'Invalid payment method type',
          details: `paymentMethodId must be a string, but got ${typeof paymentMethodId}. If using Stripe Checkout, subscriptions are created automatically via webhooks.`
        },
        { status: 400 }
      );
    }
    
    if (paymentMethodId.trim() === '') {
      console.error('paymentMethodId is empty string:', { planId, customerId });
      return NextResponse.json(
        { 
          error: 'Empty payment method ID',
          details: 'paymentMethodId cannot be empty. If using Stripe Checkout, subscriptions are created automatically via webhooks.'
        },
        { status: 400 }
      );
    }
    
    // Additional check before using paymentMethodId
    console.log('Creating subscription with paymentMethodId:', { planId, customerId, paymentMethodIdLength: paymentMethodId.length });

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

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.display_name,
        metadata: { user_id: customerId },
      });

      stripeCustomerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', customerId);
    }

    // Only attach payment method if it's not already attached
    try {
      // Double-check paymentMethodId is still valid before calling Stripe
      if (!paymentMethodId || typeof paymentMethodId !== 'string' || paymentMethodId.trim() === '') {
        console.error('paymentMethodId became invalid before Stripe call:', { paymentMethodId });
        return NextResponse.json(
          { 
            error: 'Invalid payment method ID',
            details: 'Payment method ID is invalid or empty'
          },
          { status: 400 }
        );
      }
      
      // Check if payment method is already attached
      console.log('Retrieving payment method from Stripe:', paymentMethodId);
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      if (!paymentMethod.customer) {
        // Payment method is not attached, attach it now
        // Final safety check before attaching
        if (!paymentMethodId || typeof paymentMethodId !== 'string') {
          console.error('paymentMethodId invalid before attach:', { paymentMethodId, type: typeof paymentMethodId });
          return NextResponse.json(
            { 
              error: 'Invalid payment method ID',
              details: 'Payment method ID is missing or invalid before attachment'
            },
            { status: 400 }
          );
        }
        
        console.log('Attaching payment method:', { paymentMethodId, stripeCustomerId });
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: stripeCustomerId,
        });
      } else if (paymentMethod.customer !== stripeCustomerId) {
        // Payment method is attached to a different customer
        return NextResponse.json(
          { 
            error: 'Payment method already attached to another customer',
            details: 'This payment method is already associated with a different customer account'
          },
          { status: 400 }
        );
      }

      // Set as default payment method
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    } catch (attachError: any) {
      console.error('Error attaching payment method:', attachError);
      return NextResponse.json(
        { 
          error: 'Failed to attach payment method',
          details: attachError?.message || 'Payment method could not be attached. Please check the payment method ID.'
        },
        { status: 400 }
      );
    }

    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: planId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    await supabase.from('subscriptions').insert({
      user_id: customerId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      plan_id: planId,
    });

    await supabase
      .from('profiles')
      .update({ 
        is_premium: true,
        subscription_id: subscription.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId);

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        client_secret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      },
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    
    // Handle specific Stripe errors
    if (error?.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { 
          error: 'Stripe API error',
          details: error.message || 'Invalid request to Stripe API'
        },
        { status: 400 }
      );
    }
    
    if (error?.type && error.type.startsWith('Stripe')) {
      return NextResponse.json(
        { 
          error: 'Stripe error',
          details: error.message || String(error)
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create subscription',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}
