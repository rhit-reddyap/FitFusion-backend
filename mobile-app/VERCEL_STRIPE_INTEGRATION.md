# Vercel Stripe Integration Guide

Your mobile app is now configured to use your Vercel backend at: `https://fit-fusion-ai-five.vercel.app`

## Required API Endpoints

Your Vercel app needs these API endpoints for Stripe integration:

### 1. Create Payment Intent
**Endpoint:** `POST /api/stripe/create-payment-intent-working`
**Purpose:** Creates a payment intent for subscription payments

### 2. Create Subscription
**Endpoint:** `POST /api/stripe/create-subscription`
**Purpose:** Creates a new subscription for a user

### 3. Cancel Subscription
**Endpoint:** `POST /api/stripe/cancel-subscription`
**Purpose:** Cancels an existing subscription

### 4. Update Payment Method
**Endpoint:** `POST /api/stripe/update-payment-method`
**Purpose:** Updates the payment method for a subscription

### 5. Create Portal Session
**Endpoint:** `POST /api/stripe/create-portal-session`
**Purpose:** Creates a billing portal session for subscription management

## Environment Variables Needed

Make sure these are set in your Vercel dashboard:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_1RyHEb0yFM5cg5nbtjk5Cnzn
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Testing the Integration

1. **Test API Endpoints:** Use Postman or curl to test each endpoint
2. **Test Mobile App:** Try subscribing through the mobile app
3. **Check Vercel Logs:** Monitor the function logs in Vercel dashboard

## Example API Route Structure

```javascript
// pages/api/stripe/create-subscription.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { planId, paymentMethodId, customerId } = req.body;

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Create customer if doesn't exist
    let customer;
    try {
      customer = await stripe.customers.retrieve(customerId);
    } catch (error) {
      customer = await stripe.customers.create({
        id: customerId,
        metadata: { source: 'mobile_app' }
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: planId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({ subscription });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

## Next Steps

1. **Add API Routes:** Create the required API endpoints in your Vercel app
2. **Test Integration:** Test the mobile app with your Vercel backend
3. **Monitor Logs:** Check Vercel function logs for any errors
4. **Update Environment:** Make sure all Stripe keys are properly set

Your mobile app is ready to use your Vercel backend! 🚀

