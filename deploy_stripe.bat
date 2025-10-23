@echo off
REM 🚀 STRIPE DEPLOYMENT SCRIPT FOR WINDOWS
REM This script helps you deploy your Stripe backend

echo 🚀 Starting Stripe Backend Deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from your project root.
    pause
    exit /b 1
)

REM Check if Stripe is installed
findstr /C:"stripe" package.json >nul
if errorlevel 1 (
    echo 📦 Installing Stripe...
    npm install stripe
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  Warning: .env.local not found. Please create it with your Stripe keys.
    echo 📝 Create .env.local with:
    echo    STRIPE_SECRET_KEY=sk_live_...
    echo    STRIPE_WEBHOOK_SECRET=whsec_...
    echo    NEXT_PUBLIC_SUPABASE_URL=...
    echo    SUPABASE_SERVICE_ROLE=...
    echo.
)

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

echo 🚀 Deploying to Vercel...
vercel

echo ✅ Deployment complete!
echo.
echo 🔧 Next steps:
echo 1. Add environment variables in Vercel dashboard
echo 2. Set up Stripe webhooks
echo 3. Update mobile app API URL
echo 4. Test payments with Stripe test cards
echo.
echo 🎉 Your Stripe backend is ready!
pause


