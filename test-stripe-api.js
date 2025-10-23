// Test script to verify Stripe API endpoints
const API_BASE = 'https://fit-fusion-backend-ui5g.vercel.app';

async function testAPI() {
  console.log('Testing Stripe API endpoints...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    console.log('✅ Health endpoint working\n');
    
    // Test 2: Create payment intent (this will fail without proper auth, but we can test the endpoint)
    console.log('2. Testing create payment intent endpoint...');
    try {
      const paymentResponse = await fetch(`${API_BASE}/api/stripe/create-payment-intent-working`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 500,
          currency: 'usd',
          planId: 'price_1RyHEb0yFM5cg5nbtjk5Cnzn',
          customerId: 'test-user-id',
        }),
      });
      
      const paymentData = await paymentResponse.json();
      console.log('Payment intent response:', paymentData);
      
      if (paymentResponse.ok) {
        console.log('✅ Payment intent endpoint working\n');
      } else {
        console.log('❌ Payment intent endpoint error:', paymentData);
      }
    } catch (error) {
      console.log('❌ Payment intent endpoint error:', error.message);
    }
    
    // Test 3: Create portal session
    console.log('3. Testing create portal session endpoint...');
    try {
      const portalResponse = await fetch(`${API_BASE}/api/stripe/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: 'test-user-id',
          returnUrl: 'fitfusionai://billing-return',
        }),
      });
      
      const portalData = await portalResponse.json();
      console.log('Portal session response:', portalData);
      
      if (portalResponse.ok) {
        console.log('✅ Portal session endpoint working\n');
      } else {
        console.log('❌ Portal session endpoint error:', portalData);
      }
    } catch (error) {
      console.log('❌ Portal session endpoint error:', error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAPI();
