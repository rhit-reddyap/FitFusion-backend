import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const STRIPE_CONFIG = {
  monthlyPriceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_1STotm0yFM5cg5nbgDYnZ6XO',
  annualPriceId: process.env.STRIPE_ANNUAL_PRICE_ID || 'price_1STotm0yFM5cg5nbgDYnZ6XO',
  cookbookPriceId: process.env.STRIPE_COOKBOOK_PRICE_ID || 'price_1STotm0yFM5cg5nbgDYnZ6XO',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret_here',
};

export const PRICING_PLANS = {
  monthly: {
    name: 'Monthly Pro',
    price: '$9.99',
    period: 'month',
    features: [
      'Unlimited workouts',
      'Advanced analytics',
      'AI meal plans',
      'Community access',
      'Priority support'
    ],
    priceId: STRIPE_CONFIG.monthlyPriceId,
  },
  annual: {
    name: 'Annual Pro',
    price: '$99.99',
    period: 'year',
    originalPrice: '$119.88',
    savings: '17%',
    features: [
      'Everything in Monthly',
      '2 months free',
      'Exclusive content',
      'Early access to features'
    ],
    priceId: STRIPE_CONFIG.annualPriceId,
  },
  cookbook: {
    name: 'Fitness Cookbook',
    price: '$29.99',
    period: 'one-time',
    features: [
      '100+ healthy recipes',
      'Macro breakdowns',
      'Shopping lists',
      'Meal prep guides',
      'Lifetime access'
    ],
    priceId: STRIPE_CONFIG.cookbookPriceId,
  },
};

export async function createCheckoutSession({
  priceId,
  customerId,
  successUrl,
  cancelUrl,
  promoCode,
}: {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  promoCode?: string;
}) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: priceId === STRIPE_CONFIG.cookbookPriceId ? 'payment' : 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    discounts: promoCode ? [
      {
        coupon: promoCode,
      }
    ] : undefined,
  });

  return session;
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function getCustomerByEmail(email: string) {
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  return customers.data[0] || null;
}

export async function createCustomer(email: string, name?: string) {
  const customer = await stripe.customers.create({
    email,
    name,
  });

  return customer;
}

export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function validatePromoCode(code: string) {
  try {
    const coupon = await stripe.coupons.retrieve(code);
    return {
      valid: true,
      coupon,
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid promo code',
    };
  }
}