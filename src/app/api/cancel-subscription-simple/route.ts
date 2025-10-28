import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
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
          { status: 404 }
        );
      }

      subscription = await stripe.subscriptions.cancel(subscriptions.data[0].id);
    }

    if (!subscription) {
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      );
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
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error.message },
      { status: 500 }
    );
  }
}

