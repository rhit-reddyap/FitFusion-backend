// Simple Next.js API route for Stripe checkout
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// CORS headers helper
function corsHeaders() {
  return {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  };
}

// Handle OPTIONS preflight requests
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Stripe is not properly configured' },
        { status: 500, headers: corsHeaders() }
      );
    }

    const { priceId, planType, userId, successUrl, cancelUrl } = await request.json();

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Determine price ID - use provided priceId or look up from planType
    let finalPriceId = priceId;
    
    if (!finalPriceId && planType) {
      // Use default price IDs based on plan type
      const defaultPriceIds = {
        monthly: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_1STotm0yFM5cg5nbgDYnZ6XO',
        yearly: process.env.STRIPE_ANNUAL_PRICE_ID || 'price_1SYYt30yFM5cg5nbB5xzjCGS',
      };
      finalPriceId = defaultPriceIds[planType as keyof typeof defaultPriceIds];
    }

    if (!finalPriceId) {
      return NextResponse.json(
        { error: 'Missing required field: priceId or planType' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      success_url: successUrl || 'fitfusionai://premium-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl || 'fitfusionai://premium-cancel',
      metadata: {
        user_id: userId,
      },
      // Enable automatic tax calculation if needed
      automatic_tax: {
        enabled: false,
      },
      // Subscription data
      subscription_data: {
        metadata: {
          user_id: userId,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session URL' },
        { status: 500, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      {
        url: session.url,
        sessionId: session.id,
      },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    
    // Provide more detailed error information
    const errorMessage = error?.message || 'Failed to create checkout session';
    const errorStatus = error?.statusCode || 500;
    
    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: errorStatus, headers: corsHeaders() }
    );
  }
}
