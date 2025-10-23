// Stripe Configuration
// Uses environment variables for security

export const STRIPE_CONFIG = {
  // Publishable key - safe to use in mobile apps
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51RyH7b0yFM5cg5nbQK12hRT2tph5BC8Xr4D9uceY1ZhlqWQncRTTtS7S2tv5rMyVDLrXNHOwUOM12FTEbUtbW4Iv00hGXFJNA1',
  
  // Your Stripe account ID (optional, for multi-account setups)
  stripeAccountId: process.env.EXPO_PUBLIC_STRIPE_ACCOUNT_ID || '',
  
  // Currency code
  currency: 'usd',
  
  // Country code
  countryCode: 'US',
  
  // API URL for backend calls
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://fit-fusion-backend-ui5g.vercel.app',
};

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  monthly: {
    id: process.env.EXPO_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_1RyHEb0yFM5cg5nbtjk5Cnzn',
    name: 'Monthly Premium',
    price: 5.00,
    currency: 'usd',
    interval: 'month',
    description: 'Full access to all premium features',
    features: [
      'AI-powered meal planning',
      'Advanced workout tracking',
      'Comprehensive analytics',
      'Community features',
      'Priority support'
    ]
  },
  yearly: {
    id: process.env.EXPO_PUBLIC_STRIPE_ANNUAL_PRICE_ID || 'yearly_premium',
    name: 'Yearly Premium',
    price: 50.00,
    currency: 'usd',
    interval: 'year',
    description: 'Full access to all premium features (Save 17%)',
    features: [
      'AI-powered meal planning',
      'Advanced workout tracking',
      'Comprehensive analytics',
      'Community features',
      'Priority support',
      'Exclusive yearly bonuses'
    ]
  }
};

// Promo codes
export const PROMO_CODES = {
  // Promo codes will be added later
};
