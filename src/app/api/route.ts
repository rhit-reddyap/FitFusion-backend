import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Fit Fusion AI Backend API',
    status: 'running',
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

export async function POST() {
  return NextResponse.json({ 
    message: 'POST method not allowed on root',
    allowedMethods: ['GET']
  }, { status: 405 });
}
