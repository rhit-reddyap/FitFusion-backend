// pages/api/stripe/create-subscription.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, paymentMethodId, customerId } = req.body;

    // IMMEDIATE VALIDATION - Block undefined paymentMethodId before Stripe calls
    // This prevents ANY Stripe API calls with undefined payment_method
    if (paymentMethodId === undefined || paymentMethodId === null) {
      console.error('BLOCKED: paymentMethodId is undefined/null', {
        paymentMethodId,
        type: typeof paymentMethodId,
        planId,
        customerId,
        fullRequest: JSON.stringify(req.body)
      });
      return res.status(400).json({
        error: 'Missing payment method ID',
        details: 'paymentMethodId is required but was undefined or null. When using Stripe Checkout, subscriptions are created automatically via webhooks - do not call this endpoint.'
      });
    }
    
    if (typeof paymentMethodId !== 'string') {
      console.error('BLOCKED: paymentMethodId is not a string', {
        paymentMethodId,
        type: typeof paymentMethodId,
        planId,
        customerId
      });
      return res.status(400).json({
        error: 'Invalid payment method ID type',
        details: `paymentMethodId must be a string, but got ${typeof paymentMethodId}. When using Stripe Checkout, subscriptions are created automatically via webhooks.`
      });
    }
    
    if (paymentMethodId.trim() === '') {
      console.error('BLOCKED: paymentMethodId is empty string', {
        planId,
        customerId
      });
      return res.status(400).json({
        error: 'Empty payment method ID',
        details: 'paymentMethodId cannot be empty. When using Stripe Checkout, subscriptions are created automatically via webhooks.'
      });
    }
    
    // At this point, paymentMethodId is guaranteed to be a non-empty string
    console.log('✓ paymentMethodId validated:', { 
      length: paymentMethodId.length,
      type: typeof paymentMethodId,
      firstChars: paymentMethodId.substring(0, 10)
    });

    // CRITICAL: If using Stripe Checkout, this endpoint should NOT be called
    console.warn('create-subscription endpoint called - This should not be used with Stripe Checkout!', {
      planId,
      customerId,
      paymentMethodIdType: typeof paymentMethodId,
      paymentMethodIdLength: paymentMethodId?.length
    });

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

