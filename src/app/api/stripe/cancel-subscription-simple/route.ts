import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, customerId } = await request.json();

    if (!subscriptionId && !customerId) {
      return NextResponse.json(
        { error: 'Missing subscriptionId or customerId' },
        { status: 400 }
      );
    }

    // Mock successful cancellation
    const mockSubscription = {
      id: subscriptionId || 'sub_mock_123',
      status: 'canceled',
      canceled_at: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
    };

    return NextResponse.json({
      success: true,
      subscription: mockSubscription,
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








