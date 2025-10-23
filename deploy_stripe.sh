#!/bin/bash

# 🚀 STRIPE DEPLOYMENT SCRIPT
# This script helps you deploy your Stripe backend

echo "🚀 Starting Stripe Backend Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from your project root."
    exit 1
fi

# Check if Stripe is installed
if ! grep -q "stripe" package.json; then
    echo "📦 Installing Stripe..."
    npm install stripe
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. Please create it with your Stripe keys."
    echo "📝 Create .env.local with:"
    echo "   STRIPE_SECRET_KEY=sk_live_..."
    echo "   STRIPE_WEBHOOK_SECRET=whsec_..."
    echo "   NEXT_PUBLIC_SUPABASE_URL=..."
    echo "   SUPABASE_SERVICE_ROLE=..."
    echo ""
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🚀 Deploying to Vercel..."
vercel

echo "✅ Deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Add environment variables in Vercel dashboard"
echo "2. Set up Stripe webhooks"
echo "3. Update mobile app API URL"
echo "4. Test payments with Stripe test cards"
echo ""
echo "🎉 Your Stripe backend is ready!"


