# FitFusion Starter (Next.js + Supabase + Stripe)

A clean base for your fitness app with auth, pages, icons, and Stripe wiring so you can deploy to Vercel.

## Quick Start

1. **Install**
   ```bash
   npm i
   npm run dev
   ```

2. **Environment**
   Copy `.env.example` to `.env` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE` (server only; set in Vercel, not the client)
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ID` (for your subscription price)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional if using Checkout only)
   - `NEXT_PUBLIC_APP_URL` (e.g., https://yourapp.vercel.app)

3. **Supabase SQL**: In the Supabase SQL editor, run the migration at `supabase/migrations/0001_init.sql` to create tables and RLS policies.

4. **Stripe Webhook**: In your Stripe Dashboard, add a webhook endpoint:
   - URL: `https://yourapp.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`
   - Copy the signing secret to `STRIPE_WEBHOOK_SECRET`.

5. **Deploy to Vercel**
   - Add the same env vars in Vercel Project Settings -> Environment Variables.
   - Push to GitHub, import the repo into Vercel, and deploy.

## Pages Included
- `/signin` – email magic link + OAuth (Google/GitHub)
- `/dashboard` – quick actions and daily overview
- `/workouts` – basic CRUD for exercises/sets (client-side for now)
- `/food` – basic food log with totals (client-side for now)
- `/analytics` – weekly metabolism placeholder
- `/communities` – sample list
- `/ai` – prompt box (premium upsell)
- `/profile` – units + account stubs

## Next Steps
- Persist workout/food data in Supabase tables included in the migration.
- Wire "Go Pro" to `/api/stripe/create-checkout-session` and pass user metadata.
- Add RLS-enabled endpoints or use Supabase client with Row Level Security.
- Build AI features (OpenAI, etc.) behind a premium check using `subscriptions` table.
