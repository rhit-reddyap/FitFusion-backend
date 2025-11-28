// pages/api/stripe/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId, successUrl, cancelUrl } = req.body;

    // Validate required fields
    if (!priceId) {
      return res.status(400).json({ error: 'Missing required field: priceId' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'Missing required field: userId' });
    }

    // Validate Stripe key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return res.status(500).json({ error: 'Stripe is not properly configured' });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      success_url: successUrl || 'fitfusionai://premium-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl || 'fitfusionai://premium-cancel',
      metadata: {
        user_id: userId,
      },
      // Enable automatic tax calculation if needed
      automatic_tax: {
        enabled: false,
      },
      // Subscription data
      subscription_data: {
        metadata: {
          user_id: userId,
        },
      },
    });

    if (!session.url) {
      return res.status(500).json({ error: 'Failed to create checkout session URL' });
    }

    res.status(200).json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    
    // Provide more detailed error information
    const errorMessage = error?.message || 'Failed to create checkout session';
    const errorStatus = error?.statusCode || 500;
    
    res.status(errorStatus).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

