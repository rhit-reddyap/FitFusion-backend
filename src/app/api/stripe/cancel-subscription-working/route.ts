import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Use the correct Stripe secret key
const stripe = new Stripe('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', {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, customerId } = await request.json();

    if (!subscriptionId && !customerId) {
      return NextResponse.json(
        { error: 'Missing subscriptionId or customerId' },
        { status: 400 }
      );
    }

    let subscription;

    if (subscriptionId) {
      // Cancel by subscription ID
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    } else if (customerId) {
      // Find and cancel customer's active subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return NextResponse.json(
          { error: 'No active subscription found' },
          { status: 404 }
        );
      }

      subscription = await stripe.subscriptions.cancel(subscriptions.data[0].id);
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        canceled_at: subscription.canceled_at,
        current_period_end: subscription.current_period_end,
      },
      message: 'Subscription canceled successfully. You will retain access until the end of your current billing period.'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error.message },
      { status: 500 }
    );
  }
}








