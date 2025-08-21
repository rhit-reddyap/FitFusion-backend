# Deployment Guide (Minimal)

1. Import SQL from `supabase/` into your Supabase project.
2. Copy keys into `.env.local` and `.env`.
3. Run `./scripts/deploy.sh` to push web app to Vercel.
4. Run `./scripts/expo-publish.sh` to push mobile app via Expo.
5. Verify Stripe + Supabase connections.
