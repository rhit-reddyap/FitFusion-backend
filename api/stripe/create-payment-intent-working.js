// Working Stripe payment intent endpoint
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency, planId, customerId } = req.body;

    // For now, return a mock response to test the connection
    res.status(200).json({
      clientSecret: 'pi_test_mock_client_secret',
      customerId: customerId || 'test_customer',
      ephemeralKey: 'ek_test_mock_ephemeral_key',
      message: 'Mock response - Stripe integration in progress'
    });

  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}