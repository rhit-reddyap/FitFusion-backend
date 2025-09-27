import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, planId, customerId } = await request.json();

    if (!amount || !currency || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Mock response for testing
    return NextResponse.json({
      clientSecret: `pi_test_${Date.now()}_secret_test`,
      customerId: `cus_test_${customerId}`,
      ephemeralKey: `ek_test_${Date.now()}_test`,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}








