// pages/api/stripe/create-portal-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerId, returnUrl } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    // Create or retrieve customer
    let customer;
    try {
      customer = await stripe.customers.retrieve(customerId);
    } catch (error) {
      return res.status(400).json({ error: 'Customer not found' });
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl || 'https://fit-fusion-ai-five.vercel.app',
    });

    res.json({ 
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(400).json({ error: error.message });
  }
}
