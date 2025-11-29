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
    const { subscriptionId, customerId } = await request.json();

    if (!subscriptionId && !customerId) {
      return NextResponse.json(
        { error: 'Missing subscriptionId or customerId' },
        { status: 400, headers: corsHeaders() }
      );
    }

    let subscription;

    if (subscriptionId) {
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    } else if (customerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return NextResponse.json(
          { error: 'No active subscription found' },
          { status: 404, headers: corsHeaders() }
        );
      }

      subscription = await stripe.subscriptions.cancel(subscriptions.data[0].id);
    }

    if (!subscription) {
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      {
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          canceled_at: subscription.canceled_at,
          current_period_end: subscription.current_period_end,
        },
        message: 'Subscription canceled successfully. You will retain access until the end of your current billing period.'
      },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error?.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

