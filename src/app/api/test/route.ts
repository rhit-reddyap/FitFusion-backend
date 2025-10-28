import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/health',
      '/api/stripe/webhook', 
      '/api/stripe/create-checkout-session',
      '/api/create-subscription',
      '/api/create-portal-session',
      '/api/cancel-subscription-simple'
    ]
  });
}
