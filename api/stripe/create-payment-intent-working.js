<<<<<<< HEAD
// Stripe payment intent endpoint for Vercel
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export default async function handler(req, res) {
=======
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

>>>>>>> minimal-api
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency, planId, customerId } = req.body;

<<<<<<< HEAD
    if (!amount || !currency || !planId || !customerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      metadata: {
        user_id: customerId,
        plan_id: planId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create ephemeral key for the customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: '2024-06-20' }
    );

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      customerId: customerId,
      ephemeralKey: ephemeralKey.secret,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}
=======
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
>>>>>>> minimal-api
