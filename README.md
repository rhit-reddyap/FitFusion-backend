# Fit Fusion AI - Stripe API Backend

This is the API backend for the Fit Fusion AI mobile app, providing Stripe payment processing endpoints.

## API Endpoints

- `POST /api/stripe/create-payment-intent-working` - Create payment intents
- `POST /api/stripe/create-subscription` - Create subscriptions
- `POST /api/stripe/cancel-subscription` - Cancel subscriptions
- `POST /api/stripe/update-payment-method` - Update payment methods
- `POST /api/stripe/create-portal-session` - Create billing portal sessions

## Environment Variables

Make sure these are set in Vercel:
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_ID`

## Deployment

This project is automatically deployed to Vercel when you push to the main branch.

