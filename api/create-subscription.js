// pages/api/stripe/create-subscription.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, paymentMethodId, customerId } = req.body;

    // Create or retrieve customer
    let customer;
    try {
      customer = await stripe.customers.retrieve(customerId);
    } catch (error) {
      // Create customer if doesn't exist
      customer = await stripe.customers.create({
        id: customerId,
        metadata: { source: 'mobile_app' }
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: planId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { 
        save_default_payment_method: 'on_subscription' 
      },
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({ 
      subscription,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret 
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(400).json({ error: error.message });
  }
}
