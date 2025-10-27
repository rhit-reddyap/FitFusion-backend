// Stripe Configuration
// Uses environment variables for security

export const STRIPE_CONFIG = {
  // Publishable key - safe to use in mobile apps
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51RwPM1DWZWYqINdcEcgEasd5e7r9JmOUvgmpjn4Z51tDh0q2yAjMwDNaQEF8yu7erH6q54ETm8F99LVxg30DquUk00uPPirPAd',
  
  // Your Stripe account ID (optional, for multi-account setups)
  stripeAccountId: process.env.EXPO_PUBLIC_STRIPE_ACCOUNT_ID || '',
  
  // Currency code
  currency: 'usd',
  
  // Country code
  countryCode: 'US',
  
  // API URL for backend calls
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.245:3000',
};

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  monthly: {
    id: process.env.EXPO_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_1SMYDWDWZWYqINdc14CRwrXR',
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
    id: process.env.EXPO_PUBLIC_STRIPE_ANNUAL_PRICE_ID || 'price_1SMYDWDWZWYqINdc14CRwrXR',
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
